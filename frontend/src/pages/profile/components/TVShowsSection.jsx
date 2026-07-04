import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sliders, Tv } from "react-feather";
import MediaSkeleton from "../../.././components/ui/MediaSkeleton";

export default function TVShowsSection({
  tv = [],
  watchlistTV = [],
  isLoading,
}) {
  const navigate = useNavigate();

  const [sortOption, setSortOption] = useState("your_rating");
  const [genreFilter, setGenreFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryType, setLibraryType] = useState("watched");

  const activeTV = libraryType === "watched" ? tv : watchlistTV;

  const genreCount = useMemo(() => {
    return activeTV.reduce((acc, show) => {
      show.genres?.forEach((genre) => {
        acc[genre.name] = (acc[genre.name] || 0) + 1;
      });
      return acc;
    }, {});
  }, [activeTV]);

  const filteredTV = useMemo(() => {
    let list = [...activeTV];

    if (genreFilter !== "All") {
      list = list.filter((show) =>
        show.genres?.some((g) => g.name === genreFilter),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (show) =>
          show.name?.toLowerCase().includes(q) ||
          show.genres?.some((g) => g.name.toLowerCase().includes(q)),
      );
    }

    switch (sortOption) {
      case "rating":
        list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case "your_rating":
        list.sort(
          (a, b) => (b.userData?.rating || 0) - (a.userData?.rating || 0),
        );
        break;
      case "title":
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "release":
        list.sort((a, b) =>
          (b.first_air_date || "").localeCompare(a.first_air_date || ""),
        );
        break;
    }
    return list;
  }, [activeTV, genreFilter, searchQuery, sortOption]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white-100">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Control Panel Side-Rail */}
        <aside className="w-full lg:w-64 flex-shrink-0 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-5 space-y-5 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 text-white-300 uppercase text-xs font-bold tracking-widest border-b border-white/[0.06] pb-3">
            <Sliders size={14} />
            <span>Show Filters</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-white-300"
              size={16}
            />
            <input
              type="text"
              placeholder="Search shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black-300/50 text-sm text-white-100 pl-9 pr-4 py-2 rounded-xl border border-white/[0.06] outline-none focus:border-purple-500/50 transition"
            />
          </div>

          {/* Configuration Menus */}
          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <label className="text-white-300 font-medium pl-1">Shelf</label>
              <select
                value={libraryType}
                onChange={(e) => setLibraryType(e.target.value)}
                className="w-full bg-black-300/50 p-2.5 rounded-xl border border-white/[0.06] outline-none text-white-100"
              >
                <option value="watched">Watched History</option>
                <option value="watchlist">Watchlist Queue</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-white-300 font-medium pl-1">
                Sort Index
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-black-300/50 p-2.5 rounded-xl border border-white/[0.06] outline-none text-white-100"
              >
                <option value="your_rating">Your Personal Rating</option>
                <option value="rating">Global TMDB Rating</option>
                <option value="release">First Air Date</option>
                <option value="title">Alphabetical Title</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-white-300 font-medium pl-1">
                Genre Segment
              </label>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="w-full bg-black-300/50 p-2.5 rounded-xl border border-white/[0.06] outline-none text-white-100"
              >
                <option value="All">All Genres</option>
                {Object.keys(genreCount).map((g) => (
                  <option key={g} value={g}>
                    {g} ({genreCount[g]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300">
              <Tv size={16} />
              <span className="text-xs font-medium">Total Series</span>
            </div>
            <span className="text-lg font-black text-purple-400">
              {isLoading ? "..." : filteredTV.length}
            </span>
          </div>
        </aside>

        {/* Right Side: Media Immersive Poster Grid */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-white/[0.03] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredTV.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl text-white-300">
              No TV series found matching choices.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredTV.map((show) => (
                <div
                  key={show.id}
                  onClick={() => navigate(`/media/tv/${show.id}`)}
                  className="group relative flex flex-col cursor-pointer bg-white/[0.01] rounded-xl overflow-hidden border border-white/[0.04] transition-all duration-300 hover:scale-[1.03] hover:border-purple-500/30 hover:shadow-2xl"
                >
                  {/* Poster Image */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black-300">
                    <img
                      src={
                        show.poster_path
                          ? `https://image.tmdb.org/t/p/w342${show.poster_path}`
                          : "/fallback.jpg"
                      }
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Floating Rating Overlay */}
                    {show.userData?.rating && (
                      <div className="absolute top-2 right-2 bg-black-300/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-black text-yellow-400 border border-white/[0.05] flex items-center gap-0.5 shadow-md">
                        ★ {show.userData.rating}
                      </div>
                    )}
                  </div>

                  {/* Info Panel Text */}
                  <div className="p-3 space-y-1 bg-gradient-to-b from-transparent to-black-300 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold leading-snug truncate text-white-100 group-hover:text-purple-400 transition-colors">
                        {show.name}
                      </h4>
                      <p className="text-[11px] text-white-300 font-medium">
                        {show.first_air_date
                          ? show.first_air_date.split("-")[0]
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
