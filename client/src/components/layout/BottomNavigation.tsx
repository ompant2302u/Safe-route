import {
  House,
  Map,
  MapPin,
  Shield,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function BottomNavigation() {
  return (
    <nav className="bottom-navigation">
      <NavLink to="/">
        <House size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/route">
        <Map size={22} />
        <span>Route</span>
      </NavLink>

      <NavLink to="/report">
        <MapPin size={22} />
        <span>Report</span>
      </NavLink>

      <NavLink to="/safe-places">
        <Shield size={22} />
        <span>Safe Places</span>
      </NavLink>
    </nav>
  );
}