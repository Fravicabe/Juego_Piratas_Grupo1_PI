import { Routes, Route } from "react-router-dom";
import Topbar from "./ui/components/Topbar";
import Sidebar from "./ui/components/Sidebar";
import Home from "./ui/pages/Home";
import Map from "./ui/pages/Map";
import Skills from "./ui/pages/Skills";
import Crew from "./ui/pages/Crew";
import Ship from "./ui/pages/Ship";
import Settings from "./ui/pages/Settings";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-wood">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-wood/10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/ship" element={<Ship />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}