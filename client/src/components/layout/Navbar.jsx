import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/write", label: "Set Sail" },
  { to: "/log", label: "Captain's Log" },
  { to: "/noticeboard", label: "Noticeboard" },
  { to: "/profile", label: "Wanted Poster" }
];

export default function Navbar() {
  return (
    <header className="border-b border-grand-line bg-deep-sea/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-2xl">🏴‍☠️</span>
          <span className="font-display text-2xl text-gold">HeyFutureJasmine!</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition ${isActive ? "text-gold" : "text-text-secondary hover:text-text-primary"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            to="/login"
            className="rounded-full border border-gold px-4 py-1 text-gold hover:bg-gold hover:text-ocean transition"
          >
            Board Ship
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-straw-red px-4 py-1 text-white hover:bg-red-600 transition"
          >
            Join Crew
          </Link>
        </div>
      </nav>
    </header>
  );
}
