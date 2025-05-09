import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//General
import LandingPage from './Pages/LandingPage';
import StudentGraduate from './Pages/StudentOrGraduate';
import SignUpPage from './Pages/SignUpPage';
import GraduateSignUp from './Pages/GraduateSignUp';
import LoginPage from './Pages/LoginPage';
import AboutUs from './Pages/AboutUs';
import EditProject from './Pages/EditProject';
import ProjectDetailsPage from './Pages/ProjectDetailsPage';
import ProjectDetails from './Pages/ProjectDetails';
import FreelancerProfile from './Pages/FreelancerProfile';
import FreelancersList from './Pages/FreelancersList';
import Messages from  './Pages/Messages';


//Freelancer
import FreelancerHome from './Pages/Freelancer/FreelancerHome';
import AllProjects from './Pages/Freelancer/AllProjects';
import MyProjects from './Pages/Freelancer/MyProjects';
import SavedProjects from './Pages/Freelancer/SavedProjects';
import MyApplications from './Pages/Freelancer/MyApplications';
import MyProfile from './Pages//Freelancer/MyProfile';
import ProfileSettings from './Pages/Freelancer/ProfileSettings';
import FreelanceNotifications from './Pages/Freelancer/FreelancerNotifications';
import FreelancerMessages from './Pages/Freelancer/FreelancerMessages';
import MyProjectsDetails from './Pages/Freelancer/MyProjectsDetails';


//Client
import ClientHome from './Pages/Clients/ClientHome';
import PostProject from './Pages/Clients/PostProject';
import AssignedProject from './Pages/Clients/AssignedProject';
import SubmittedProjects from './Pages/Clients/SubmittedProjects';
import SubmittedProjectDetailsPage from './Pages/Clients/SubmittedProjectDetailsPage';
import ProjectApplications from './Pages/Clients/ProjectApplications';
import AnalyticsClient from './Pages/Clients/AnalyticsClients';
import BrowseProjects from './Pages/Clients/BrowseProjects';
import ProjectProgress from './Pages/Clients/ProjectProgress';
import ProfileSettingsClient from './Pages/Clients/ProfileSettingsClient';
import ClientProjects from './Pages/Clients/ClientProjects';




//Admin
import AdminAllProjects from './Pages/Admin/AdminAllProjects';
import Clientlist from './Pages/Admin/UsersList';
import AddUsers from './Pages/Admin/AddUsers';
import AnalyticsAdmin from './Pages/Admin/AnalyticsAdmin';
import AdminProfileSettings from './Pages/Admin/AdminProfileSettings';
import AdminNotifications from './Pages/Admin/AdminNotifications';
import AdminMessages from './Pages/Admin/AdminMessages';
import AdminProjectDetails from './Pages/Admin/AdminProjectDetails';
import EditUserProfile from './Pages/Admin/EditUserProfile';
import AuditLogs from './Pages/Admin/AuditLogs';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/studentgraduate" element={<StudentGraduate />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/graduatesignup" element={<GraduateSignUp />} />
        <Route path="/aboutus" element={<AboutUs />} /> 
        <Route path="/freelancerprofile" element={<FreelancerProfile />} />
        <Route path="/freelancers" element={<FreelancersList />} /> 
        <Route path="/freelancer-home" element={<FreelancerHome />} />
        <Route path="/messages" element={<Messages />} />

      


        <Route path="/allprojects" element={<AllProjects />} /> 
        <Route path="/myprojects" element={<MyProjects />} /> 
        <Route path="/savedprojects" element={<SavedProjects />} /> 
        <Route path="/myapplications" element={<MyApplications />} /> 
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/profilesettings" element={<ProfileSettings />} />
        <Route path="/freelancernotifications" element={<FreelanceNotifications />} />
        <Route path="/freelancermessages" element={<FreelancerMessages />} />
        <Route path="/freelancerprofile/:id" element={<FreelancerProfile />} />
        <Route path="my-project/:id" element={<MyProjectsDetails />} />



        <Route path="/clienthome" element={<ClientHome />} /> 
        <Route path="/browseprojects" element={<BrowseProjects />} />
        <Route path="/postproject" element={<PostProject />} />  
        <Route path="/assignedProject" element={<AssignedProject />} />  
        <Route path="/submittedprojects" element={<SubmittedProjects />} />  
        <Route path="/assigned-project/:id" element={<ProjectProgress />} />
        <Route path="/project-info/:id" element={<ProjectDetailsPage />} />
        <Route path="/submitted-project/:id" element={<SubmittedProjectDetailsPage />} />
        <Route path="/project-applications" element={<ProjectApplications />} />
        <Route path="/analyticsclient" element={<AnalyticsClient />} />
        <Route path="/edit-project/:id" element={<EditProject />} />
        <Route path="/project-details/:id" element={<ProjectDetails />} />
        <Route path="/profilesettingsclint" element={<ProfileSettingsClient />} />
        <Route path="/clientprojects" element={<ClientProjects />} />



        


        <Route path="/clientlist" element={<Clientlist />} />
        <Route path="/addusers" element={<AddUsers />} />
        <Route path="/analyticsadmin" element={<AnalyticsAdmin />} />
        <Route path="/adminallprojects" element={<AdminAllProjects />} />
        <Route path="/details" element={<AdminProjectDetails />} /> 
        <Route path="/adminprofilesettings" element={<AdminProfileSettings />} />
        <Route path="/adminnotifications" element={<AdminNotifications />} />
        <Route path="/adminmessages" element={<AdminMessages />} />
        <Route path="/edituser/:userId" element={<EditUserProfile />} />
        <Route path="/auditlogs" element={<AuditLogs />} />
      </Routes>
    </Router>
  );
};

export default App;
