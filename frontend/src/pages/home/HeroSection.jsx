import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Info, Star } from "react-feather";
import { useTrendingMediaInfinite } from "../../hooks/useMediaQueries";
import { useGenres } from "../../services/tmdb/api";
import { GlassButton } from "../../components/ui/buttons";

import "swiper/css";
import "swiper/css/autoplay";

export default function HeroSection({ navigate }) {
  const { data: trendingMediaData } = useTrendingMediaInfinite();
  const genres = useGenres();

  const trendingMedia =
    trendingMediaData?.pages.flatMap((page) => page.results) || [];

  const getGenreName = (id) => genres.find((g) => g.id === id)?.name || null;

  if (!trendingMedia.length) {
    return (
      <div className="max-w-7xl mx-auto aspect-[2/3] md:aspect-[16/6] bg-white/[0.02] rounded-2xl animate-pulse mt-4" />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="rounded-2xl overflow-hidden border border-white/[0.05]"
      >
        {trendingMedia.slice(0, 6).map((media) => {
          const backdrop = media.backdrop_path
            ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
            : "";
          const poster = media.poster_path
            ? `https://image.tmdb.org/t/p/original${media.poster_path}`
            : "";

          return (
            <SwiperSlide key={media.id}>
              {/* Responsive Layout via Utility Classes, avoiding JS layout calculation shifts */}
              <div className="relative w-full aspect-[2/3] md:aspect-[16/6] bg-black-300 overflow-hidden group">
                {/* Mobile Poster Image Render */}
                <img
                  src={poster}
                  alt=""
                  className="block md:hidden absolute inset-0 w-full h-full object-cover"
                />

                {/* Desktop Backdrop Image Render */}
                <img
                  src={backdrop}
                  alt=""
                  className="hidden md:block absolute inset-0 w-full h-full object-cover"
                />

                {/* Shaded Ambient Overlay scrim */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black-100/95 via-black-100/60 to-transparent p-6 md:p-12 flex flex-col justify-end md:justify-center">
                  <div className="max-w-xl space-y-3 sm:space-y-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none text-white-100">
                      {media.title || media.name}
                    </h2>

                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white-300 flex-wrap">
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        <Star size={14} className="fill-current" />
                        <span className="font-bold ml-1">
                          {media?.vote_average
                            ? media.vote_average.toFixed(1)
                            : "NR"}
                        </span>
                      </div>
                      <span>•</span>
                      <span>
                        {media.media_type === "movie"
                          ? media.release_date?.slice(0, 4)
                          : media.first_air_date?.slice(0, 4) || "—"}
                      </span>
                      {media.genre_ids
                        ?.slice(0, 2)
                        .map(getGenreName)
                        .filter(Boolean)
                        .map((genre) => (
                          <React.Fragment key={genre}>
                            <span>•</span>
                            <span className="text-purple-300">{genre}</span>
                          </React.Fragment>
                        ))}
                    </div>

                    <p className="text-xs sm:text-sm text-white-300 line-clamp-3 leading-relaxed font-normal">
                      {media.overview || "No descriptive overview recorded."}
                    </p>

                    <div className="pt-2">
                      <GlassButton
                        name="More Info"
                        icon={Info}
                        onClick={() =>
                          navigate(
                            media.media_type === "movie"
                              ? `/media/movie/${media.id}`
                              : `/media/tv/${media.id}`,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
