import { ArrowRight, Info, Play, Search, User } from "react-feather";
import { useNavigate } from "react-router-dom";

import {
  usePopularMoviesInfinite,
  useTrendingMoviesInfinite,
} from "../hooks/useMoviesApi";
import {
  usePopularTVShowsInfinite,
  useTrendingTVShowsInfinite,
} from "../hooks/useTVShowsApi";

import { Black200Button } from "../buttons";
import { MovieCard } from "../components/movieCard";
import TVShowCard from "../components/tvShowCard";
import HeroSection from "../components/Home/HeroSection";
import {
  RecommendedToUser,
  // useUserRecommendations,
} from "../components/RecommendByUser";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();

  // Fetch data using infinite queries
  const { data: popularMoviesData } = usePopularMoviesInfinite();
  const { data: trendingMoviesData } = useTrendingMoviesInfinite();
  const { data: popularTVData } = usePopularTVShowsInfinite();
  const { data: trendingTVData } = useTrendingTVShowsInfinite();
  // const { loading, error, recommendations, getUserRecommendations } =
  //   useUserRecommendations();

  // useEffect(() => {
  //   getUserRecommendations();
  // }, []);

  // console.log(recommendations);

  // Flatten paginated results
  const popularMovies =
    popularMoviesData?.pages.flatMap((page) => page.results) || [];
  const trendingMovies =
    trendingMoviesData?.pages.flatMap((page) => page.results) || [];
  const popularTVShows =
    popularTVData?.pages.flatMap((page) => page.results) || [];
  const trendingTVShows =
    trendingTVData?.pages.flatMap((page) => page.results) || [];

  return (
    <>
      <HeroSection navigate={navigate} />

      <RecommendedToUser />

      {/* <Section
        title="Your Recommendations"
        subtitle="Based on your activity"
        items={recommendations}
        type="movie"
        navigateTo="/movies"
        navigate={navigate}
      /> */}

      <Section
        title="Popular Movies"
        subtitle="Most popular movies this week"
        items={popularMovies}
        type="movie"
        navigateTo="/movies"
        navigate={navigate}
      />

      <TopRankedSection
        title="Top 10 Trending Movies"
        subtitle="Most watched movies this week"
        items={trendingMovies.slice(0, 10)}
        type="movie"
      />

      <Section
        title="Popular TV Shows"
        subtitle="Most popular shows this week"
        items={popularTVShows}
        type="tv"
        navigateTo="/tvshows"
        navigate={navigate}
      />

      <TopRankedSection
        title="Top 10 Trending TV Shows"
        subtitle="Most watched shows this week"
        items={trendingTVShows.slice(0, 10)}
        type="tv"
      />
    </>
  );
}

// 🔹 Scrollable section for normal items
function Section({ title, subtitle, items, type, navigateTo, navigate }) {
  return (
    <section className="flex flex-col px-4 sm:px-6 md:px-10 py-10 gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
            {title}
          </h2>
          <p className="text-white-200 text-sm sm:text-base">{subtitle}</p>
        </div>

        {navigateTo && (
          <Black200Button
            name="See All"
            icon={ArrowRight}
            reverse={true}
            onClick={() => navigate(navigateTo)}
          />
        )}
      </div>

      {/* Horizontal scroll */}
      <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-4">
        {items.map((item) => (
          <div
            key={item.id}
            // className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px]"
          >
            {type === "movie" ? (
              <MovieCard item={item} />
            ) : (
              <TVShowCard item={item} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function TopRankedSection({ title, subtitle, items, type = "movie" }) {
  return (
    <section className="px-4 sm:px-6 md:px-10 py-10 flex flex-col gap-5">
      <div>
        <h2 className="text-white-100 text-xl sm:text-2xl font-semibold">
          {title}
        </h2>
        <p className="text-white-200 text-sm sm:text-base">{subtitle}</p>
      </div>

      <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex text-white-100 items-end">
            {/* Big translucent number */}
            <span className="font-extrabold text-[8rem] opacity-20">
              {index + 1}
            </span>

            {/* Card (movie or tv show) */}
            <div className="relative z-10">
              {type === "movie" ? (
                <MovieCard item={item} />
              ) : (
                <TVShowCard item={item} />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
