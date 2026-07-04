import React, { useEffect, useState } from "react";
import { Film, Menu, Search, User, X } from "react-feather";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.user);

  const [showMenu, setShowMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "TV Shows", path: "/tvshows" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    navigate(`/search?query=${encodeURIComponent(q)}`);
    setSearchText("");
    setShowMenu(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-black/80 backdrop-blur-md border-white/[0.06] py-3 shadow-xl"
          : "bg-black/20 backdrop-blur-sm border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <Film
            className="text-purple-500 transition-transform duration-500 group-hover:rotate-12"
            size={20}
          />
          <span className="text-xl font-black tracking-tight text-white-100">
            <span className="text-purple-500">Taste</span>Flicks
          </span>
        </div>

        {/* Center: Premium Desktop Navigation Segment */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/[0.04] p-1 rounded-full">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-300 ${
                  active
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "text-white-300 hover:text-white-100 hover:bg-white/[0.03]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions Suite */}
        <div className="flex items-center gap-3">
          {/* Desktop Live Query Input */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:block relative group"
          >
            <Search
              size={14}
              className="absolute left-3 top-2.5 text-white-300 transition-colors group-focus-within:text-purple-400"
            />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search cinematic universe..."
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white outline-none focus:bg-black-300 focus:border-purple-500/40 transition-all duration-300 w-56 focus:w-64"
            />
          </form>

          {/* User Profile Context Toggle */}
          <button
            onClick={() => navigate(user ? "/profile" : "/signin")}
            className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all duration-300"
            aria-label="Profile context"
          >
            <User size={14} className="fill-current" />
          </button>

          {/* Responsive Mobile Drawer Trigger */}
          <button
            className="md:hidden p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white-300 hover:text-white-100 transition"
            onClick={() => setShowMenu(true)}
            aria-label="Toggle structural menus"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>

      {/* MOBILE EXPANSION OVERLAY DRAWER */}
      {showMenu && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-black/95 backdrop-blur-3xl z-[9999] flex flex-col p-6 animate-fade-in">
          <div className="flex justify-between items-center pb-4 border-b border-white/[0.05]">
            <span className="text-white-300 uppercase tracking-widest font-black text-xs">
              Navigation Hub
            </span>
            <button
              onClick={() => setShowMenu(false)}
              className="p-1.5 bg-white/[0.04] border border-white/[0.05] rounded-xl text-white-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 gap-6 w-full max-w-sm mx-auto">
            {/* Quick Search at top for Mobile UX */}
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search movies, tv..."
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-4 pr-10 py-3 text-sm text-white outline-none focus:border-purple-500/40"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 text-purple-400"
              >
                <Search size={18} />
              </button>
            </form>

            <div className="flex flex-col gap-3 w-full text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowMenu(false)}
                  className={`py-2 text-base font-bold rounded-xl transition-colors ${
                    isActive(link.path)
                      ? "text-purple-400 bg-purple-500/5"
                      : "text-white-300 hover:text-white-100"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <button
              onClick={() => {
                setShowMenu(false);
                navigate(user ? "/profile" : "/signin");
              }}
              className="w-full mt-4 py-3 bg-purple-500 hover:bg-purple-400 text-white text-xs uppercase tracking-wider font-bold rounded-xl transition shadow-xl shadow-purple-500/10"
            >
              {user ? "View Dashboard Profile" : "Secure Sign In"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default NavBar;
