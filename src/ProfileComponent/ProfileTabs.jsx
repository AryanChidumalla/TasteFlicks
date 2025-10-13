import { motion } from "framer-motion";
import { useEffect } from "react";

export default function ProfileTabs({ profileSection, setProfileSection }) {
  useEffect(() => {
    const saved = localStorage.getItem("profileSection");
    if (saved) setProfileSection(saved);
  }, []);

  function switchTab(name) {
    setProfileSection(name);
    localStorage.setItem("profileSection", name);
  }

  const tabs = [
    { name: "Overview", Icon: Layers },
    { name: "Movies", Icon: Film },
    { name: "TV Shows", Icon: Tv },
    { name: "Watchlist", Icon: Bookmark },
  ];

  return (
    <div className="relative flex gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => switchTab(tab.name)}
          className="relative px-4 py-2 rounded-md"
        >
          <div
            className={`flex items-center gap-2 ${
              profileSection === tab.name
                ? "text-primary-100"
                : "text-white-300"
            }`}
          >
            <tab.Icon size={16} />
            <span>{tab.name}</span>
          </div>
          {profileSection === tab.name && (
            <motion.span
              layoutId="underline"
              className="absolute left-0 right-0 bottom-0 h-1 bg-primary-100 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
