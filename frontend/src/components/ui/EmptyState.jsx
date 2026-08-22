import React from "react";
import { Film } from "react-feather";
import { PrimaryButton } from "./buttons";

export function EmptyState({
  icon = Film,
  title = "No media discovered",
  description = "There are no items to display at this moment.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`text-center py-16 px-4 bg-white/[0.015] border border-dashed border-white/[0.06] rounded-2xl flex flex-col items-center justify-center space-y-3.5 max-w-2xl mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white-300/60">
        {React.createElement(icon || Film, { size: 22 })}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-white-100">{title}</h3>
        <p className="text-xs sm:text-sm text-white-300 max-w-md mx-auto">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <PrimaryButton onClick={onAction} name={actionLabel} />
        </div>
      )}
    </div>
  );
}
