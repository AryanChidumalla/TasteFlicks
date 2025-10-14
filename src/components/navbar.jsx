import { Film, Menu, User, X } from "react-feather";
import { PrimaryButton } from "../buttons";
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
  const user = useSelector((state) => state.user.user);
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore Movies", path: "/exploremovies" },
    { name: "Explore TV Shows", path: "/exploretvshows" },
    { name: "Movies", path: "/movies" },
    { name: "TV Shows", path: "/tvshows" },
  ];

  return (
    <div className="relative z-50 bg-black-100 border-b border-black-300">
      {/* Navbar Container */}
      <div className="flex justify-between items-center px-10 py-5">
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

        {/* Right: Desktop Profile / Sign In */}
        <div className="hidden md:flex">
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

        {/* Mobile: Hamburger / Close */}
        <div className="flex md:hidden z-50">
          <div
            className="px-2.5 py-2.5 text-white-100 bg-primary-100 rounded cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X size={20} /> : <Menu size={20} />}
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
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
    </div>
  );
}

export default NavBar;
