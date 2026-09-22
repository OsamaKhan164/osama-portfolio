import React from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import Contact from "./pages/Contact.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import AdminLayout from "./admin/layout/AdminLayout.jsx";
import AdminDashboard from "./admin/pages/Dashboard.jsx";
import AdminUsers from "./admin/pages/Users.jsx";
import AdminMessages from "./admin/pages/Messages.jsx";
import AdminActivities from "./admin/pages/Activities.jsx";
import AdminProjects from "./admin/pages/Projects.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public portfolio — dashboard-style shell: fixed sidebar + navbar */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route
          path="/projects/:id"
          element={
            <RequireAuth>
              <ProjectDetail />
            </RequireAuth>
          }
        />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth pages — standalone centered screens, no portfolio sidebar/navbar */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Admin panel — completely separate layout, no public Navbar/Footer */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="activities" element={<AdminActivities />} />
        <Route path="projects" element={<AdminProjects />} />
      </Route>
    </Routes>
  );
}
