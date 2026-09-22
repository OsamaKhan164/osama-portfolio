import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

/**
 * Dashboard-style shell: a permanent left sidebar (icon-only on mobile,
 * icon+label on desktop) and a permanent top navbar, both fixed. Content
 * is offset to match (ml-16/md:ml-56 for the sidebar width, pt-20 for the
 * navbar height) so nothing ever renders underneath either fixed element.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <Navbar />

      <div className="ml-16 flex min-h-screen flex-col pt-20 md:ml-56">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
