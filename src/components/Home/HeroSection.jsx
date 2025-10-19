import { useState, useEffect } from "react";
import { useTrendingMediaInfinite } from "../../hooks/useMediaAPI";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules"; // Swiper v9+

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation"; // Optional
import { PrimaryButton } from "../../buttons";
import { Info, Link } from "react-feather";

// Custom hook to track window width
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}

// Subcomponent for individual slide content
function SlideContent({ media, imageUrl, navigate, isMobile }) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: isMobile ? "2 / 3" : "16 / 6",
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative flex items-center"
      role="group"
      aria-label={`${media.title || media.name} slide`}
    >
      {/* Overlay gradient */}
      <div
        className="absolute left-0 top-0 h-full w-full flex items-end"
        style={{
          background:
            "linear-gradient(to right, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.3), transparent)",
        }}
      >
        <div className="text-white p-6 max-w-xl flex flex-col gap-5 items-start">
          <h2 className="text-5xl font-semibold line-clamp-2">
            {media.title || media.name}
          </h2>
          <p className="text-sm line-clamp-3">
            {media.overview || "No description available."}
          </p>

          <PrimaryButton
            name="More Info"
            icon={Info}
            onClick={() =>
              media.media_type === "movie"
                ? navigate(`/movie/${media.id}`)
                : navigate(`/tvshows/${media.id}`)
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function HeroSection({ navigate }) {
  const windowWidth = useWindowWidth();

  // Infinite Queries for Media
  const { data: trendingMediaData } = useTrendingMediaInfinite();

  // Flatten Media Results
  const trendingMedia =
    trendingMediaData?.pages.flatMap((page) => page.results) || [];

  // Responsive height (500px on desktop, 300px on small screens)
  const slideHeight = windowWidth > 640 ? "500px" : "300px";

  return (
    <Swiper
      modules={[Autoplay]}
      spaceBetween={0}
      slidesPerView={1}
      loop={true}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      aria-label="Trending media carousel"
    >
      {trendingMedia.map((media) => {
        const backdropUrl = media.backdrop_path
          ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
          : null;

        const posterUrl = media.poster_path
          ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
          : null;

        const imageUrl = windowWidth > 640 ? backdropUrl : posterUrl;

        if (!imageUrl) return null; // Skip if no image

        return (
          <SwiperSlide key={media.id}>
            <div className="m-4 md:m-10 rounded overflow-hidden relative border border-black-300">
              <SlideContent
                media={media}
                imageUrl={imageUrl}
                navigate={navigate}
                isMobile={windowWidth <= 640}
              />
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
