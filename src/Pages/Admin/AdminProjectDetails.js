import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../Style/Admin/ProjectDetailsPage.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';

const AdminProjectDetails = () => {
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

  return (
    <div className="project-details-page">
      <Navbar links={NavConfig4} />
      <div className="details-container">
        <h2>{project.title}</h2>
        <div className="details-layout">
          <div className="left">
            <p>{project.brief}</p>
            <h4>Budget/Price:</h4>
            <p>{project.budget} BHD</p>
            <h4>Duration:</h4>
            <p>{new Date(project.duration?.from).toLocaleDateString()} - {new Date(project.duration?.to).toLocaleDateString()}</p>
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

export default AdminProjectDetails;
