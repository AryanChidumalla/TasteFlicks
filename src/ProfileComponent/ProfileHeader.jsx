import React from "react";
import dayjs from "dayjs";

export default function ProfileHeader({ user, hoursWatched, genreCount }) {
  if (!user) return null;

  const topGenres = Object.entries(genreCount || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  return (
    <section className="p-6 md:p-10 bg-gradient-to-r from-black-100 via-[#1F1A4D] to-primary-300 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <img
          src={
            user.avatar_url ||
            `https://www.gravatar.com/avatar/${user.email}?d=identicon`
          }
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover border-2 border-black-300"
        />

        {/* User info */}
        <div>
          <h1 className="text-4xl font-semibold text-white-100">
            Hi, <span className="text-primary-100">{user.display_name}</span>
          </h1>
          <div className="text-white-300 text-sm mt-1">
            Member since {dayjs(user.created_at).format("MMM YYYY")} •{" "}
            {hoursWatched} hours watched
          </div>
          <div className="mt-2 text-sm text-white-300">
            <span className="font-semibold mr-2">Top genres:</span>
            {topGenres.length ? topGenres.join(", ") : "No genres yet"}
          </div>
        </div>
      </div>
    </section>
  );
}
