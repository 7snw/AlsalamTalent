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
      </Routes>
    </Router>
  );
};

export default App;
