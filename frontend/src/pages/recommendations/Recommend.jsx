import React, { useState } from "react";
import axios from "axios";
import { Search } from "react-feather";
import { PrimaryButton } from "../../components/ui/buttons";
import { MediaCard } from "../../components/ui/MediaCard";
import { getMovieDetails } from "../../services/tmdb/api";

export default function Recommendations() {
  const [movie, setMovie] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getRecommendations = async (e) => {
    if (e) e.preventDefault();
    const trimmedMovie = movie.trim();
    if (!trimmedMovie) return;

    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/recommend?title=${encodeURIComponent(trimmedMovie)}`,
      );

      const movieIds = res.data.recommendations?.map((rec) => rec.id) || [];

      if (movieIds.length === 0) {
        setError(`No direct recommendations found for "${trimmedMovie}".`);
        setLoading(false);
        return;
      }

      // Parallel fetch full details from backend payload mapping
      const details = await Promise.all(
        movieIds.map((id) => getMovieDetails(id)),
      );
      setRecommendations(details.filter(Boolean));
    } catch (err) {
      console.error(err);
      setError("Cinematic server error or movie not identified.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white-100 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white-100 to-white-300 bg-clip-text text-transparent">
          AI Recommendations
        </h1>
        <p className="text-xs sm:text-sm text-white-300">
          Enter a film you love, and our algorithms will generate a matched
          watchlist catalog.
        </p>
      </div>

      {/* Premium Search Form Bar */}
      <form
        onSubmit={getRecommendations}
        className="flex flex-col sm:flex-row gap-3 max-w-xl"
      >
        <div className="relative flex-1 group">
          <Search
            size={16}
            className="absolute left-3.5 top-3 text-white-300 group-focus-within:text-purple-400"
          />
          <input
            type="text"
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white-100 placeholder-white-300/40 outline-none focus:bg-black-300 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 transition duration-300"
            placeholder="Enter reference movie (e.g., The Godfather)"
            value={movie}
            onChange={(e) => setMovie(e.target.value)}
          />
        </div>
        <PrimaryButton
          name={loading ? "Analyzing..." : "Generate Feed"}
          type="submit"
          disabled={loading}
        />
      </form>

      {/* Conditional Status Blocks */}
      {error && (
        <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl text-xs font-semibold text-red-400 max-w-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-white/[0.03] border border-white/[0.04] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="transition-transform duration-300 hover:scale-[1.02]"
            >
              <MediaCard item={item} mediaType="movie" />
            </div>
          ))}
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="text-center py-20 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl text-white-300 text-xs tracking-wide">
            Awaiting input metrics. Specify a film anchor item above.
          </div>
        )
      )}
    </div>
  );
}
