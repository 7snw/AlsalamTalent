// src/Pages/Clients/ProjectProgress.js
import React from "react";
import { useParams } from "react-router-dom";
import "../../Style/Clients/ProjectProgress.css";
import Navbar from "../../Components/Navbar";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import ProjectsData from "../../Data/ProjectsData";
import Footer from '../../Components/Footer';


const ProjectProgress = () => {
  const { id } = useParams();
  const project = ProjectsData.deitailes[parseInt(id)];

  if (!project) return <p>Project not found</p>;

  return (
    <div className="project-progress-page">
      <Navbar links={NavConfig3} />
      <div className="progress-container">
        <h2>Project Progress</h2>

        <div className="top-section">
          <div className="left-section">
            <h4>Project Files:</h4>
            <button className="download-btn">Download Files </button>
            <h4>Contract Documents:</h4>
            <button className="download-btn">Download Files </button>
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
                  strokeDasharray="66, 100"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <text x="18" y="20.35" className="percentage">
                  66.6%
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
            <p>{project.description}</p>
            <h4>Budget/Price:</h4>
            <p>{project.budget}</p>
            <h4>Duration:</h4>
            <p>{project.duration}</p>
          </div>
          <div className="details-right">
            <img src={project.coverImage}alt={project.title} className="project-image"/>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectProgress;
