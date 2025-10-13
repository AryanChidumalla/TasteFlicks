import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getRecentActivity } from "../supabasePreferences";
import { getMovieDetails, getTVShowDetails } from "../movieAPI";
import MediaCard from "./MediaCard";

export default function RecentActivity() {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const [recentMedia, setRecentMedia] = useState([]);

  useEffect(() => {
    async function fetchRecent() {
      if (!userId) return;
      const activity = await getRecentActivity(userId, 10);

      const mediaData = await Promise.all(
        activity.map(async (item) => {
          if (item.media_type === "movie")
            return getMovieDetails(item.media_id);
          if (item.media_type === "tv") return getTVShowDetails(item.media_id);
        })
      );

      setRecentMedia(mediaData.filter(Boolean));
    }

    fetchRecent();
  }, [userId]);

  if (recentMedia.length === 0) return null;

  return (
    <section className="p-6 md:p-10">
      <h2 className="text-3xl font-semibold text-white-100 mb-6">
        Recent Activity
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {recentMedia.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            onClick={() =>
              (window.location.href = media.title
                ? `/movie/${media.id}`
                : `/tvshows/${media.id}`)
            }
          />
        ))}
      </div>
    </section>
  );
}
