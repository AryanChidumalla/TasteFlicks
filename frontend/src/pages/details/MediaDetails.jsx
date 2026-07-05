import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Video, Award, Users } from "react-feather";
import { supabase } from "../../services/supabase/client";
import {
  getUserMedia,
  updateUserMedia,
} from "../../services/supabase/userMedia";
import { upsertMediaItem } from "../../services/supabase/preferences";

import {
  getMovieDetails,
  getTVShowDetails,
  getMovieVideos,
  getTVShowVideos,
  getMovieCredits,
  getTVShowCredits,
  getWatchProviders,
  getSimilarMovies,
  getSimilarTVShows,
  getTVWatchProviders,
  getMovieReviews,
  getTVReviews,
} from "../../services/tmdb/api";

import HeroSection from "./tabs/HeroSection";
import CastGrid from "./tabs/CastGrid";
import ReviewsList from "./tabs/ReviewsList";
import MediaExtras from "./tabs/MediaExtras";
import RelatedMedia from "./tabs/RelatedMedia";

export default function MediaDetails() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const isTV = type === "tv";

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [mediaDetails, setMediaDetails] = useState(null);
  const [videos, setVideos] = useState([]);
  const [credits, setCredits] = useState([]);
  const [providers, setProviders] = useState(null);
  const [relatedMedia, setRelatedMedia] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [userMedia, setUserMedia] = useState({
    watched: false,
    liked: false,
    watchlist: false,
    rating: 0,
  });

  const displayRating = hover || rating;

  /* ---------------- DATA ACQUISITION STACK ---------------- */
  useEffect(() => {
    const loadMediaAndUserCtx = async () => {
      setStatus("loading");
      try {
        const { data: auth } = await supabase.auth.getUser();
        const activeUser = auth?.user;
        if (activeUser) {
          setUser(activeUser);
          const userData = await getUserMedia(activeUser.id, id);
          if (userData) {
            setUserMedia({
              watched: userData.watched || false,
              liked: userData.liked || false,
              watchlist: userData.watchlist || false,
              rating: userData.rating || 0,
            });
            setRating(userData.rating || 0);
          }
        }

        // Parallelize TMDB content payloads safely
        const payloads = await Promise.all([
          isTV ? getTVShowDetails(id) : getMovieDetails(id),
          isTV ? getTVShowVideos(id) : getMovieVideos(id),
          isTV ? getTVShowCredits(id) : getMovieCredits(id),
          isTV ? getSimilarTVShows(id) : getSimilarMovies(id),
          isTV ? getTVWatchProviders(id) : getWatchProviders(id),
          isTV ? getTVReviews(id) : getMovieReviews(id),
        ]);

        setMediaDetails(payloads[0]);
        setVideos(payloads[1]);
        setCredits(payloads[2]);
        setRelatedMedia(payloads[3]);

        const provData = payloads[4];
        const countryKey = provData?.US
          ? "US"
          : provData?.IN
            ? "IN"
            : Object.keys(provData || {})[0];
        setProviders(provData?.[countryKey] || null);
        setReviews(payloads[5]);

        setStatus("success");
      } catch (err) {
        console.error("Failed compiling asset details map:", err);
        setStatus("error");
      }
    };

    loadMediaAndUserCtx();
  }, [id, type, isTV]);

  /* ---------------- BACKEND TRANSACTION ACTION WORKFLOWS ---------------- */
  const ensureMediaExists = async () => {
    if (!mediaDetails) return;
    await upsertMediaItem({
      id: mediaDetails.id,
      title: mediaDetails.title || mediaDetails.name,
      media_type: type,
      poster_path: mediaDetails.poster_path,
      release_date: mediaDetails.release_date || mediaDetails.first_air_date,
    });
  };

  const updatePreference = async (updates) => {
    if (!user) return;
    await ensureMediaExists();
    const updated = await updateUserMedia({
      userId: user.id,
      mediaId: id,
      mediaType: type,
      updates,
    });
    if (updated) setUserMedia(updated);
  };

  if (status === "loading") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center space-y-3 bg-black-100 text-white-300">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs tracking-widest uppercase font-medium">
          Assembling Catalog Record...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-xl mx-auto my-20 bg-red-950/20 border border-red-500/20 p-6 rounded-2xl text-center text-red-400">
        Error loading media details profiles. Please verify network access.
      </div>
    );
  }

  // Filter out key primary crew records
  const directors =
    credits?.crew
      ?.filter((p) => p.job === "Director" || p.department === "Directing")
      .slice(0, 2) || [];
  const writers =
    credits?.crew
      ?.filter(
        (p) =>
          p.job?.toLowerCase().includes("writer") || p.department === "Writing",
      )
      .slice(0, 2) || [];

  return (
    <div className="bg-black-100 pb-16 space-y-6">
      {/* 1. Immersive Hero Header Presentation */}
      <HeroSection
        mediaDetails={mediaDetails}
        isTV={isTV}
        rating={rating}
        setRating={(v) => {
          setRating(v);
          updatePreference({ rating: v, watched: true });
        }}
        hover={hover}
        setHover={setHover}
        displayRating={displayRating}
        userMedia={userMedia}
        onWatched={() => updatePreference({ watched: !userMedia.watched })}
        onLike={() => updatePreference({ liked: !userMedia.liked })}
        onNotInterested={() =>
          updatePreference({ not_interested: !userMedia?.not_interested })
        }
        onWatchlist={() =>
          updatePreference({ watchlist: !userMedia.watchlist })
        }
      />

      {/* 2. Unified Grid Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT RAIL: Core Secondary Asset Stream Data (8 Columns) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Horizontal Casting Carousels */}
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-2">
              <CastGrid cast={credits?.cast} />
            </div>

            {/* Multimedia Trailers Container */}
            {videos && videos.length > 0 && (
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
                <MediaExtras videos={videos} providers={null} />
              </div>
            )}

            {/* Critique Reviews Pipeline */}
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-2">
              <ReviewsList reviews={reviews} />
            </div>
          </div>

          {/* RIGHT RAIL: Sticky Quick Analytics Meta Information Bar (4 Columns) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Stream Availability Card */}
            {providers?.flatrate && providers.flatrate.length > 0 && (
              <div className="bg-gradient-to-br from-purple-900/20 via-white/[0.02] to-white/[0.02] border border-purple-500/20 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-1.5">
                  <Video size={12} />
                  <span>Available to Stream</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {providers.flatrate.map((p) => (
                    <img
                      key={p.provider_id}
                      src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                      alt={p.provider_name}
                      title={p.provider_name}
                      className="w-10 h-10 rounded-xl border border-white/[0.06] hover:scale-105 transition"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Direct Logistics Info Card */}
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-5 space-y-4 text-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-white-300 border-b border-white/[0.06] pb-2 flex items-center gap-1.5">
                <Award size={12} />
                <span>Production Logistics</span>
              </h3>

              {directors.length > 0 && (
                <div>
                  <span className="text-white-300 text-xs block">Director</span>
                  <p className="font-semibold mt-0.5 text-white-200">
                    {directors.map((d) => d.name).join(", ")}
                  </p>
                </div>
              )}

              {writers.length > 0 && (
                <div>
                  <span className="text-white-300 text-xs block">
                    Screenplay
                  </span>
                  <p className="font-semibold mt-0.5 text-white-200">
                    {writers.map((w) => w.name).join(", ")}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.04]">
                <div>
                  <span className="text-white-300 text-xs block">
                    Original Language
                  </span>
                  <p className="font-medium mt-0.5 capitalize text-white-200">
                    {mediaDetails?.original_language || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-white-300 text-xs block">
                    Current Status
                  </span>
                  <p className="font-medium mt-0.5 text-green-400">
                    {mediaDetails?.status || "—"}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* 3. Deep Recommendation Sub-Footer Area (Full Span) */}
        {relatedMedia && relatedMedia.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/[0.04]">
            <RelatedMedia relatedMedia={relatedMedia} />
          </div>
        )}
      </main>
    </div>
  );
}
