import React from "react";
import { Film } from "react-feather";

export function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} border-purple-500 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ message = "Loading cinematic universe..." }) {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 border border-purple-500/30 animate-pulse flex items-center justify-center">
          <Film size={24} className="text-purple-400 animate-bounce" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-purple-500/40 border-t-transparent animate-spin" />
      </div>
      <p className="text-xs sm:text-sm font-medium text-white-300 tracking-wide">
        {message}
      </p>
    </div>
  );
}
