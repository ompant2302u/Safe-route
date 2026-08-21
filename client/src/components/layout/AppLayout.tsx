import { useState } from "react";
import { Outlet } from "react-router-dom";

import BottomNavigation from "./BottomNavigation";
import SOSButton from "../sos/SOSButton";
import SOSModal from "../sos/SOSModal";

export default function AppLayout() {
  const [sosOpen, setSosOpen] = useState(false);

  return (
    <div className="app-layout">
      <main className="main-content">
        <Outlet />
      </main>

      <SOSButton
        onClick={() => setSosOpen(true)}
      />

      <SOSModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
      />

      <BottomNavigation />
    </div>
  );
}