import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getMediaByPreference } from "../supabasePreferences";
import { getMovieDetails, getTVShowDetails } from "../movieAPI";
import { setUserData } from "../redux/userSlice";

export default function OverviewSection() {
  const user = useSelector((state) => state.user.user);
  const userData = useSelector((state) => state.user.data);
  const userId = user?.id;

  // Use Redux data first, fallback to empty
  const movieGenres = userData?.movieGenres || {};
  const tvGenres = userData?.tvGenres || {};
  const movieStats = userData?.movieStats || {};
  const tvStats = userData?.tvStats || {};

  // console.log(movieGenres);

  // Genre chips
  const renderGenres = (title, genreMap) => (
    <div>
      <h2 className="text-xl font-semibold text-white-100 mb-2">{title}</h2>
      {Object.keys(genreMap).length === 0 ? (
        <p className="text-white-300 mb-4">No genres explored yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-6 max-w-full">
          {Object.entries(genreMap).map(([genre, count]) => (
            <span
              key={genre}
              className="bg-black-200 border border-black-300 text-white-100 px-3 py-1 rounded-full text-sm"
            >
              {genre}: {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // Stats summary box
  const renderStats = (stats) => {
    if (!stats || Object.keys(stats).length === 0) return null;

    return (
      <div className="bg-black-200 border border-black-300 text-white-100 p-5 rounded text-sm flex items-start justify-between flex-wrap gap-4">
        <div className="flex flex-col items-center min-w-[90px]">
          <div className="font-bold text-lg">{stats.total}</div>
          <div>Total Watched</div>
        </div>

        {stats.hoursWatched > 24 ? (
          <div className="flex flex-col items-center min-w-[90px]">
            <div className="font-bold text-lg">
              {Math.round(stats.hoursWatched / 24)}
            </div>
            <div>Days Watched</div>
          </div>
        ) : (
          <div className="flex flex-col items-center min-w-[90px]">
            <div className="font-bold text-lg">{stats.hoursWatched}</div>
            <div>Hours Watched</div>
          </div>
        )}

        <div className="flex flex-col items-center min-w-[90px]">
          <div className="font-bold text-lg">{stats.watchlistCount}</div>
          <div>In Watchlist</div>
        </div>
      </div>
    );
  };

  return (
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold text-white-100 mb-6">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderGenres("Movies", movieGenres)}
        {renderGenres("TV Shows", tvGenres)}
        {renderStats(movieStats)}
        {renderStats(tvStats)}
      </div>
    </section>
  );
}
