import os
import numpy as np
import pandas as pd
from ast import literal_eval

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(
    title="Advanced Movie Recommendation API",
    version="2.0.0",
)

class MovieRating(BaseModel):
    id: int
    rating: float
    not_interested: bool = False # ⚡ Add this new optional flag

class RecommendationRequest(BaseModel):
    ratings: list[MovieRating]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 🛠️ GLOBAL STARTUP: DATA CLEANING & MODEL
# ==========================================
print("Loading and preparing dataset...")
movies = pd.read_csv("tmdb_5000_movies.csv")
credits = pd.read_csv("tmdb_5000_credits.csv")

# Merge datasets safely on ID
credits = credits.rename(columns={"movie_id": "id"})
movies = movies.merge(credits[["id", "cast", "crew"]], on="id", how="left")

# 🔥 FIX: Filter out obscure or unrated movies early
# Only keep movies with a score higher than 0 and a decent vote count (e.g., at least 10 votes)
movies = movies[(movies["vote_average"] > 0) & (movies["vote_count"] >= 10)].reset_index(drop=True)

# Parse stringified lists
features = ["cast", "crew", "keywords", "genres"]
for feature in features:
    movies[feature] = movies[feature].fillna("[]").apply(literal_eval)

# Helper extraction functions
def get_director(crew):
    for person in crew:
        if person["job"] == "Director":
            return person["name"]
    return ""

def get_list(x, limit=None):
    if isinstance(x, list):
        names = [i["name"] for i in x]
        return names[:limit] if limit else names
    return []

movies["director"] = movies["crew"].apply(get_director)
movies["cast"] = movies["cast"].apply(lambda x: get_list(x, limit=3))
movies["genres"] = movies["genres"].apply(get_list)
movies["keywords"] = movies["keywords"].apply(get_list)

# Normalize text features
def clean_data(x):
    if isinstance(x, list):
        return [i.lower().replace(" ", "") for i in x]
    elif isinstance(x, str):
        return x.lower().replace(" ", "")
    return ""

for feature in ["cast", "genres", "keywords", "director"]:
    movies[feature] = movies[feature].apply(clean_data)

movies["overview"] = movies["overview"].fillna("")

# Create the text soup
def create_soup(row):
    # 1. Take all genres the movie has and repeat them equally (e.g., 5 times each)
    # This boosts ALL genres you care about, not just one, giving them a massive head start
    weighted_genres = " ".join(row["genres"] * 1)
    
    weighted_director = " ".join([row["director"]])
    weighted_cast = " ".join(row["cast"])
    
    # 2. Keep the overview at the end. 
    # Because genres are repeated 5x, the overview words act ONLY as subtle tie-breakers 
    # to differentiate between two action movies, preventing the "Drama-only" or "blank movie" trap.
    return (
        weighted_director + " " +
        weighted_cast + " " +
        " ".join(row["genres"]) + " " +
        " ".join(row["keywords"])
    )

movies["soup"] = movies.apply(create_soup, axis=1)

# Fit Vectorizer and cache matrix globally
print("Vectorizing text metadata soup...")
tfidf = TfidfVectorizer(stop_words="english")
tfidf_matrix = tfidf.fit_transform(movies["soup"])

id_to_index = {
    movie_id: idx
    for idx, movie_id in enumerate(movies["id"])
}

print("✅ System ready.")

# ==========================================
# 🚀 ENDPOINT: DYNAMIC RECOMMENDATIONS
# ==========================================
@app.post("/recommend/by_user")
def recommend_by_user(request: RecommendationRequest):

    indices = []
    ratings = []

    excluded_ids = set()

    for movie in request.ratings:
        # Add to absolute exclusion set if explicitly flagged or low rated
        if movie.not_interested:
            print(movie.id)
            excluded_ids.add(movie.id)
            continue
            
        idx = id_to_index.get(movie.id)
        if idx is None:
            continue

        indices.append(idx)
        ratings.append(movie.rating)
        excluded_ids.add(movie.id) # Also exclude already rated items

    print(f"Using {len(indices)} of {len(request.ratings)} rated movies.")

    if not indices:
        return {
            "status": "not_found",
            "message": "No valid rated movies found.",
            "recommendations": []
        }

    ratings = np.array(ratings, dtype=float)

    rating_to_weight = {
        10: 1.0,
        9: 0.9,
        8: 0.7,
        7: 0.5,
        6: 0.2,
        5: 0.0,
        4: -0.2,
        3: -0.5,
        2: -0.7,
        1: -1.0,
    }

    weights = np.array(
        [rating_to_weight.get(int(r), 0.0) for r in ratings],
        dtype=float,
    )

    movie_vectors = tfidf_matrix[indices].toarray()

    user_profile = np.sum(
        movie_vectors * weights[:, np.newaxis],
        axis=0,
    )

    if np.linalg.norm(user_profile) == 0:
        user_profile = np.asarray(tfidf_matrix.mean(axis=0)).reshape(1, -1)
    else:
        user_profile = user_profile.reshape(1, -1)

    similarity_scores = cosine_similarity(
        user_profile,
        tfidf_matrix
    ).flatten()

    movies_copy = movies.copy()
    movies_copy["similarity"] = similarity_scores

    normalized_rating = (
        movies_copy["vote_average"].fillna(0) / 10.0
    )

    movies_copy["final_score"] = (
        0.7 * movies_copy["similarity"] +
        0.3 * normalized_rating
    )

    recommendations_df = movies_copy[
        ~movies_copy["id"].isin(excluded_ids)
    ]

    top_results = (
        recommendations_df
        .sort_values("final_score", ascending=False)
        .head(10)
    )

    recommendations = top_results[
        ["title", "id", "vote_average", "final_score"]
    ].to_dict(orient="records")

    return {
        "status": "success",
        "recommendations": recommendations,
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)