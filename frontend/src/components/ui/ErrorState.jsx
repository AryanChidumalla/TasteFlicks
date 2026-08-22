import React from "react";
import { AlertCircle, RefreshCw } from "react-feather";
import { PrimaryButton } from "./buttons";

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an issue communicating with the catalog. Please check your connection and try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={`p-8 bg-red-950/10 border border-red-500/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3.5 max-w-xl mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <AlertCircle size={22} />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-white-100">{title}</h3>
        <p className="text-xs sm:text-sm text-red-300/80 max-w-md mx-auto">
          {message}
        </p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <PrimaryButton
            icon={RefreshCw}
            name="Retry Connection"
            onClick={onRetry}
          />
        </div>
      )}
    </div>
  );
}
