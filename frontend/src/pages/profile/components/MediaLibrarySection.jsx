import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sliders, Film, Tv, Star, CheckCircle, Bookmark, Eye } from "react-feather";
import MediaSkeleton from "../../../components/ui/MediaSkeleton";

export default function MediaLibrarySection({
  items = [],
  watchlistItems = [],
  isLoading = false,
  mediaType = "movie", // "movie" | "tv"
}) {
  const navigate = useNavigate();
  const isMovie = mediaType === "movie";
  const MediaIcon = isMovie ? Film : Tv;
  const singularLabel = isMovie ? "Movie" : "TV Show";
  const pluralLabel = isMovie ? "Movies" : "TV Shows";

  const [sortOption, setSortOption] = useState("your_rating");
  const [genreFilter, setGenreFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryType, setLibraryType] = useState("watched");

  const activeItems = libraryType === "watched" ? items : watchlistItems;

  const genreCount = useMemo(() => {
    return activeItems.reduce((acc, item) => {
      item.genres?.forEach((genre) => {
        acc[genre.name] = (acc[genre.name] || 0) + 1;
      });
      return acc;
    }, {});
  }, [activeItems]);

  const filteredItems = useMemo(() => {
    let list = [...activeItems];

    if (genreFilter !== "All") {
      list = list.filter((item) =>
        item.genres?.some((g) => g.name === genreFilter),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => {
        const title = (item.title || item.name || "").toLowerCase();
        const matchesTitle = title.includes(q);
        const matchesGenre = item.genres?.some((g) =>
          g.name.toLowerCase().includes(q),
        );
        return matchesTitle || matchesGenre;
      });
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
        list.sort((a, b) => {
          const nameA = a.title || a.name || "";
          const nameB = b.title || b.name || "";
          return nameA.localeCompare(nameB);
        });
        break;
      case "release":
        list.sort((a, b) => {
          const dateA = a.release_date || a.first_air_date || "";
          const dateB = b.release_date || b.first_air_date || "";
          return dateB.localeCompare(dateA);
        });
        break;
      default:
        break;
    }
    return list;
  }, [activeItems, genreFilter, searchQuery, sortOption]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white-100">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-5 space-y-5 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 text-white-300 uppercase text-xs font-bold tracking-widest border-b border-white/[0.06] pb-3">
            <Sliders size={14} />
            <span>{pluralLabel} Filters</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-white-300"
              size={16}
            />
            <input
              type="text"
              placeholder={`Search ${pluralLabel.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black-300/50 text-sm text-white-100 pl-9 pr-4 py-2 rounded-xl border border-white/[0.06] outline-none focus:border-purple-500/50 transition placeholder-white-300/40"
            />
          </div>

          {/* Shelf and Sort Controls */}
          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <label className="text-white-300 font-medium pl-1">Shelf</label>
              <select
                value={libraryType}
                onChange={(e) => setLibraryType(e.target.value)}
                className="w-full bg-black-300/50 p-2.5 rounded-xl border border-white/[0.06] outline-none text-white-100"
              >
                <option value="watched">Watched History ({items.length})</option>
                <option value="watchlist">Watchlist Queue ({watchlistItems.length})</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-white-300 font-medium pl-1">
                Sort By
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-black-300/50 p-2.5 rounded-xl border border-white/[0.06] outline-none text-white-100"
              >
                <option value="your_rating">Your Personal Rating</option>
                <option value="rating">TMDB Community Rating</option>
                <option value="release">Release Date</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Genre Tag Filters */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-white-300 font-medium pl-1">
              <span>Filter by Genre</span>
              {genreFilter !== "All" && (
                <button
                  onClick={() => setGenreFilter("All")}
                  className="text-purple-400 hover:underline text-[11px]"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setGenreFilter("All")}
                className={`px-2.5 py-1 rounded-lg text-xs transition ${
                  genreFilter === "All"
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                    : "bg-white/[0.02] border border-white/[0.04] text-white-300 hover:bg-white/[0.05]"
                }`}
              >
                All ({activeItems.length})
              </button>
              {Object.entries(genreCount)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <button
                    key={name}
                    onClick={() => setGenreFilter(name)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition ${
                      genreFilter === name
                        ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                        : "bg-white/[0.02] border border-white/[0.04] text-white-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    {name} ({count})
                  </button>
                ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-white-200">
              <MediaIcon size={18} className="text-purple-400" />
              <span>
                {libraryType === "watched" ? "Watched" : "Watchlist"}{" "}
                {pluralLabel}
              </span>
              <span className="text-xs text-white-300 font-normal">
                ({filteredItems.length} items)
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <MediaSkeleton key={i} />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const title = item.title || item.name;
                const releaseYear = (
                  item.release_date ||
                  item.first_air_date ||
                  ""
                ).slice(0, 4);
                const userRating = item.userData?.rating;

                return (
                  <div
                    key={`${mediaType}-${item.id}`}
                    onClick={() => navigate(`/media/${mediaType}/${item.id}`)}
                    className="group flex gap-4 p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-purple-500/30 rounded-2xl transition cursor-pointer"
                  >
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                          : "/fallback.jpg"
                      }
                      alt={title}
                      className="w-16 h-24 object-cover rounded-xl flex-shrink-0 group-hover:scale-[1.02] transition"
                      loading="lazy"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-semibold text-sm text-white-100 group-hover:text-purple-300 transition truncate">
                          {title}
                        </h4>
                        <p className="text-xs text-white-300 mt-0.5">
                          {releaseYear || "—"} • {item.genres?.[0]?.name || singularLabel}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs pt-2">
                        {userRating ? (
                          <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                            <Star size={12} fill="currentColor" />
                            <span>{userRating}/10</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-white-300">
                            <Eye size={12} />
                            <span>Watched</span>
                          </div>
                        )}

                        {item.vote_average > 0 && (
                          <span className="text-white-300 text-[11px]">
                            TMDB: {item.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl space-y-3">
              <MediaIcon size={32} className="mx-auto text-white-300/40" />
              <p className="text-sm font-medium text-white-200">
                No {pluralLabel.toLowerCase()} found in this view
              </p>
              <p className="text-xs text-white-300 max-w-sm mx-auto">
                {searchQuery || genreFilter !== "All"
                  ? "Try resetting your search or genre filters."
                  : `You haven't added any ${pluralLabel.toLowerCase()} to this shelf yet.`}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
