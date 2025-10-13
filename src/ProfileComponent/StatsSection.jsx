import { useSelector } from "react-redux";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { getMediaByPreference } from "../supabasePreferences";
import { getMovieDetails, getTVShowDetails } from "../movieAPI";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
];

export default function StatsSection() {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const [movieGenres, setMovieGenres] = useState({});
  const [tvGenres, setTVGenres] = useState({});

  useEffect(() => {
    async function fetchStats() {
      if (!userId) return;

      // Fetch liked movies & TV shows
      const likedMovieIds = await getMediaByPreference(userId, "like", "movie");
      const likedTVIds = await getMediaByPreference(userId, "like", "tv");

      const movies = await Promise.all(likedMovieIds.map(getMovieDetails));
      const tvShows = await Promise.all(likedTVIds.map(getTVShowDetails));

      const movieGenreCount = {};
      movies.forEach((m) =>
        m.genres?.forEach(
          (g) => (movieGenreCount[g.name] = (movieGenreCount[g.name] || 0) + 1)
        )
      );
      setMovieGenres(movieGenreCount);

      const tvGenreCount = {};
      tvShows.forEach((t) =>
        t.genres?.forEach(
          (g) => (tvGenreCount[g.name] = (tvGenreCount[g.name] || 0) + 1)
        )
      );
      setTVGenres(tvGenreCount);
    }

    fetchStats();
  }, [userId]);

  const formatData = (genreMap) =>
    Object.entries(genreMap).map(([name, value]) => ({ name, value }));

  return (
    <section className="p-6 md:p-10">
      <h2 className="text-3xl font-semibold text-white-100 mb-6">Your Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.keys(movieGenres).length > 0 && (
          <div className="bg-black-200 p-4 rounded">
            <h3 className="text-xl font-semibold text-white-100 mb-2">
              Movie Genres
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={formatData(movieGenres)}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {formatData(movieGenres).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {Object.keys(tvGenres).length > 0 && (
          <div className="bg-black-200 p-4 rounded">
            <h3 className="text-xl font-semibold text-white-100 mb-2">
              TV Show Genres
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={formatData(tvGenres)}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  fill="#82ca9d"
                  label
                >
                  {formatData(tvGenres).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
