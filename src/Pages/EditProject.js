import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Style/Clients/PostProject.css";
import "../Style/PageContents.css";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import {
  NavConfig1,
  NavConfig2,
  NavConfig3,
  NavConfig4,
} from "../Data/NavbarConfigs";
import uploadIcon from "../Assets/Upload.png";
import axios from "axios";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [navbarConfig, setNavbarConfig] = useState(NavConfig1);

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
        const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [projectFiles, setProjectFiles] = useState([]);
  const [projectImage, setProjectImage] = useState(null);

  const projectFileInput = useRef();
  const projectImageInput = useRef();

  useEffect(() => {
    if (project) {
      setProjectTitle(project.projectTitle || project.title || "");
      setDescription(project.description || project.brief || "");
      setCategory(project.category || "");
      setBudget(project.budget || "");
      setStartDate(project.duration?.from?.split("T")[0] || "");
      setEndDate(project.duration?.to?.split("T")[0] || "");
      setStatus(project.status || "");
      setProjectFiles(project.files || []);
      setProjectImage(project.imageUrl || null);
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedProject = {
      title: projectTitle,
      brief: description,
      category,
      budget,
      status,
      duration: {
        from: startDate,
        to: endDate,
      },
      files: projectFiles,
      imageUrl: projectImage || "",
    };

    try {
      await axios.put(`http://localhost:5000/api/projects/${id}`, updatedProject);
      alert("Project updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update project.");
    }
  };

  const handleMultipleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProjectFiles((prev) => [...prev, ...files.map(file => ({ name: file.name, url: `uploads/${file.name}` }))]);
    e.target.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjectImage(file.name);
    }
    e.target.value = '';
  };

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <div className="post-project-page">
      <Navbar links={navbarConfig} />
      <div className="post-project-container">
        <h2>Edit Project</h2>
        <form className="post-project-form" onSubmit={handleSubmit}>
          <label>Project Title*</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
          />

          <label>About this project/Description*</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

          <label>Project Category*</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            <option value="Marketing">Marketing</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Illustration">Illustration</option>
            <option value="Product Design">Product Design</option>
            <option value="Web Design">Web Design</option>
          </select>

          <label>Budget/Price*</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />

          <label>Timeframe/Duration*</label>
          <div className="post-project-date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <span className="post-project-to-separator">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <label>Status*</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Select Status</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="post-project-upload-group">
            <label>Project Files*</label>
            <button
              type="button"
              className="post-project-button post-project-submit-btn"
              onClick={() => projectFileInput.current.click()}
            >
              Attach File
              <img src={uploadIcon} alt="upload" className="post-project-upload-icon" />
            </button>
            <input
              type="file"
              multiple
              ref={projectFileInput}
              onChange={handleMultipleFileChange}
              hidden
            />
            {projectFiles.map((file, idx) => (
              <p key={idx} className="post-project-filename">{file.name}</p>
            ))}
          </div>

          <div className="post-project-upload-group">
            <label>Project Image*</label>
            <button
              type="button"
              className="post-project-button post-project-submit-btn"
              onClick={() => projectImageInput.current.click()}
            >
              Attach Image
              <img src={uploadIcon} alt="upload" className="post-project-upload-icon" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={projectImageInput}
              onChange={handleImageChange}
              hidden
            />
            {projectImage && <p className="post-project-filename">{projectImage}</p>}
          </div>

          <div className="post-project-actions">
            <button type="submit" className="post-project-button post">
              Update
            </button>
            <button
              type="button"
              className="post-project-button cancel"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditProject;
