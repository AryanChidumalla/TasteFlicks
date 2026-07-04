import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight } from "react-feather";
import { useState } from "react";

import {
  usePopularMoviesInfinite,
  useRecommendedMovies,
  useTrendingMoviesInfinite,
  usePopularTVShowsInfinite,
  useTrendingTVShowsInfinite,
} from "../../hooks/useMediaQueries";

import { Black200Button } from "../../components/ui/buttons";
import { MediaCard } from "../../components/ui/MediaCard";
import HeroSection from "../../pages/home/HeroSection";
import { RecommendedToUser } from "../../pages/recommendations/RecommendedToUser";

export default function Home() {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const navigate = useNavigate();

  const { data: popularMoviesData, isLoading: loadPopMovies } =
    usePopularMoviesInfinite();
  const { data: trendingMoviesData, isLoading: loadTrendMovies } =
    useTrendingMoviesInfinite();
  const { data: popularTVData, isLoading: loadPopTV } =
    usePopularTVShowsInfinite();
  const { data: trendingTVData, isLoading: loadTrendTV } =
    useTrendingTVShowsInfinite();
  const {
    data: recommendations,
    error,
    isLoading,
    refetch,
  } = useRecommendedMovies(userId);

  const popularMovies =
    popularMoviesData?.pages.flatMap((page) => page.results) || [];
  const trendingMovies =
    trendingMoviesData?.pages.flatMap((page) => page.results) || [];
  const popularTVShows =
    popularTVData?.pages.flatMap((page) => page.results) || [];
  const trendingTVShows =
    trendingTVData?.pages.flatMap((page) => page.results) || [];

  const layoutLoading =
    loadPopMovies || loadTrendMovies || loadPopTV || loadTrendTV;

  return (
    <div className="space-y-4 pb-12">
      <HeroSection navigate={navigate} />

      {userId && (
        <RecommendedToUser
          recommendations={recommendations}
          error={error}
          isLoading={isLoading}
          userId={userId}
          onFeedUpdated={() => refetch()}
        />
      )}

      <TopTenSection
        title="Trending Now"
        subtitle="Most watched this week"
        movies={trendingMovies.slice(0, 10)}
        tvshows={trendingTVShows.slice(0, 10)}
        isLoading={layoutLoading}
      />

      <Section
        title="Popular Movies"
        subtitle="Most popular movies this week"
        items={popularMovies}
        mediaType="movie"
        navigateTo="/movies"
        navigate={navigate}
        isLoading={layoutLoading}
      />

      <Section
        title="Popular TV Shows"
        subtitle="Most popular shows this week"
        items={popularTVShows}
        mediaType="tv"
        navigateTo="/tvshows"
        navigate={navigate}
        isLoading={layoutLoading}
      />
    </div>
  );
}

function Section({
  title,
  subtitle,
  items,
  mediaType,
  navigateTo,
  navigate,
  isLoading,
}) {
  return (
    <section className="max-w-7xl mx-auto flex flex-col px-4 sm:px-6 lg:px-8 py-6 gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex gap-3">
          <div className="w-1 bg-purple-500 rounded-full" />
          <div>
            <h2 className="text-white-100 text-lg sm:text-xl font-black tracking-tight">
              {title}
            </h2>
            <p className="text-white-300 text-xs sm:text-sm">{subtitle}</p>
          </div>
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

      <div className="flex space-x-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/[0.05] select-none">
        {isLoading
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-[150px] sm:w-[180px] aspect-[2/3] bg-white/[0.03] rounded-xl flex-shrink-0 animate-pulse"
              />
            ))
          : items.map((item) => (
              <div
                key={item.id}
                className="w-[150px] sm:w-[180px] flex-shrink-0"
              >
                <MediaCard item={item} mediaType={mediaType} />
              </div>
            ))}
      </div>
    </section>
  );
}

function TopTenSection({ title, subtitle, movies, tvshows, isLoading }) {
  const [activeTab, setActiveTab] = useState("movies");

  const tabs = [
    { label: "Movies", key: "movies", items: movies, type: "movie" },
    { label: "TV Shows", key: "tvshows", items: tvshows, type: "tv" },
  ];

  const currentTab = tabs.find((t) => t.key === activeTab);

  return (
    <section className="max-w-7xl mx-auto flex flex-col px-4 sm:px-6 lg:px-8 py-6 gap-4">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] pb-2">
        <div className="flex gap-3">
          <div className="w-1 bg-purple-500 rounded-full" />
          <div>
            <h2 className="text-white-100 text-lg sm:text-xl font-black tracking-tight">
              {title}
            </h2>
            <p className="text-white-300 text-xs sm:text-sm">{subtitle}</p>
          </div>
        </div>

        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-2 text-xs uppercase tracking-wider font-bold transition-colors ${
                activeTab === tab.key
                  ? "text-purple-400"
                  : "text-white-300 hover:text-white-100"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-purple-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/[0.05]">
        {isLoading
          ? [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-[200px] aspect-[2/3] bg-white/[0.03] rounded-xl flex-shrink-0 animate-pulse"
              />
            ))
          : currentTab.items.map((item, index) => (
              <div
                key={item.id}
                className="flex text-white-100 items-center flex-shrink-0 group relative pl-6"
              >
                <span className="font-black text-[7.5rem] tracking-tighter text-white-200/10 absolute left-0 bottom-[-1.5rem] leading-none select-none group-hover:text-purple-500/20 transition-colors duration-300">
                  {index + 1}
                </span>
                <div className="relative z-10 w-[140px] sm:w-[160px] transition-transform duration-300 group-hover:scale-[1.02]">
                  <MediaCard item={item} mediaType={currentTab.type} />
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
