import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuthStore } from "../store/authStore";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";

function Navbar() {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const closeModal = () => {
    setActiveModal(null);
  };

  const openSignIn = () => {
    setIsMobileMenuOpen(false);
    setActiveModal("signIn");
  };

  const openSignUp = () => {
    setIsMobileMenuOpen(false);
    setActiveModal("signUp");
  };

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
    <>
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            Snip
          </Link>

          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-1 text-sm md:hidden"
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
                  onClick={openSignIn}
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={openSignUp}
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
                    onClick={openSignIn}
                    className="text-left text-sm font-medium text-gray-600"
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={openSignUp}
                    className="rounded bg-indigo-600 px-4 py-2 text-left text-sm font-medium text-white"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {activeModal === "signIn" && (
        <SignInModal
          onClose={closeModal}
          onSwitchToSignUp={() => setActiveModal("signUp")}
        />
      )}

      {activeModal === "signUp" && (
        <SignUpModal
          onClose={closeModal}
          onSwitchToSignIn={() => setActiveModal("signIn")}
        />
      )}
    </>
  );
}

export default Navbar;