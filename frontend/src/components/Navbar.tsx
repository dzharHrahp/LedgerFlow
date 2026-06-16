// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import LogoMark from "./LogoMark";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-darkBg/90 backdrop-blur-xl border-b border-primary-500/20 shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <LogoMark size={32} />
          <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            LEDGER|FLOW
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-5">
          {["Solutions", "Products", "Resources"].map((item) => (
            <div key={item} className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600">
                {item} <ChevronDown size={14} />
              </button>
            </div>
          ))}
          <a
            href="#"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600"
          >
            How It Works
          </a>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link
            to="/login"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-md hover:shadow-lg transition"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
