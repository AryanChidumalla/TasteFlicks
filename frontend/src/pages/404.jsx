import React from "react";
import { Film, Home } from "react-feather";
import { Link } from "react-router-dom";
import { PrimaryButton } from "../components/ui/buttons";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Film size={36} />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl sm:text-5xl font-black text-white-100 tracking-tight">
          404 <span className="text-purple-500">Lost Reel</span>
        </h1>
        <p className="text-sm text-white-300">
          The page or cinematic record you are searching for does not exist in the TasteFlicks universe.
        </p>
      </div>

      <div className="pt-2">
        <Link to="/">
          <PrimaryButton icon={Home} name="Return to Dashboard" />
        </Link>
      </div>
    </div>
  );
}
