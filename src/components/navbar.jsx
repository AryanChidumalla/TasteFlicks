import { Film, Menu, Search, User, X } from "react-feather";
import { Black200Button, PrimaryButton } from "../buttons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { supabase } from "../supabaseClient";
import { useState } from "react";

const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error.message);
  } else {
    console.log("Signed out successfully");
  }
};

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false); // New state for search overlay
  const user = useSelector((state) => state.user.user);
  const isActive = (path) => location.pathname === path;

  const [searchText, setSearchText] = useState("");

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "TV Shows", path: "/tvshows" },
  ];

  // Search handler
  const handleSearch = () => {
    const trimmed = searchText.trim();
    if (trimmed.length > 0) {
      navigate(`/search?query=${encodeURIComponent(trimmed)}`);
      setSearchText("");
      setShowMobileSearch(false); // Close search overlay
      setShowMenu(false); // Close menu if open
    }
  };

  return (
    <div className="relative z-50 bg-black-100 border-b border-black-300">
      {/* Navbar Container */}
      <div className="flex justify-between items-center px-4 sm:px-10 py-5">
        {/* Left: Logo + Desktop Links */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <div
            className="text-xl text-white-100 font-semibold flex gap-1 items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Film size={20} className="mr-2" />
            <span className="text-primary-100">Taste</span>Flicks
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-5 text-white-300 font-semibold">
            {navLinks.map(({ name, path }) => (
              <Link
                key={path}
                to={path}
                className={`transition-colors duration-300 ${
                  isActive(path) ? "text-white-100" : "text-white-300"
                }`}
              >
                {name}
              </Link>
            ))}
          </div>
        </div>

        {/* 🔎 Desktop Search */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-120 bg-black-200 border border-black-300 text-white-100 px-4 py-2 rounded-md focus:outline-none"
            />
            <Search
              className="absolute right-3 top-2.5 text-white-300 cursor-pointer"
              size={18}
              onClick={handleSearch}
            />
          </div>
        </div>

        {/* Right: Desktop Profile / Sign In */}
        <div className="hidden lg:flex">
          {user ? (
            <PrimaryButton
              name="Profile"
              icon={User}
              onClick={() => navigate("/profile")}
            />
          ) : (
            <PrimaryButton
              name="Sign In"
              icon={User}
              onClick={() => navigate("/signin")}
            />
          )}
        </div>

        {/* Mobile: Hamburger / Search / Close */}
        <div className="flex lg:hidden items-center gap-2 z-50">
          {/* Search Icon Button */}
          <div
            className="px-2.5 py-2.5 text-white-100 bg-primary-100 rounded cursor-pointer"
            onClick={() => {
              setShowMobileSearch(true);
              setShowMenu(false); // close menu if open
            }}
            aria-label="Open search"
          >
            <Search size={20} />
          </div>

          {/* Hamburger Menu */}
          <div
            className="px-2.5 py-2.5 text-white-100 bg-primary-100 rounded cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
            aria-label={showMenu ? "Close menu" : "Open menu"}
          >
            {showMenu ? <X size={20} /> : <Menu size={20} />}
          </div>
        </div>
      </div>

      {/* Mobile Backdrop for Menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          showMenu
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowMenu(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-black-200 text-white-100 transform transition-transform duration-300 ease-in-out z-50 ${
          showMenu ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 gap-6 font-semibold text-lg mt-16">
          {navLinks.map(({ name, path }) => (
            <Link
              key={path}
              to={path}
              className={`transition-colors duration-300 ${
                isActive(path) ? "text-primary-100" : ""
              }`}
              onClick={() => setShowMenu(false)}
            >
              {name}
            </Link>
          ))}

          {/* Sign In / Profile Button */}
          <div className="mt-5">
            {user ? (
              <PrimaryButton
                name="Profile"
                icon={User}
                onClick={() => {
                  navigate("/profile");
                  setShowMenu(false);
                }}
              />
            ) : (
              <PrimaryButton
                name="Sign In"
                icon={User}
                onClick={() => {
                  navigate("/signin");
                  setShowMenu(false);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-60 flex flex-col items-end gap-2 justify-start px-6 py-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-full bg-black-100 border border-black-300 text-white-100 px-4 py-3 rounded-md focus:outline-none text-lg"
            />
            <Search
              className="absolute right-4 top-3.5 text-white-300 cursor-pointer"
              size={24}
              onClick={handleSearch}
            />
          </div>
          <Black200Button
            name="Cancel"
            onClick={() => setShowMobileSearch(false)}
          />
        </div>
      )}
    </div>
  );
}

export default NavBar;
