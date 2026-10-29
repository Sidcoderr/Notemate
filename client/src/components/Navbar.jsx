import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Plus, LogOut, Sparkles } from "lucide-react";
import Spinner from "./Spinner.jsx";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-indigo-600 font-bold text-lg tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-slate-900">
              Note<span className="text-indigo-600">Mate</span>
            </span>
          </Link>

          {/* User Controls */}
          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden md:inline-block text-xs font-medium text-slate-500 max-w-[200px] truncate">
                {user.email}
              </span>

              <Link
                to="/notes/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
                title="Sign out"
              >
                {loggingOut ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

