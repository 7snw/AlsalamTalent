// src/Pages/Clients/ProjectDetailsPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import '../../Style/Clients/ProjectDetailsPage.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import ProjectsData from '../../Data/ProjectsData';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const project = ProjectsData.deitailes[parseInt(id)];

  if (!project) return <p>Project not found</p>;

  return (
    <div className="project-details-page">
      <Navbar links={NavConfig3} />
      <div className="details-container">
        <h2>{project.title}</h2>
        <div className="details-layout">
          <div className="left">
          <h4>Project Brief:</h4>
            <p>{project.description}</p>
            <h4>Budget/Price:</h4>
            <p>{project.budget}</p>
            <h4>Duration:</h4>
            <p>{project.duration}</p>
            <h4>Status:</h4>
            <p>{project.statuss}</p>
            <h4>Project Files:</h4>
            <button>Download Files</button>
            <h4>Contract Documents:</h4>
            <button>Download Docs</button>
          </div>
          <div className="right">
            <img src={project.coverImage} alt={project.title} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
