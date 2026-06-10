import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuthStore } from "../store/authStore";

function Navbar() {
    const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
  logout();
  setIsMobileMenuOpen(false);
  navigate("/");
    };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-indigo-600 font-medium"
      : "text-gray-600 hover:text-indigo-600";

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          Snip
        </Link>

        <button
          type="button"
          className="md:hidden rounded border border-gray-300 px-3 py-1 text-sm"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          Menu
        </button>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                Sign In
              </button>

              <button
                type="button"
                className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={navLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded bg-gray-900 px-4 py-2 text-left text-sm font-medium text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="text-left text-sm font-medium text-gray-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  className="rounded bg-indigo-600 px-4 py-2 text-left text-sm font-medium text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;