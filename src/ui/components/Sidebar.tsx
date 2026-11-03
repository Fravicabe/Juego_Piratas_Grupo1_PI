import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/map", label: "Mapa", icon: "🗺️" },
  { path: "/skills", label: "Habilidades", icon: "📜" },
  { path: "/crew", label: "Tripulación", icon: "👥" },
  { path: "/ship", label: "Barco", icon: "⛵" },
  { path: "/settings", label: "Ajustes", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <nav className="w-48 bg-wood/20 p-4 space-y-2">
      {navItems.map(({ path, label, icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center space-x-2 px-3 py-2 rounded ${
              isActive ? "bg-gold text-wood" : "hover:bg-wood"
            }`
          }
        >
          <span>{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}