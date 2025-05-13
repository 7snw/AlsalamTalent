import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../Style/Clients/PostProject.css";
import "../../Style/PageContents.css";
import Navbar from "../../Components/Navbar";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import Footer from "../../Components/Footer";
import axios from "axios";
import { FiPaperclip } from "react-icons/fi";
import { showAlert } from '../../utils/toastMessages';



const PostProject = () => {
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [projectFiles, setProjectFiles] = useState([]);
  const [projectImage, setProjectImage] = useState(null);

  const projectFileInput = useRef();
  const projectImageInput = useRef();
  const navigate = useNavigate();

  const handleProjectFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setProjectFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleProjectImageChange = (e) => {
    setProjectImage(e.target.files[0]);
    e.target.value = "";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const authorId = storedUser?._id;

    if (!authorId) {
      showAlert("You must be logged in to post a project.");
      return;
    }

    const formData = new FormData();
    formData.append("title", projectTitle);
    formData.append("brief", description);
    formData.append("budget", budget);
    formData.append("category", category);
    formData.append("authorId", authorId);
    formData.append("status", "Open");
    formData.append("durationFrom", startDate);
    formData.append("durationTo", endDate);

    if (projectImage) {
      formData.append("projectImage", projectImage);
    }

    projectFiles.forEach((file) => {
      formData.append("projectFile", file);
    });

    try {
      // ✅ 1. Upload project first
      await axios.post("http://localhost:5000/api/projects/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (uploadError) {
      console.error(
        "❌ Project upload failed:",
        uploadError.response?.data || uploadError.message
      );
      showAlert("Failed to post project.");
      return; //  Don't continue to notifications
    }

    try {
      await Promise.all([
        axios.post("http://localhost:5000/api/notifications/send", {
          userType: "admin",
          subject: "New Project Posted",
          message: `${storedUser.fullName} has just posted a new project: "${projectTitle}".`,
          type: "info",
        }),
        axios.post("http://localhost:5000/api/notifications/broadcast", {
          role: "freelancer",
          subject: "New Project Posted",
          message: `A new project has been posted: "${projectTitle}".`,
          type: "info",
        }),
      ]);
    } catch (notifyError) {
      console.warn(
        "⚠️ Project was posted, but notification failed:",
        notifyError.response?.data || notifyError.message
      );
      // Optional: show a toast or silent fail
    }

    showAlert("Project successfully posted!");
    navigate("/browseprojects");
  };

  return (
    <div className="post-project-page">
      <Navbar links={NavConfig3} />
      <div className="post-project-container">
        <h2>Post Project</h2>
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

          <label>Budget*</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />

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
             <option value="Illustration">Content Creation</option>
            <option value="Product Design">Product Design</option>
            <option value="Web Design">Web Design</option>
          </select>

          <label>Project Status</label>
          <input
            type="text"
            value="Open"
            disabled
            className="disabled-status-input"
          />
          <input type="hidden" name="status" value="Open" />

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

          {/* Status is fixed */}
          <input type="hidden" value="Open" />

          <div className="post-project-upload-group">
  <label>Project Files*</label>
  <button
    type="button"
    className="post-project-button post-project-submit-btn"
    onClick={() => projectFileInput.current.click()}
  >
    Attach Files
    <FiPaperclip />

  </button>
  <input
    type="file"
    ref={projectFileInput}
    onChange={handleProjectFilesChange}
    multiple
    hidden
  />

  <div className="post-project-filename-list">
    {projectFiles.map((file, idx) => (
      <div key={idx} className="post-project-filename-item">
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
    Attach Image
    <FiPaperclip />
  </button>

  <input
    type="file"
    accept="image/*"
    ref={projectImageInput}
    onChange={handleProjectImageChange}
    hidden
  />

  {projectImage && (
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
)}

</div>

          <div className="post-project-actions">
            <button type="submit" className="post-project-button post">
              Post
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

export default PostProject;
