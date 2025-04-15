import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//General
import LandingPage from './Pages/LandingPage';
import StudentGraduate from './Pages/StudentOrGraduate';
import SignUpPage from './Pages/SignUpPage';
import GraduateSignUp from './Pages/GraduateSignUp';
import LoginPage from './Pages/LoginPage';
import AboutUs from './Pages/AboutUs';

//Freelancer
import FreelancerHome from './Pages/Freelancer/FreelancerHome';
import FreelancersList from './Pages/Freelancer/FreelancersList';
import AllProjects from './Pages/Freelancer/AllProjects';
import MyProjects from './Pages/Freelancer/MyProjects';
import SavedProjects from './Pages/Freelancer/SavedProjects';
import MyApplications from './Pages/Freelancer/MyApplications';
import SubmitProject from './Pages/Freelancer/SubmitProject';
import SubmitProgress from './Pages/Freelancer/SubmitProgress';
import FreelancerAboutUs from './Pages/Freelancer/FreelancerAboutUs';
import FreelancerProfile from './Pages/Freelancer/FreelancerProfile';
import MyProfile from './Pages/Freelancer/MyProfile';
import ProfileSettings from './Pages/Freelancer/ProfileSettings';
import FreelanceNotifications from './Pages/Freelancer/FreelancerNotifications';
import FreelancerMessages from './Pages/Freelancer/FreelancerMessages';


//Client
import ClientHome from './Pages/Clients/ClientHome';
import PostProject from './Pages/Clients/PostProject';
import AssignedProject from './Pages/Clients/AssignedProject';
import SubmittedProjects from './Pages/Clients/SubmittedProjects';
import ProjectDetailsPage from './Pages/Clients/ProjectDetailsPage';
import SubmittedProjectDetailsPage from './Pages/Clients/SubmittedProjectDetailsPage';
import ProjectApplications from './Pages/Clients/ProjectApplications';
import AnalyticsClient from './Pages/Clients/AnalyticsClients';
import BrowseProjects from './Pages/Clients/BrowseProjects';


//Admin

import AdminAllProjects from './Pages/Admin/AdminAllProjects';
import UsersList from './Pages/Admin/UsersList';
import AddUsers from './Pages/Admin/AddUsers';
import AnalyticsAdmin from './Pages/Admin/AnalyticsAdmin';
import AdminProfile from './Pages/Admin/AdminProfile';
import AdminProfileSettings from './Pages/Admin/AdminProfileSettings';
import AdminNotifications from './Pages/Admin/AdminNotifications';
import AdminMessages from './Pages/Admin/AdminMessages';
import AdminProjectDetails from './Pages/Admin/AdminProjectDetails';
import EditUserProfile from './Pages/Admin/EditUserProfile';


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


        <Route path="/freelancer-home" element={<FreelancerHome />} />
        <Route path="/freelancers" element={<FreelancersList />} /> 
        <Route path="/allprojects" element={<AllProjects />} /> 
        <Route path="/myprojects" element={<MyProjects />} /> 
        <Route path="/savedprojects" element={<SavedProjects />} /> 
        <Route path="/myapplications" element={<MyApplications />} /> 
        <Route path="/submitproject" element={<SubmitProject />} /> 
        <Route path="/submitprogress" element={<SubmitProgress />} /> 
        <Route path="/freelanceraboutus" element={<FreelancerAboutUs />} /> 
        <Route path="/freelancerprofile" element={<FreelancerProfile />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/profilesettings" element={<ProfileSettings />} />
        <Route path="/freelancernotifications" element={<FreelanceNotifications />} />
        <Route path="/freelancermessages" element={<FreelancerMessages />} />


        <Route path="/clienthome" element={<ClientHome />} /> 
        <Route path="/browseprojects" element={<BrowseProjects />} />
        <Route path="/postproject" element={<PostProject />} />  
        <Route path="/assignedProject" element={<AssignedProject />} />  
        <Route path="/submittedprojects" element={<SubmittedProjects />} />  
        <Route path="/assigned-project/:id" element={<ProjectDetailsPage />} />
        <Route path="/submitted-project/:id" element={<SubmittedProjectDetailsPage />} />
        <Route path="/project-applications" element={<ProjectApplications />} />
        <Route path="/analyticsclient" element={<AnalyticsClient />} />
        


        <Route path="/userslist" element={<UsersList />} />
        <Route path="/addusers" element={<AddUsers />} />
        <Route path="/analyticsadmin" element={<AnalyticsAdmin />} />
        <Route path="/adminallprojects" element={<AdminAllProjects />} />
        <Route path="/details" element={<AdminProjectDetails />} /> 
        <Route path="/adminprofile" element={<AdminProfile />} />
        <Route path="/adminprofilesettings" element={<AdminProfileSettings />} />
        <Route path="/adminnotifications" element={<AdminNotifications />} />
        <Route path="/adminmessages" element={<AdminMessages />} />
        <Route path="/edituser" element={<EditUserProfile />} />

      </Routes>
    </Router>
  );
};

export default App;
