import { useState } from "react";
import axios from "axios";
import { PrimaryButton } from "../buttons";
import { MovieCard } from "./movieCard";
import { getMovieDetails } from "../movieAPI";

export default function Recommendations() {
  const [movie, setMovie] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDetailsForRecommendations = async (movieIds) => {
    try {
      // Parallel fetch all movie details
      const details = await Promise.all(
        movieIds.map((id) => getMovieDetails(id))
      );
      setRecommendations(details);
    } catch {
      setError("Failed to load movie details.");
    }
  };

  const getRecommendations = async () => {
    if (!movie) return;
    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const res = await axios.get(
        // `http://127.0.0.1:8000/recommend?title=${encodeURIComponent(movie)}`

        `${
          import.meta.env.VITE_API_BASE_URL
        }/recommend?title=${encodeURIComponent(movie)}`
      );
      const movieIds = res.data.recommendations.map((rec) => rec.id);
      await fetchDetailsForRecommendations(movieIds);
    } catch (err) {
      setError("Movie not found or server error.");
      setRecommendations([]);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-4xl font-semibold text-white-100 mb-4">
        Recommendations
      </h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          className="w-full sm:w-[400px] px-4 py-2 rounded-md bg-black-200 text-white-100 placeholder:text-white-300 border border-white-300 focus:outline-none"
          placeholder="Enter movie title (e.g. The Godfather)"
          value={movie}
          onChange={(e) => setMovie(e.target.value)}
        />
        <PrimaryButton
          name={loading ? "Loading..." : "Get Recommendations"}
          onClick={getRecommendations}
          disabled={loading}
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {recommendations.map((movie) => (
            // (movies) => console.log(movies)
            <MovieCard key={movie.id} item={movie} />
          ))}{" "}
        </div>
      ) : (
        // <ul className="list-disc pl-5 text-white-100 space-y-2">
        //   {recommendations.map((rec) => (
        //     <li key={rec.id}>
        //       {rec.title} — ID: {rec.id}
        //     </li>
        //   ))}
        // </ul>
        !loading &&
        !error && (
          <p className="text-white-300">
            No recommendations to show. Try searching for a movie.
          </p>
        )
      )}
    </div>
  );
}
