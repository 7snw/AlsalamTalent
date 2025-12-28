import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../Style/Admin/ProjectDetailsPage.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';

// AdminProjectDetails: Displays full project information for admins
const AdminProjectDetails = () => {
  const { id } = useParams(); // Get project ID from URL parameters
  const [project, setProject] = useState(null); // State to hold project data
  const [loading, setLoading] = useState(true); // State to show loading status

  // Fetch project details from API on component mount
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(response.data); // Set the fetched project data
      } catch (error) {
        console.error('Error fetching project:', error); // Log if fetch fails
      } finally {
        setLoading(false); // Turn off loading in all cases
      }
    };

    fetchProject();
  }, [id]); // Rerun effect if `id` changes

  // Show loading indicator
  if (loading) return <p>Loading project...</p>;
  // Show message if no project found
  if (!project) return <p>Project not found</p>;

  return (
    <div className="project-details-page">
      <Navbar links={NavConfig4} /> {/* Admin-specific navbar */}

      <div className="details-container">
        {/* Project Title */}
        <h2>{project.title}</h2>

        <div className="details-layout">
          {/* Left Section with Text Content */}
          <div className="left">
            <p>{project.brief}</p>

            {/* Budget */}
            <h4>Reward:</h4>
            <p>BHD {project.budget} </p>

            {/* Duration Dates */}
            <h4>Duration:</h4>
            <p>
              {new Date(project.duration?.from).toLocaleDateString()} -{' '}
              {new Date(project.duration?.to).toLocaleDateString()}
            </p>

            {/* Files Uploaded by Client */}
            <h4>Project Files:</h4>
            {project.files && project.files.length > 0 ? (
              project.files.map((file, idx) => (
                <div key={idx}>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                    {file.name}
                  </a>
                </div>
              ))
            ) : (
              <p>No project files uploaded</p>
            )}

            {/* Contract Documents */}
            <h4>Contract Documents:</h4>
            {project.docs && project.docs.length > 0 ? (
              project.docs.map((doc, idx) => (
                <div key={idx}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                    {doc.name}
                  </a>
                </div>
              ))
            ) : (
              <p>No contract documents uploaded</p>
            )}
          </div>

          {/* Right Section with Project Image */}
          <div className="right">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} />
            ) : (
              <p>No image available</p>
            )}
          </div>
        </div>
      </div>

      <Footer /> {/* Footer */}
    </div>
  );
};

export default AdminProjectDetails;
