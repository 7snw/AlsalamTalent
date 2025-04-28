// src/Pages/Clients/ProjectProgress.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Style/Clients/ProjectProgress.css";
import Navbar from "../../Components/Navbar";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import Footer from '../../Components/Footer';
import axios from 'axios';

const ProjectProgress = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found</p>;

  // Calculate progress based on status (example logic)
  const progressPercentage = project.status === 'Completed' ? 100 : 66; // you can adjust this dynamically later

  return (
    <div className="project-progress-page">
      <Navbar links={NavConfig3} />
      <div className="progress-container">
        <h2>Project Progress</h2>

        <div className="top-section">
          <div className="left-section">
            <h4>Project Files:</h4>
            {project.files && project.files.length > 0 ? (
              project.files.map((file, idx) => (
                <a
                  key={idx}
                  className="download-btn"
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  {file.name}
                </a>
              ))
            ) : (
              <p>No project files uploaded.</p>
            )}

            <h4>Contract Documents:</h4>
            {project.docs && project.docs.length > 0 ? (
              project.docs.map((doc, idx) => (
                <a
                  key={idx}
                  className="download-btn"
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  {doc.name}
                </a>
              ))
            ) : (
              <p>No contract documents uploaded.</p>
            )}
          </div>

          <div className="right-section">
            <div className="circular-chart">
              <svg viewBox="0 0 36 36" className="circular">
                <path
                  className="circle-bg"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <path
                  className="circle"
                  strokeDasharray={`${progressPercentage}, 100`}
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <text x="18" y="20.35" className="percentage">
                  {progressPercentage}%
                </text>
              </svg>
            </div>
          </div>
        </div>

        <hr />

        <div className="details-section">
          <div className="details-leftt">
            <h2>Project Details</h2>
            <h3>{project.title}</h3>

            <h4>Project Brief:</h4>
            <p>{project.brief}</p>

            <h4>Budget/Price:</h4>
            <p>{project.budget} BHD</p>

            <h4>Duration:</h4>
            <p>{new Date(project.duration.from).toLocaleDateString()} - {new Date(project.duration.to).toLocaleDateString()}</p>

            <h4>Status:</h4>
            <p>{project.status}</p>
          </div>

          <div className="details-right">
            <img src={project.imageUrl} alt={project.title} className="project-image" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectProgress;
