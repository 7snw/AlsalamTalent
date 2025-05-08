import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Style/Clients/ProjectProgress.css";
import "../../Style/CircularProgress.css";
import Navbar from "../../Components/Navbar";
import Footer from '../../Components/Footer';
import { NavConfig3 } from "../../Data/NavbarConfigs";
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

  const getStatusClass = () => {
    switch (project.status?.toLowerCase()) {
      case 'open':
        return 'open';
      case 'assigned':
      case 'in-progress':
        return 'inprogress';
      case 'submitted':
        return 'submitted';
      case 'completed':
        return 'completed';
      default:
        return 'open';
    }
  };

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found</p>;

  const progressText = {
    'open': 0,
    'in-progress': 50,
    'assigned': 50,
    'submitted': 75,
    'completed': 100
  }[project.status?.toLowerCase()] ?? 0;

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
          </div>

          <div className="right-section">
            <div className="circular-chart">
              <svg viewBox="0 0 36 36" className="circular">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`circle ${getStatusClass()}`}
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">
                  {progressText}%
                </text>
              </svg>
            </div>
          </div>
        </div>

        <hr />

        <div className="details-section">
          <div className="details-left">
            <h2>Project Details</h2>
            <h3>{project.title}</h3>

            <h4>Project Brief:</h4>
            <p>{project.brief || project.description}</p>

            <h4>Budget/Price:</h4>
            <p>{project.budget} BHD</p>

            <h4>Duration:</h4>
            {project.duration?.from && project.duration?.to ? (
              <p>{new Date(project.duration.from).toLocaleDateString()} - {new Date(project.duration.to).toLocaleDateString()}</p>
            ) : (
              <p>Duration not specified</p>
            )}

            <h4>Status:</h4>
            <p>{project.status}</p>
          </div>

          <div className="details-right">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} className="project-image" />
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

export default ProjectProgress;
