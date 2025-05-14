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
import axios from "axios";
import { FiPaperclip } from "react-icons/fi";
import { showAlert } from '../utils/toastMessages';


const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [navbarConfig, setNavbarConfig] = useState(NavConfig1);

  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [projectFiles, setProjectFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [projectImage, setProjectImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const projectFileInput = useRef();
  const projectImageInput = useRef();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role;
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
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project) {
      setProjectTitle(project.title || "");
      setDescription(project.brief || "");
      setCategory(project.category || "");
      setBudget(project.budget || "");
      setStartDate(project.duration?.from?.split("T")[0] || "");
      setEndDate(project.duration?.to?.split("T")[0] || "");
      setStatus(project.status || "");
      setExistingFiles(project.files || []);
      setExistingImage(project.imageUrl || null);
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", projectTitle);
    formData.append("brief", description);
    formData.append("category", category);
    formData.append("budget", budget);
    formData.append("status", status);
    formData.append("durationFrom", startDate);
    formData.append("durationTo", endDate);

    if (projectImage instanceof File) {
      formData.append("projectImage", projectImage);
    }

    projectFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append("projectFile", file);
      }
    });

    try {
      await axios.put(`http://localhost:5000/api/projects/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showAlert("Project updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Update failed:", error);
      showAlert("Failed to update project.");
    }
  };

  const handleMultipleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProjectFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjectImage(file);
    }
    e.target.value = "";
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
    <FiPaperclip />
    Attach Files
  </button>

  <input
    type="file"
    multiple
    ref={projectFileInput}
    onChange={handleMultipleFileChange}
    hidden
  />

  <div className="post-project-filename-list">
    {existingFiles.map((file, idx) => (
      <div key={`existing-${idx}`} className="post-project-filename-item">
        {file.name}
      </div>
    ))}

    {projectFiles.map((file, idx) => (
      <div key={`new-${idx}`} className="post-project-filename-item">
        {file.name}
        <button
          type="button"
          className="post-project-remove-btn"
          onClick={() =>
            setProjectFiles((prev) => prev.filter((_, i) => i !== idx))
          }
        >
          ×
        </button>
      </div>
    ))}
  </div>
</div>
<div className="post-project-upload-group">
  <label>Project Image*</label>
  <button
    type="button"
    className="post-project-button post-project-submit-btn"
    onClick={() => projectImageInput.current.click()}
  >
    <FiPaperclip  />
    Attach Image
  </button>

  <input
    type="file"
    accept="image/*"
    ref={projectImageInput}
    onChange={handleImageChange}
    hidden
  />

  {projectImage ? (
    <div className="post-project-filename-item post-project-image-preview">
      {projectImage.name}
      <button
        type="button"
        className="post-project-remove-btn"
        onClick={() => setProjectImage(null)}
      >
        ×
      </button>
    </div>
  ) : (
    existingImage && (
      <div className="post-project-filename-item post-project-image-preview">
        {existingImage.split("/").pop()}
      </div>
    )
  )}
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
