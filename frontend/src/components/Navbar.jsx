import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu, X, User, LogOut, LayoutDashboard, BarChart3,
  BookOpen, PlusCircle, ChevronDown, Shield,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setProfileOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link
            to={user ? "/dashboard" : "/"}
            className="text-sm font-semibold tracking-tight flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            FOSSEE Workshops
          </Link>

          <button
            className="sm:hidden p-2 hover:bg-surface transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex sm:items-center sm:gap-0.5">
            {user && (
              <>
                <NavLink to="/dashboard"><LayoutDashboard className="w-3.5 h-3.5" />Dashboard</NavLink>
                <NavLink to="/statistics"><BarChart3 className="w-3.5 h-3.5" />Statistics</NavLink>
                {!user.is_instructor && (
                  <NavLink to="/propose"><PlusCircle className="w-3.5 h-3.5" />Propose</NavLink>
                )}
                <NavLink to="/workshop-types">Types</NavLink>
                {user.is_admin && (
                  <NavLink to="/admin"><Shield className="w-3.5 h-3.5" />Admin</NavLink>
                )}

                <div className="relative ml-2" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-surface transition-colors text-sm"
                  >
                    <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-[10px] font-semibold">
                      {(user.full_name || user.username).charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-border shadow-sm py-1 text-sm z-50 animate-slide-down origin-top-right">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="font-medium truncate">{user.full_name || user.username}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-3 py-2 hover:bg-surface transition-colors text-gray-600" onClick={() => setProfileOpen(false)}>
                        <User className="w-3.5 h-3.5" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-surface transition-colors text-red-600"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {!user && (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm hover:text-gray-600 transition-colors">Sign In</Link>
                <Link to="/register" className="px-3 py-1.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-white animate-slide-down">
          <div className="px-4 py-2 space-y-0.5">
            {user ? (
              <>
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium">{user.full_name || user.username}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <MobileNavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
                <MobileNavLink to="/statistics" onClick={() => setMenuOpen(false)}>Statistics</MobileNavLink>
                {!user.is_instructor && (
                  <MobileNavLink to="/propose" onClick={() => setMenuOpen(false)}>Propose Workshop</MobileNavLink>
                )}
                <MobileNavLink to="/workshop-types" onClick={() => setMenuOpen(false)}>Workshop Types</MobileNavLink>
                {user.is_admin && (
                  <MobileNavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</MobileNavLink>
                )}
                <MobileNavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</MobileNavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-surface transition-colors"
                >
                  Sign Out
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
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-sm transition-colors ${
        active ? "bg-surface font-medium" : "text-gray-500 hover:text-black hover:bg-surface"
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
      className="block px-3 py-2 text-sm hover:bg-surface transition-colors"
    >
      {children}
    </Link>
  );
}
