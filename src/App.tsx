import { Routes, Route, NavLink } from "react-router-dom";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <nav className="w-48 bg-wood/80 p-4 space-y-2">
        <h1 className="text-gold font-bold text-xl mb-4">🏴‍☠️ Pirate Idle</h1>
        {[
          ["/", "Home"],
          ["/map", "Map"],
          ["/skills", "Skills"],
          ["/crew", "Crew"],
          ["/ship", "Ship"],
          ["/settings", "Settings"],
        ].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${isActive ? "bg-gold text-wood" : "hover:bg-wood"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<div>Home (dashboard) — Sprint 1</div>} />
          <Route path="/map" element={<div>Map — Sprint 1</div>} />
          <Route path="/skills" element={<div>Skills — Sprint 2</div>} />
          <Route path="/crew" element={<div>Crew — Sprint 2</div>} />
          <Route path="/ship" element={<div>Ship — Sprint 2</div>} />
          <Route path="/settings" element={<div>Settings</div>} />
        </Routes>
      </main>
    </div>
  );
}
