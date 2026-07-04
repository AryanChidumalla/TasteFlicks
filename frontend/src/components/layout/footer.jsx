import { Film, GitHub, Linkedin, Mail } from "react-feather";
import { Link, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black-100 border-t border-white/[0.04] mt-auto text-white-300 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left Side: Brand Identity */}
        <div
          className="flex items-center gap-2 font-extrabold text-white-100 text-base cursor-pointer tracking-tight group"
          onClick={() => navigate("/")}
        >
          <Film
            size={18}
            className="text-primary-100 group-hover:text-purple-400 transition-colors"
          />
          <span>
            <span className="text-primary-100">Taste</span>Flicks
          </span>
        </div>

        {/* Center: Minimal Navigation Routes */}
        <nav className="flex items-center gap-6 text-xs text-white-300 font-semibold tracking-wider uppercase">
          <Link
            to="/"
            className="hover:text-white-100 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/movies"
            className="hover:text-white-100 transition-colors duration-200"
          >
            Movies
          </Link>
          <Link
            to="/tvshows"
            className="hover:text-white-100 transition-colors duration-200"
          >
            TV Shows
          </Link>
        </nav>

        {/* Right Side: Social Grid Connections */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex gap-4 text-white-300">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="bg-white/[0.03] border border-white/[0.05] p-2 rounded-xl hover:bg-white/[0.08] hover:text-white-100 transition duration-300"
              aria-label="Github Profile Link"
            >
              <GitHub size={16} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="bg-white/[0.03] border border-white/[0.05] p-2 rounded-xl hover:bg-white/[0.08] hover:text-white-100 transition duration-300"
              aria-label="Linkedin Profile Link"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="mailto:contact@tasteflicks.com"
              className="bg-white/[0.03] border border-white/[0.05] p-2 rounded-xl hover:bg-white/[0.08] hover:text-white-100 transition duration-300"
              aria-label="Email Contact Channel"
            >
              <Mail size={16} />
            </a>
          </div>

          <p className="text-[11px] text-gray-500 font-medium mt-1">
            &copy; {currentYear} TasteFlicks. Designed for cinephiles.
          </p>
        </div>
      </div>
    </footer>
  );
}
