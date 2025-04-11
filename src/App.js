import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './Pages/LandingPage';
import StudentGraduate from './Pages/StudentOrGraduate';
import SignUpPage from './Pages/SignUpPage';
import GraduateSignUp from './Pages/GraduateSignUp';
import LoginPage from './Pages/LoginPage';
import AboutUs from './Pages/AboutUs';
import FreelancerHome from './Pages/FreelancerHome';
import ClientHome from './Pages/Clients/ClientHome';
import PostProject from './Pages/Clients/PostProject';
import AssignedProject from './Pages/Clients/AssignedProject';
import SubmittedProjects from './Pages/Clients/SubmittedProjects';
import ProjectDetailsPage from './Pages/Clients/ProjectDetailsPage';
import SubmittedProjectDetailsPage from './Pages/Clients/SubmittedProjectDetailsPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studentgraduate" element={<StudentGraduate />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/graduatesignup" element={<GraduateSignUp />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/freelancer-home" element={<FreelancerHome />} /> {/* 👈 New route */}
        <Route path="/client-home" element={<ClientHome />} /> {/* 👈 New route */}
        <Route path="/postproject" element={<PostProject />} />  
        <Route path="/assignedProject" element={<AssignedProject />} />  
        <Route path="/submittedprojects" element={<SubmittedProjects />} />  
        <Route path="/assigned-project/:id" element={<ProjectDetailsPage />} />
        <Route path="/submitted-project/:id" element={<SubmittedProjectDetailsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
