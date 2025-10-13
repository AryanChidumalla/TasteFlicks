import { ArrowRight, Play, Search, User } from "react-feather";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePopularMovies, useTrendingMovies } from "../hooks/useMoviesApi";
import { usePopularTVShows, useTrendingTVShows } from "../hooks/useTVShowsApi";

import { Black100Button, Black200Button, PrimaryButton } from "../buttons";

import { MovieCard } from "../components/movieCard";
import TVShowCard from "../components/tvShowCard";
import { searchMulti } from "../movieAPI";

export default function Home() {
  const navigate = useNavigate();

  const { data: popularMoviesData } = usePopularMovies(1);
  const { data: trendingMoviesData } = useTrendingMovies(1);
  const { data: popularTVData } = usePopularTVShows(1);
  const { data: trendingTVData } = useTrendingTVShows(1);

  return (
    <>
      <HeroSection navigate={navigate} />

      <Section
        title="Popular Movies"
        subtitle="Most popular movies this week"
        items={popularMoviesData?.results || []}
        type="movie"
        navigateTo="/movies"
        navigate={navigate}
      />

      <Section
        title="Popular TV Shows"
        subtitle="Most popular shows this week"
        items={popularTVData?.results || []}
        type="tv"
        navigateTo="/tvshows"
        navigate={navigate}
      />

      <Section
        title="Trending Movies"
        subtitle="Most watched movies this week"
        items={trendingMoviesData?.results || []}
        type="movie"
        navigateTo="/movies"
        navigate={navigate}
      />

      <Section
        title="Trending TV Shows"
        subtitle="Most watched shows this week"
        items={trendingTVData?.results || []}
        type="tv"
        navigateTo="/tvshows"
        navigate={navigate}
      />
    </>
  );
}

function HeroSection({ navigate }) {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    const data = await searchMulti(searchText);
    setSearchResults(data.results || []);
    setShowAllResults(false);
  };

  const visibleResults = showAllResults
    ? searchResults
    : searchResults.slice(0, 5);

  return (
    <section
      className="bg-gradient-to-r from-black-100 via-[#1F1A4D] to-primary-300 flex items-center justify-center flex-col gap-10 px-4 sm:px-6 md:px-10"
      style={{ height: "calc(100vh - 5rem)" }}
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-white-100 leading-snug">
        Discover Your Next <br />
        <span className="text-primary-100">Binge-Worthy Adventure</span>
      </h1>

      <h2 className="text-lg sm:text-xl md:text-2xl text-center text-white-100 leading-relaxed">
        Find movies and TV shows across all streaming platforms. Track what
        you've watched and get personalized recommendations.
      </h2>

      {searchResults.length > 0 && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setSearchText("");
            setSearchResults([]);
          }}
        />
      )}

      <div className="relative z-20 w-full max-w-md">
        <div className="flex bg-black-100 border border-black-300 rounded-md w-full">
          <input
            type="text"
            placeholder="Search for movies or TV shows"
            className="text-white-100 px-5 py-2.5 w-full bg-black-100 focus:outline-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Black200Button name="Search" icon={Search} onClick={handleSearch} />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-black-100 border border-black-300 rounded-md max-h-96 overflow-y-auto shadow-lg">
            {visibleResults.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-4 py-2 hover:bg-black-300 cursor-pointer transition-colors"
                onClick={() =>
                  navigate(
                    item.media_type === "movie"
                      ? `/movie/${item.id}`
                      : `/tvshows/${item.id}`
                  )
                }
              >
                <img
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                      : "https://via.placeholder.com/92x138?text=No+Image"
                  }
                  alt={item.title || "No Title"}
                  className="w-12 h-18 object-cover rounded-sm"
                />
                <div className="text-white-100 flex-1">
                  <div className="font-medium">
                    {item.title || item.name || "Untitled"}
                  </div>
                  <div className="text-sm text-white-300">
                    {item.release_date
                      ? item.release_date.slice(0, 4)
                      : "Unknown Year"}
                  </div>
                </div>
                <div className="text-sm px-2 py-0.5 bg-black-200 border border-black-300 text-white-100 rounded">
                  {item.media_type === "movie" ? "Movie" : "TV Show"}
                </div>
              </div>
            ))}

            {!showAllResults && searchResults.length > 5 && (
              <div
                className="px-4 py-2 text-primary-100 hover:bg-black-300 cursor-pointer border-t border-black-300 transition-colors"
                onClick={() =>
                  navigate(`/search?query=${encodeURIComponent(searchText)}`)
                }
              >
                Show all results...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <PrimaryButton
          name="Start Exploring"
          icon={Play}
          onClick={() => navigate("/explore")}
        />
        <Black100Button
          name="Sign In"
          icon={User}
          onClick={() => navigate("/signin")}
        />
      </div>
    </section>
  );
}

function Section({ title, subtitle, items, type, navigateTo, navigate }) {
  const visibleItems = useResponsiveSlice(items);

  return (
    <section className="flex flex-col px-4 sm:px-6 md:px-10 py-10 gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
            {title}
          </h2>
          <p className="text-white-200 text-sm sm:text-base">{subtitle}</p>
        </div>
        <Black200Button
          name="See All"
          icon={ArrowRight}
          reverse={true}
          onClick={() => navigate(navigateTo)}
        />
      </div>

      <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visibleItems.map((item) =>
          type === "movie" ? (
            <MovieCard key={item.id} item={item} />
          ) : (
            <TVShowCard key={item.id} item={item} />
          )
        )}
      </div>
    </section>
  );
}

function useResponsiveSlice(items, mobileLimit = 4, desktopLimit = 6) {
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const update = () => {
      const isMobile = window.innerWidth < 640;
      setVisibleItems(items.slice(0, isMobile ? mobileLimit : desktopLimit));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [items, mobileLimit, desktopLimit]);

  return visibleItems;
}
