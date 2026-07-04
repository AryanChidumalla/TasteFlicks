import React from "react";

export default function MediaSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 bg-black-200 border border-black-300 rounded-lg animate-pulse">
      {/* Poster Placeholder */}
      <div className="w-14 h-20 bg-black-300 rounded flex-shrink-0" />

      {/* Info Placeholders */}
      <div className="flex-1 overflow-hidden space-y-2">
        <div className="h-4 bg-black-300 rounded w-1/3 truncate" />
        <div className="flex gap-2">
          <div className="h-5 bg-black-300 rounded-full w-12" />
          <div className="h-5 bg-black-300 rounded-full w-16" />
        </div>
        <div className="h-3 bg-black-300 rounded w-1/4 mt-2" />
      </div>

      {/* Ratings Placeholder */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="h-4 bg-black-300 rounded w-14" />
        <div className="h-3 bg-black-300 rounded w-10" />
      </div>
    </div>
  );
}
