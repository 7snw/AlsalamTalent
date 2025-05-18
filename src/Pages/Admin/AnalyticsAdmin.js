import React, { useEffect, useState } from 'react';
import '../../Style/Admin/AnalyticsAdmin.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const AnalyticsAdmin = () => {
  const [analytics, setAnalytics] = useState({
    totalClients: 0,
    totalFreelancers: 0,
    totalProjects: 0,
    projectsProgress: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      }
    };

    fetchAnalytics();
  }, []);

  const COLORS = ['#f1633a', '#1B223C', '#8884d8'];

  const pieData = [
    { name: 'Clients', value: analytics.totalClients },
    { name: 'Freelancers', value: analytics.totalFreelancers },
    { name: 'Projects', value: analytics.totalProjects },
  ];

  return (
    <div className="analytics-page2">
      <Navbar links={NavConfig4} />
      <div className="analytics-container2">
        <h2> Analytics</h2>

        <div className="summary-cards2">
          <div className="card22 clickable" onClick={() => navigate('/clientlist')}>
            <h4>Total Clients</h4>
            <div className="big-number2">{analytics.totalClients}</div>
          </div>
          <div className="card22 clickable" onClick={() => navigate('/freelancers')}>
            <h4>Total Freelancers</h4>
            <div className="big-number2">{analytics.totalFreelancers}</div>
          </div>
          <div className="card22 clickable" onClick={() => navigate('/adminallprojects')}>
            <h4>Total Projects</h4>
            <div className="big-number2">{analytics.totalProjects}</div>
          </div>
        </div>

        <div className="details-section2">
          <div className="card progress2">
            <h4>Projects Progress Overview</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.projectsProgress}>
                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#f1633a" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card performance2">
            <h4>System Breakdown</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnalyticsAdmin;
