// src/Pages/Clients/ProjectDetails.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../Style/ProjectDetailsPage.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import axios from "axios";

import {
  NavConfig1,
  NavConfig2,
  NavConfig3,
  NavConfig4,
} from "../Data/NavbarConfigs";

const ProjectDetails = () => {
  const { id } = useParams();
  const [navbarConfig, setNavbarConfig] = useState(NavConfig1); // default fallback
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    switch (role) {
      case "freelancer":
        setNavbarConfig(NavConfig2);
        break;
      case "client":
        setNavbarConfig(NavConfig3);
        break;
      case "admin":
        setNavbarConfig(NavConfig4);
        break;
      default:
        setNavbarConfig(NavConfig1);
    }
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/projects/${id}`
        );
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="project-details-page">
      <Navbar links={navbarConfig} />

      <div className="details-container">
        <h2>{project.title}</h2>

        <div className="details-layout">
          <div className="left">
            <h4>Author / Organization:</h4>
            <p>{project.authorName || "Unknown"}</p>

            <h4>Project Brief:</h4>
            <p>{project.brief}</p>

            <h4>Budget/Price:</h4>
            <p>{project.budget} BHD</p>

            <h4>Duration:</h4>
            {project.duration?.from && project.duration?.to ? (
              <p>
                {new Date(project.duration.from).toLocaleDateString()} -{" "}
                {new Date(project.duration.to).toLocaleDateString()}
              </p>
            ) : (
              <p>Duration not specified</p>
            )}

            <h4>Status:</h4>
            <p>{project.status || "Open"}</p>

            <h4>Project Files:</h4>
            {project.files && project.files.length > 0 ? (
              project.files.map((file, idx) => (
                <div key={idx}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-btn"
                    download
                  >
                    {file.name}
                  </a>
                </div>
              ))
            ) : (
              <p>No project files uploaded</p>
            )}

            {localStorage.getItem("role") === "freelancer" && (
              <button
                className="apply-btn"
                onClick={() => alert("Apply logic coming soon")}
              >
                Apply for this Project
              </button>
            )}
          </div>

          <div className="right">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} />
            ) : (
              <p>No image available</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectDetails;
