// src/Pages/Clients/ProjectDetails.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../Style/ProjectDetailsPage.css';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

import {
  NavConfig1,
  NavConfig2,
  NavConfig3,
  NavConfig4
} from '../Data/NavbarConfigs';
import ProjectsData from '../Data/ProjectsData';

const ProjectDetails = () => {
  const { id } = useParams();
  const [navbarConfig, setNavbarConfig] = useState(NavConfig1); // default fallback
  const project = ProjectsData.deitailes[parseInt(id)];

  useEffect(() => {
    const role = localStorage.getItem('role');
    switch (role) {
      case 'freelancer':
        setNavbarConfig(NavConfig2);
        break;
      case 'client':
        setNavbarConfig(NavConfig3);
        break;
      case 'admin':
        setNavbarConfig(NavConfig4);
        break;
      default:
        setNavbarConfig(NavConfig1);
    }
  }, []);

  if (!project) return <p>Project not found</p>;

  return (
    <div className="project-details-page">
      <Navbar links={navbarConfig} />

      <div className="details-container">
        <h2>{project.title}</h2>

        <div className="details-layout">
          <div className="left">
            <h4>Author / Organization:</h4>
            <p>{project.name}</p>

            <h4>Project Brief:</h4>
            <p>{project.description}</p>

            <h4>Budget/Price:</h4>
            <p>{project.budget}</p>

            <h4>Duration:</h4>
            <p>{project.duration || `${project.startDate} to ${project.endDate}`}</p>

            <h4>Status:</h4>
            <p>Open</p>

            <h4>Project Files:</h4>
            <button disabled={!project.files}>Download Files</button>
            <p>{project.projectFiles || 'No file uploaded'}</p>

            <h4>Contract Documents:</h4>
            <button disabled={!project.docs}>Download Docs</button>
            <p>{project.contractDocs || 'No document uploaded'}</p>
          </div>

          <div className="right">
            <img src={project.coverImage || project.image} alt={project.title} />
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ProjectDetails;
