// src/Pages/Clients/PostProject.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Style/Clients/PostProject.css";
import "../../Style/PageContents.css";
import Navbar from "../../Components/Navbar";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import Footer from "../../Components/Footer";
import axios from "axios";
import { FiPaperclip } from "react-icons/fi";
import { showAlert } from "../../utils/toastMessages";
import SkillsInput from "../../Components/SkillsInput";

const CATEGORY_OPTIONS = [
  "Marketing",
  "Graphic Design",
  "Content Creation",
  "Product Design",
  "Web Design",
  "Photography",
  "Video & Motion",
  "Reports & Presentations"
];

const TYPE_OPTIONS = [
  { value: "project", label: "Project" },
  { value: "campaign", label: "Campaign" },
];

const PostProject = () => {
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [projectType, setProjectType] = useState("project");
  const [skills, setSkills] = useState([]);
  const [budget, setBudget] = useState("");

  const [initialDeadline, setInitialDeadline] = useState("");
  const [halfDeadline, setHalfDeadline] = useState("");
  const [finalDeadline, setFinalDeadline] = useState("");

  const [projectFiles, setProjectFiles] = useState([]);
  const [projectImage, setProjectImage] = useState(null);
  const filesInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const navigate = useNavigate();

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setProjectFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleImageChange = (e) => {
    setProjectImage((e.target.files && e.target.files[0]) || null);
    e.target.value = "";
  };

  const removeFileAt = (i) =>
    setProjectFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const authorId = storedUser?._id;
    if (!authorId) return showAlert("You must be logged in to post a project.");

    if (!category) return showAlert("Please select a project category.");
    if (skills.length === 0) return showAlert("Please add at least one skill.");
    if (!initialDeadline || !halfDeadline || !finalDeadline)
      return showAlert("Please set all three deadlines.");

    const formData = new FormData();
    formData.append("title", projectTitle);
    formData.append("brief", description);
    formData.append("category", category);
    formData.append("projectType", projectType);
    formData.append("authorId", authorId);
    formData.append("status", "Open");

    formData.append("initialDeadline", initialDeadline);
    formData.append("halfDeadline", halfDeadline);
    formData.append("finalDeadline", finalDeadline);

    formData.append("budget", String(budget || 0));
    formData.append("skills", JSON.stringify(skills));

    if (projectImage) formData.append("projectImage", projectImage);
    projectFiles.forEach((f) => formData.append("projectFile", f));

    try {
      await axios.post("http://localhost:5000/api/projects/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showAlert("Project successfully posted!");
      navigate("/browseprojects");
  
    } catch (err) {
      console.error("Project upload failed:", err?.response?.data || err);
      showAlert("Failed to post project.");
    }
  };

  return (
    <div className="post-project-page">
      <Navbar links={NavConfig3} />
      <div className="pp-container">
        <h1 className="pp-title">
          <span className="pp-accent">Post a Project</span>
        </h1>

        <form className="pp-form" onSubmit={handleSubmit}>
          <div className="pp-grid">
            {/* Title */}
            <div className="pp-field">
              <label>Project Title*</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="pp-field">
              <label>Project Category*</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Brief */}
            <div className="pp-field1">
              <label>Project Brief*</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Type + Initial deadline */}
            <div className="pp-field">
              <label>Project Type*</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                required
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <br />
              <br />
              <label>Initial Concept Deadline*</label>
              <input
                type="date"
                value={initialDeadline}
                onChange={(e) => setInitialDeadline(e.target.value)}
                required
              />

              <br></br>
            </div>

            {/* Skills + Reward + Image (left col) */}
            <div className="pp-field">
              <label>Skills*</label>
              <SkillsInput value={skills} onChange={setSkills} />
           <small style={{ opacity: 0.6, fontSize:"12px", marginTop: "-20px", marginBottom: "6px",display: "block" }}>
  Press <strong>Enter</strong> or <strong>,</strong> to add. Backspace removes the last tag.
</small>



              <label>Reward*</label>
              <input
                min={1}
                step={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />

              <br />
              <br />
              <div className="pp-field">
                <label>Project Images:</label>
                <button
                  type="button"
                  className="pp-attach"
                  onClick={() =>
                    imageInputRef.current && imageInputRef.current.click()
                  }
                >
                  Attach Image <FiPaperclip className="pp-clip" />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
                {projectImage && (
                  <div className="pp-fileitem pp-imageitem">
                    <span title={projectImage.name}>{projectImage.name}</span>
                    <button
                      type="button"
                      className="pp-remove"
                      onClick={() => setProjectImage(null)}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: other deadlines + files */}
            <div className="pp-field">
              <label>50% of the work Deadline*</label>
              <input
                type="date"
                value={halfDeadline}
                onChange={(e) => setHalfDeadline(e.target.value)}
                required
              />
              <br />
              <br />
              <label>Final Submission Deadline*</label>
              <input
                type="date"
                value={finalDeadline}
                onChange={(e) => setFinalDeadline(e.target.value)}
                required
              />
              <br />
              <br />
              <div className="pp-field">
                <label>Project Files:</label>
                <button
                  type="button"
                  className="pp-attach"
                  onClick={() =>
                    filesInputRef.current && filesInputRef.current.click()
                  }
                >
                  Attach Files <FiPaperclip className="pp-clip" />
                </button>
                <input
                  ref={filesInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFilesChange}
                />
                {projectFiles.length > 0 && (
                  <div className="pp-filelist">
                    {projectFiles.map((f, i) => (
                      <div key={`${f.name}-${i}`} className="pp-fileitem">
                        <span title={f.name}>{f.name}</span>
                        <button
                          type="button"
                          className="pp-remove"
                          onClick={() => removeFileAt(i)}
                          aria-label="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pp-field" />
          </div>


          <div className="pp-actions">
            <button type="submit" className="pp-btn pp-primary"   onClick={() => {
    // call save function
    navigate("/client-home"); // then navigate
  }}
>

    
              Post
            </button>
            <button
              type="button"
              className="pp-btn pp-secondary"
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
