import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu, X, User, LogOut, LayoutDashboard, BarChart3,
  BookOpen, PlusCircle, ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setProfileOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={user ? "/dashboard" : "/"}
            className="text-xl font-bold tracking-tight flex items-center gap-2 shrink-0"
          >
            <BookOpen className="w-6 h-6" />
            <span className="hidden sm:inline">FOSSEE Workshops</span>
            <span className="sm:hidden">FOSSEE</span>
          </Link>

          <button
            className="sm:hidden p-2 rounded-md hover:bg-primary-light transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="hidden sm:flex sm:items-center sm:gap-1">
            {user && (
              <>
                <NavLink to="/dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </NavLink>
                <NavLink to="/statistics">
                  <BarChart3 className="w-4 h-4" />
                  Statistics
                </NavLink>
                {!user.is_instructor && (
                  <NavLink to="/propose">
                    <PlusCircle className="w-4 h-4" />
                    Propose
                  </NavLink>
                )}
                <NavLink to="/workshop-types">Workshop Types</NavLink>

                <div className="relative ml-3">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary-light transition-colors text-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="max-w-[120px] truncate">{user.full_name || user.username}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 text-gray-800 z-50 border border-gray-100">
                      <Link to="/profile" className="block px-4 py-2.5 hover:bg-gray-50 text-sm" onClick={() => setProfileOpen(false)}>
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-sm text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {!user && (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium hover:text-accent-light transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 bg-accent hover:bg-accent-light rounded-lg text-white text-sm font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-primary-light bg-primary">
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <MobileNavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </MobileNavLink>
                <MobileNavLink to="/statistics" onClick={() => setMenuOpen(false)}>
                  <BarChart3 className="w-4 h-4" /> Statistics
                </MobileNavLink>
                {!user.is_instructor && (
                  <MobileNavLink to="/propose" onClick={() => setMenuOpen(false)}>
                    <PlusCircle className="w-4 h-4" /> Propose Workshop
                  </MobileNavLink>
                )}
                <MobileNavLink to="/workshop-types" onClick={() => setMenuOpen(false)}>
                  <BookOpen className="w-4 h-4" /> Workshop Types
                </MobileNavLink>
                <MobileNavLink to="/profile" onClick={() => setMenuOpen(false)}>
                  <User className="w-4 h-4" /> Profile
                </MobileNavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-md text-red-300 hover:bg-primary-light transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" onClick={() => setMenuOpen(false)}>Sign In</MobileNavLink>
                <MobileNavLink to="/register" onClick={() => setMenuOpen(false)}>Sign Up</MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active ? "bg-primary-light text-white" : "hover:bg-primary-light text-white/80 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2.5 rounded-md hover:bg-primary-light transition-colors"
    >
      {children}
    </Link>
  );
}
