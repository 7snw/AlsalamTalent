import React, { useEffect, useState } from 'react';
import '../../Style/Admin/AnalyticsAdmin.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3} from '../../Data/NavbarConfigs';
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
  LabelList,
} from 'recharts';


// PDF imports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Admin analytics dashboard showing total users, projects, and visual reports
const AnalyticsClient = () => {
  // Analytics state holds counts and progress data
  const [analytics, setAnalytics] = useState({
    totalClients: 0,
    totalFreelancers: 0,
    totalProjects: 0,
    projectsProgress: [],
    newUsersByMonth: [],    // chart 1
    projectsByStatus: [],   // chart 2
    projectsByCategory: [], // chart 3
    freelancerActivity: [], // chart 4
    topProjectCategory: null,
  });



  // Fetch analytics data on mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(
          'http://localhost:5000/api/admin/analytics'
        );
        setAnalytics(res.data); // Set retrieved data to state
      } catch (err) {
        console.error('Error fetching admin analytics:', err); // Log error if request fails
      }
    };

    fetchAnalytics();
  }, []);

  // Colors for charts
  const COLORS = ['#f1633a', '#1B223C', '#8884d8', '#ffb347', '#4caf50'];

  const Y_TICKS_0_TO_10 = [
    0,2,4,6,8,10
  ];

  // PDF export handler – summary of ALL charts
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text('ctrlZ – Admin Analytics Summary', 14, 18);

    // Meta info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    // 1) Summary metrics
    autoTable(doc, {
      startY: 34,
      head: [['Metric', 'Value']],
      body: [
        ['Total Clients', analytics.totalClients],
        ['Total Freelancers', analytics.totalFreelancers],
        ['Total Projects', analytics.totalProjects],
      ],
    });

    // 2) New Users Registered per Month (Aug–Dec)
    if (analytics.newUsersByMonth && analytics.newUsersByMonth.length > 0) {
      const startY = (doc.lastAutoTable && doc.lastAutoTable.finalY + 10) || 50;

      autoTable(doc, {
        startY,
        head: [['Month', 'New Clients', 'New Freelancers']],
        body: analytics.newUsersByMonth.map((row) => [
          row.month,
          row.clients ?? 0,
          row.freelancers ?? 0,
        ]),
      });
    }

    // 3) Projects Progress per Month (all months – optional)
    if (analytics.projectsProgress && analytics.projectsProgress.length > 0) {
      const startY = (doc.lastAutoTable && doc.lastAutoTable.finalY + 10) || 50;

      autoTable(doc, {
        startY,
        head: [['Month', 'Projects']],
        body: analytics.projectsProgress.map((row) => [
          row.month,
          row.projects ?? 0,
        ]),
      });
    }

    // 4) Projects by Status
    if (analytics.projectsByStatus && analytics.projectsByStatus.length > 0) {
      const startY = (doc.lastAutoTable && doc.lastAutoTable.finalY + 10) || 50;

      autoTable(doc, {
        startY,
        head: [['Status', 'Projects']],
        body: analytics.projectsByStatus.map((row) => [
          row.status,
          row.count,
        ]),
      });
    }

    // 5) Projects by Category
    if (analytics.projectsByCategory && analytics.projectsByCategory.length > 0) {
      const startY = (doc.lastAutoTable && doc.lastAutoTable.finalY + 10) || 50;

      autoTable(doc, {
        startY,
        head: [['Category', 'Projects']],
        body: analytics.projectsByCategory.map((row) => [
          row.category,
          row.count,
        ]),
      });
    }

    doc.save('ctrlZ_Platform_Analytics.pdf');
  };

  // ...imports + state + handleExportPDF stay exactly the same...

return (
  <div className="analytics-page2">
    <Navbar links={NavConfig3} /> {/* Admin navbar */}

    <div className="analytics-container2">
      <h2>Platform Analytics</h2>

      {/* Export PDF button */}
      <div className="analytics-actions-row">
        <button className="export-pdf-btn" onClick={handleExportPDF}>
Generate a Report 
        </button>
      </div>

    
    

      {/* Charts section */}
      <div className="details-section2">
        {/* 1) New Users Registered per Month */}
        <div className="card progress2">
          <h4>New Users Registered per Month</h4>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={analytics.newUsersByMonth}
              barCategoryGap={40}
              barGap={10}
              margin={{ top: 30, right: 30, left: 10, bottom: 40 }}
            >
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fontWeight: 500 }}
              />
              <YAxis
                domain={[0, 10]}
                ticks={Y_TICKS_0_TO_10}
                allowDecimals={false}
                tick={{ fontSize: 13 }}
              />
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ marginTop: 10 }}
              />
              <Bar
                dataKey="clients"
                name="Clients"
                fill="#f1633a"
                barSize={30}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="clients"
                  position="top"
                  offset={8}
                  style={{ fontSize: 13, fontWeight: 600, fill: '#1B223C' }}
                />
              </Bar>
              <Bar
                dataKey="freelancers"
                name="Freelancers"
                fill="#1B223C"
                barSize={30}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="freelancers"
                  position="top"
                  offset={8}
                  style={{ fontSize: 13, fontWeight: 600, fill: '#1B223C' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2) Projects by Status (unchanged) */}
        <div className="card performance2">
          <h4>Projects by Status</h4>
         <ResponsiveContainer width="100%" height={340}>
  <PieChart margin={{ top: 0}}>
    <Pie
      data={analytics.projectsByStatus}
      dataKey="count"
      nameKey="status"
      cx="50%"
      cy="50%"   // <<— Move pie chart UP
      outerRadius={105}
      label
    >
      {analytics.projectsByStatus.map((entry, index) => (
        <Cell
          key={`status-cell-${index}`}
          fill={COLORS[index % COLORS.length]}
        />
      ))}
    </Pie>
    <Legend verticalAlign="bottom" height={60} />
    <Tooltip />
  </PieChart>
</ResponsiveContainer>

        </div>

        {/* 3) Projects by Category – aligned to match New Users chart */}
        <div className="card performance2">
          <h4>Projects by Category</h4>

          <ResponsiveContainer width="100%" height={490}>
            <BarChart
              data={analytics.projectsByCategory}
              barCategoryGap={40}
              barGap={10}
              margin={{ top: 30, right: 30, left: 10, bottom: 120 }}
            >
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />

              <XAxis
                dataKey="category"
                interval={0}
                angle={-90}
                textAnchor="end"
                tick={{ fontSize: 13, fontWeight: 500 }}
                height={100}
              />

              <YAxis
                domain={[0, 10]}
                ticks={[0,2,4,6,8,10]}
                allowDecimals={false}
                tick={{ fontSize: 13 }}
              />

              <Tooltip />

              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ marginTop: 10 }}
              />

              <Bar
                dataKey="count"
                name="Projects"
                fill="#8884d8"
                barSize={30}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={8}
                  style={{ fontSize: 13, fontWeight: 500, fill: '#1B223C' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {analytics.topProjectCategory && (
            <p className="helper-text" style={{ marginTop: '-90px' }}>
              Most requested category:{' '}
              <strong>{analytics.topProjectCategory.category}</strong> (
              {analytics.topProjectCategory.count} projects)
            </p>
          )}
        </div>

        
      </div>
    </div>

    <Footer /> {/* Footer */}
  </div>
);
};

export default AnalyticsClient;
