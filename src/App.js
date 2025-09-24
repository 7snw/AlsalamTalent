import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import RoleProtectedLayout from "./Components/RoleProtectedLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

import LandingPage from "./Pages/LandingPage";
import StudentGraduate from "./Pages/StudentOrGraduate";
import SignUpPage from "./Pages/SignUpPage";
import GraduateSignUp from "./Pages/GraduateSignUp";
import LoginPage from "./Pages/LoginPage";
import AboutUs from "./Pages/AboutUs";


// Shared Pages
import Messages from "./Pages/Messages";
import FreelancerProfile from "./Pages/FreelancerProfile";
import FreelancersList from "./Pages/FreelancersList";

// Freelancer Pages
import FreelancerHome from "./Pages/Freelancer/FreelancerHome";
import AllProjects from "./Pages/Freelancer/AllProjects";
import AssignedProjects from "./Pages/Freelancer/AssignedProjects";
import BookingSpace from "./Pages/Freelancer/BookingSpace";
import SavedProjects from "./Pages/Freelancer/SavedProjects";
import MyApplications from "./Pages/Freelancer/MyApplications";
import MyProfile from "./Pages/Freelancer/MyProfile";
import ProfileSettings from "./Pages/Freelancer/ProfileSettings";
import MyProjectsDetails from "./Pages/Freelancer/MyProjectsDetails";
import FreelancerNotifications from "./Pages/Freelancer/FreelancerNotifications";
import TermsContent from "./Components/TermsContent";
import PaymentHistory from "./Pages/Freelancer/PaymentHistory";

// Client Pages
import PaymentsLedger from "./Pages/Clients/PaymentsLedger";
import BookingsTable from "./Pages/Clients/BookingsTable";
import ClientHome from "./Pages/Clients/ClientHome";
import PostProject from "./Pages/Clients/PostProject";
import AssignedProject from "./Pages/Clients/AssignedProject";
import SubmittedProjects from "./Pages/Clients/SubmittedProjects";
import SubmittedProjectDetailsPage from "./Pages/Clients/SubmittedProjectDetailsPage";
import ProjectApplications from "./Pages/Clients/ProjectApplications";
import AnalyticsClient from "./Pages/Clients/AnalyticsClients";
import BrowseProjects from "./Pages/Clients/BrowseProjects";
import ProjectProgress from "./Pages/Clients/ProjectProgress";
import ProfileSettingsClient from "./Pages/Clients/ProfileSettingsClient";
import ClientNotifications from "./Pages/Clients/ClientNotifications";
import PostResource from "./Pages/Clients/PostResource";
// Admin Pages
import AdminAllProjects from "./Pages/Admin/AdminAllProjects";
import Clientlist from "./Pages/Admin/UsersList";
import AddUsers from "./Pages/Admin/AddUsers";
import AnalyticsAdmin from "./Pages/Admin/AnalyticsAdmin";
import AdminProfileSettings from "./Pages/Admin/AdminProfileSettings";
import AdminProjectDetails from "./Pages/Admin/AdminProjectDetails";
import EditUserProfile from "./Pages/Admin/EditUserProfile";
import AuditLogs from "./Pages/Admin/AuditLogs";
import FreelancersDetails from "./Pages/Admin/FreelancersDetails";
import AdminNotifications from "./Pages/Admin/AdminNotifications";

import EditProject from "./Pages/EditProject";
import ProjectDetails from "./Pages/ProjectDetails";
import Library from "./Pages/Library";

/* ---------- Scroll to top on route change ---------- */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // prevent browser from restoring previous scroll on back/forward
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => {
  // ensure manual restoration set once as well
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <Router>
      <>
        {/* 3s auto-close toasts */}
        <ToastContainer position="top-right" autoClose={3000} />

        {/* scroll-to-top on every route change */}
        <ScrollToTop />

        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/studentgraduate" element={<StudentGraduate />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/graduatesignup" element={<GraduateSignUp />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/library" element={<Library />} />

          {/* Shared Protected */}
          <Route
            element={<RoleProtectedLayout allowedRoles={["Freelancer", "Client", "Admin"]} />}
          >
            <Route path="/messages" element={<Messages />} />
            <Route path="/freelancerprofile/:id" element={<FreelancerProfile />} />
            <Route path="/freelancers" element={<FreelancersList />} />
            <Route path="/project-details/:id" element={<ProjectDetails />} />
          </Route>

          {/* Freelancer */}
          <Route element={<RoleProtectedLayout allowedRoles={["Freelancer"]} />}>
            <Route path="/freelancer-home" element={<FreelancerHome />} />
            <Route path="/allprojects" element={<AllProjects />} />
            <Route path="/Assignedprojects" element={<AssignedProjects />} />
            <Route path="/savedprojects" element={<SavedProjects />} />
            <Route path="/myapplications" element={<MyApplications />} />
            <Route path="/myprofile" element={<MyProfile />} />
            <Route path="/profilesettings" element={<ProfileSettings />} />
            <Route path="/my-project/:id" element={<MyProjectsDetails />} />
            <Route path="/terms" element={<TermsContent />} />
            <Route path="/booking" element={<BookingSpace />} />
            <Route path="/payment" element={<PaymentHistory />} />
            <Route path="/freelancer-notifications" element={<FreelancerNotifications />} />
          </Route>

          {/* Client */}
          <Route element={<RoleProtectedLayout allowedRoles={["Client"]} />}>
            <Route path="/clienthome" element={<ClientHome />} />
            <Route path="/browseprojects" element={<BrowseProjects />} />
            <Route path="/postproject" element={<PostProject />} />
            <Route path="/assignedProject" element={<AssignedProject />} />
            <Route path="/submittedprojects" element={<SubmittedProjects />} />
            <Route path="/assigned-project/:id" element={<ProjectProgress />} />
            <Route path="/payments" element={<PaymentsLedger />} />
            <Route path="/bookingsTable" element={<BookingsTable />} />
            <Route path="/submitted-project/:id" element={<SubmittedProjectDetailsPage />} />
            <Route path="/project-applications" element={<ProjectApplications />} />
            <Route path="/analyticsclient" element={<AnalyticsClient />} />
            <Route path="/edit-project/:id" element={<EditProject />} />
            <Route path="/profilesettingsclint" element={<ProfileSettingsClient />} />
            <Route path="/client-notifications" element={<ClientNotifications />} />
            <Route path="/resources" element={<PostResource />} />

          </Route>

          {/* Admin */}
          <Route element={<RoleProtectedLayout allowedRoles={["Admin"]} />}>
            <Route path="/clientlist" element={<Clientlist />} />
            <Route path="/addusers" element={<AddUsers />} />
            <Route path="/analyticsadmin" element={<AnalyticsAdmin />} />
            <Route path="/adminallprojects" element={<AdminAllProjects />} />
            <Route path="/details" element={<AdminProjectDetails />} />
            <Route path="/adminprofilesettings" element={<AdminProfileSettings />} />
            <Route path="/edituser/:userId" element={<EditUserProfile />} />
            <Route path="/auditlogs" element={<AuditLogs />} />
            <Route path="/freelancersDetails" element={<FreelancersDetails />} />
            <Route path="/admin-notifications" element={<AdminNotifications />} />
          </Route>
        </Routes>
      </>
    </Router>
  );
};

export default App;