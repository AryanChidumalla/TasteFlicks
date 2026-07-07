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
    not_interested: bool = False

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
# ⚙️ CONFIGURATION TOGGLE
# ==========================================
# Set to True for the new, single, pre-cleaned Google Colab CSV.
# Set to False to go back to the original 2 TMDB CSV files with string-JSON arrays.
USE_NEW_DATASET = True 

# ==========================================
# 🛠️ GLOBAL STARTUP: DATA CLEANING & MODEL
# ==========================================
print(f"Loading and preparing dataset (Using New Layout: {USE_NEW_DATASET})...")

if USE_NEW_DATASET:
    # --- 🟢 NEW DATASET PIPELINE ---
    movies = pd.read_csv("curated_movies_dataset.csv") # 👈 Your downloaded Colab file name
    
    # Filter out obscure or unrated movies early
    movies = movies[(movies["vote_average"] > 0) & (movies["vote_count"] >= 10)].reset_index(drop=True)

    def clean_comma_string(x):
        if isinstance(x, str):
            return [item.strip().lower().replace(" ", "") for item in x.split(",")]
        return []

    def clean_text(x):
        if isinstance(x, str):
            return x.lower().replace(" ", "")
        return ""

    movies["cleaned_genres"] = movies["genres"].apply(clean_comma_string)
    movies["cleaned_keywords"] = movies["keywords"].apply(clean_comma_string)
    movies["cleaned_cast"] = movies["cast"].apply(clean_comma_string).apply(lambda x: x[:3])
    movies["cleaned_director"] = movies["director"].apply(clean_text)

    def create_soup_new(row):
        director = row["cleaned_director"]
        cast = " ".join(row["cleaned_cast"])
        genres = " ".join(row["cleaned_genres"])
        keywords = " ".join(row["cleaned_keywords"])
        return f"{director} {cast} {genres} {keywords}"

    movies["soup"] = movies.apply(create_soup_new, axis=1)

else:
    # --- 🔴 PREVIOUS 2-CSV PIPELINE ---
    movies = pd.read_csv("tmdb_5000_movies.csv")
    credits = pd.read_csv("tmdb_5000_credits.csv")

    credits = credits.rename(columns={"movie_id": "id"})
    movies = movies.merge(credits[["id", "cast", "crew"]], on="id", how="left")
    movies = movies[(movies["vote_average"] > 0) & (movies["vote_count"] >= 10)].reset_index(drop=True)

    features = ["cast", "crew", "keywords", "genres"]
    for feature in features:
        movies[feature] = movies[feature].fillna("[]").apply(literal_eval)

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

    def clean_data(x):
        if isinstance(x, list):
            return [i.lower().replace(" ", "") for i in x]
        elif isinstance(x, str):
            return x.lower().replace(" ", "")
        return ""

    for feature in ["cast", "genres", "keywords", "director"]:
        movies[feature] = movies[feature].apply(clean_data)

    def create_soup_old(row):
        weighted_director = " ".join([row["director"]])
        weighted_cast = " ".join(row["cast"])
        return (
            weighted_director + " " +
            weighted_cast + " " +
            " ".join(row["genres"]) + " " +
            " ".join(row["keywords"])
        )

    movies["soup"] = movies.apply(create_soup_old, axis=1)

# --- UNIFIED MODEL INITIALIZATION ---
print("Vectorizing text metadata soup...")
movies["overview"] = movies["overview"].fillna("")
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
        excluded_ids.add(movie.id)

        if movie.not_interested:
            continue
            
        idx = id_to_index.get(movie.id)
        if idx is None:
            continue

        indices.append(idx)
        ratings.append(movie.rating)

    print(f"Using {len(indices)} vectors for taste profile modeling. Excluding {len(excluded_ids)} movies.")

    if not indices:
        return {
            "status": "not_found",
            "message": "No valid rated movies found.",
            "recommendations": []
        }

    ratings = np.array(ratings, dtype=float)

    rating_to_weight = {
        10: 1.0, 9: 0.9, 8: 0.7, 7: 0.5, 6: 0.2,
        5: 0.0, 4: -0.2, 3: -0.5, 2: -0.7, 1: -1.0,
    }

    weights = np.array(
        [rating_to_weight.get(int(r), 0.0) for r in ratings],
        dtype=float,
    )

    movie_vectors = tfidf_matrix[indices].toarray()
    user_profile = np.sum(movie_vectors * weights[:, np.newaxis], axis=0)

    if np.linalg.norm(user_profile) == 0:
        user_profile = np.asarray(tfidf_matrix.mean(axis=0)).reshape(1, -1)
    else:
        user_profile = user_profile.reshape(1, -1)

    similarity_scores = cosine_similarity(user_profile, tfidf_matrix).flatten()

    movies_copy = movies.copy()
    movies_copy["similarity"] = similarity_scores

    normalized_rating = movies_copy["vote_average"].fillna(0) / 10.0
    movies_copy["final_score"] = (0.7 * movies_copy["similarity"]) + (0.3 * normalized_rating)

    recommendations_df = movies_copy[~movies_copy["id"].isin(excluded_ids)]
    top_results = recommendations_df.sort_values("final_score", ascending=False).head(10)

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