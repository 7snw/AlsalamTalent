import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { FiDownload } from 'react-icons/fi';
import { showAlert } from '../utils/toastMessages';


const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [navbarConfig, setNavbarConfig] = useState(NavConfig1);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  const role = storedUser?.role;

  useEffect(() => {
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
  }, [role]);

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
  useEffect(() => {
    const checkIfApplied = async () => {
      if (role === "freelancer" && userId && project?._id) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/applications/check`,
            {
              params: {
                freelancerId: userId,
                projectId: project._id,
              },
            }
          );

          if (res.data?.applied) {
            setApplied(true);
          }
        } catch (err) {
          console.error("Error checking application status:", err);
        }
      }
    };

    checkIfApplied();
  }, [role, userId, project]);

  const handleApply = async () => {
    try {
      await axios.post("http://localhost:5000/api/applications/create", {
        projectId: project._id,
        freelancerId: userId,
        authorId: project.authorId,
      });

      // If the application is accepted
      showAlert("Successfully applied to this project!");
      setApplied(true);
    } catch (error) {
      const message = error.response?.data?.message;

      // If already applied (backend message)
      if (message?.toLowerCase().includes("already")) {
        showAlert("You have already applied to this project.");
        setApplied(true); // Reflect immediately
      } else {
        console.error("Error applying to project:", error);
        showAlert("An error occurred while applying.");
      }
    }
  };

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="project-details-page">
      <Navbar links={navbarConfig} />
      <div className="details-container">
        <h2>{project.title}</h2>
        <div className="details-layout">
          <div className="left">
            <h4>Author:</h4>
            <p>
              {project.authorId?.fullName || project.authorName || "Unknown"}
            </p>

            <h4>Project Brief:</h4>
            <p>{project.brief}</p>

            <h4>Budget:</h4>
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
  <ul className="attached-files-list6">
    {project.files.map((file, idx) => (
      <li key={idx} className="attached-file-item6">
        {file.name}
        <button
          type="button"
          className="download-btn6"
          onClick={() => window.open(file.url, '_blank')}
        >
          <FiDownload size={18} />
        </button>
      </li>
    ))}
  </ul>
) : (
  <p>No files uploaded by client.</p>
)}

            {role === "freelancer" && (
  <button
    className={`apply-btn ${applied ? "applied" : ""}`}
    onClick={
      !applied && project.status === "Open"
        ? handleApply
        : undefined
    }
    disabled={project.status !== "Open" || applied}
  >
    {project.status === "Assigned"
      ? "Already Assigned"
      : project.status === "Submitted"
      ? "Submitted"
      : project.status === "Completed"
      ? "Project Completed"
      : applied
      ? "Already Applied"
      : "Apply for this Project"}
  </button>
)}


            {role === "client" && storedUser?._id === project.authorId?._id && (
              <button
                className="mod-btn5"
                onClick={() => navigate(`/edit-project/${project._id}`)}
              >
                Edit Project
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
