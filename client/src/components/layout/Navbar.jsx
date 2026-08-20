import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Anchor, PenLine, ScrollText, LogOut, UserRound, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

const links = [
  { to: "/noticeboard", label: "Noticeboard", icon: Sparkles },
  { to: "/write", label: "Write a Letter", icon: PenLine },
  { to: "/log", label: "Our Log", icon: ScrollText }
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, status, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Ashore for now. Fair winds, Captain.");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50">
      <nav className="glass shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex h-[70px] max-w-shell items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-gold" />
            <span className="font-display text-xl text-gold">HeyFutureJasmine!</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-3 sm:gap-5">
                {links.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    title={label}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 text-sm transition ${
                        isActive ? "text-gold" : "text-text-secondary hover:text-text-primary"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </NavLink>
                ))}
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-grand-line px-3 py-1.5 text-sm text-text-secondary transition hover:border-gold hover:text-gold"
              >
                <UserRound className="h-4 w-4" />
                <span className="max-w-[10ch] truncate">{user?.displayName || user?.username}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="rounded-full p-2 text-text-muted transition hover:text-straw-red"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : status === "anonymous" ? (
            <div className="flex items-center gap-3 text-sm">
              <Link
                to="/login"
                className="rounded-full border border-gold px-4 py-1.5 text-gold transition hover:bg-gold hover:text-ocean"
              >
                Board Ship
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-straw-red px-4 py-1.5 font-medium text-white transition hover:brightness-110"
              >
                Join the Crew
              </Link>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
