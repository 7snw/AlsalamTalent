// src/Pages/EditProject.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Style/Clients/PostProject.css";   // reuse pp-* + skills tag styles
import "../Style/PageContents.css";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import { NavConfig1, NavConfig2, NavConfig3, NavConfig4 } from "../Data/NavbarConfigs";
import axios from "axios";
import { FiPaperclip } from "react-icons/fi";
import { showAlert } from "../utils/toastMessages";
import SkillsInput from "../Components/SkillsInput";


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

const STATUS_OPTIONS = [
  { value: "Open", label: "Open" },
  { value: "Assigned", label: "Assigned" },
  { value: "Completed", label: "Completed" },
];

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /* Navbar per role */
  const [navbarConfig, setNavbarConfig] = useState(NavConfig1);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    switch ((storedUser?.role || "").toLowerCase()) {
      case "freelancer": setNavbarConfig(NavConfig2); break;
      case "client":     setNavbarConfig(NavConfig3); break;
      case "admin":      setNavbarConfig(NavConfig4); break;
      default:           setNavbarConfig(NavConfig1);
    }
  }, []);

  /* Form state (mirrors PostProject) */
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription]   = useState("");
  const [category, setCategory]         = useState("");
  const [projectType, setProjectType]   = useState("project"); // kept for backend compatibility
  const [skills, setSkills]             = useState([]);
  const [budget, setBudget]             = useState("");
  const [status, setStatus]             = useState("Open");

  const [initialDeadline, setInitialDeadline] = useState("");
  const [halfDeadline, setHalfDeadline]       = useState("");
  const [finalDeadline, setFinalDeadline]     = useState("");

  const [existingFiles, setExistingFiles] = useState([]); // [{name,url}] or [url]
  const [projectFiles, setProjectFiles]   = useState([]); // new uploads (File[])
  const [existingImage, setExistingImage] = useState(""); // url
  const [projectImage, setProjectImage]   = useState(null); // File

  /* Upload refs */
  const filesInputRef = useRef(null);
  const imageInputRef = useRef(null);

  /* Prefill */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProjectTitle(data.title || "");
        setDescription(data.brief || "");
        setCategory(data.category || "");
        setProjectType((data.projectType === "campaign") ? "campaign" : "project");
        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setBudget(data.budget ?? "");
        setStatus(data.status || "Open");

        // Prefer new deadlines; fallback to legacy duration
        const d = data.deadlines || {};
        setInitialDeadline(toInputDate(d.initial || data.duration?.from));
        setHalfDeadline(toInputDate(d.half || data.duration?.to));
        setFinalDeadline(toInputDate(d.final || d.half || data.duration?.to));

        setExistingFiles(Array.isArray(data.files) ? data.files : []);
        setExistingImage(data.imageUrl || "");
      } catch (e) {
        console.error("Fetch project failed:", e);
        showAlert("Failed to load project.");
        navigate(-1);
      }
    };
    load();
  }, [id, navigate]);

  /* File handlers */
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setProjectFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };
  const handleImageChange = (e) => {
    const f = (e.target.files && e.target.files[0]) || null;
    setProjectImage(f);
    e.target.value = "";
  };
  const removeNewFile = (i) => setProjectFiles((p) => p.filter((_, idx) => idx !== i));
  const removeExistingFile = (i) => setExistingFiles((p) => p.filter((_, idx) => idx !== i));

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category)      return showAlert("Please select a project category.");
    if (!skills.length) return showAlert("Please add at least one skill.");
    if (!initialDeadline || !halfDeadline || !finalDeadline)
      return showAlert("Please set all three deadlines.");

    const formData = new FormData();
    formData.append("title", projectTitle);
    formData.append("brief", description);
    formData.append("category", category);
    formData.append("projectType", projectType); // backend compatibility
    formData.append("budget", String(budget || 0));
    formData.append("status", status);

    // Deadlines
    formData.append("initialDeadline", initialDeadline);
    formData.append("halfDeadline", halfDeadline);
    formData.append("finalDeadline", finalDeadline);

    // Keep the remaining existing files (server merges with new uploads)
    formData.append(
      "existingFiles",
      JSON.stringify(existingFiles.map((f) => f.url || f))
    );

    // Skills array
    formData.append("skills", JSON.stringify(skills));

    if (projectImage) formData.append("projectImage", projectImage);
    projectFiles.forEach((f) => formData.append("projectFile", f));

    try {
      await axios.put(`http://localhost:5000/api/projects/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showAlert("Project updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Update failed:", err?.response?.data || err);
      showAlert("Failed to update project.");
    }
  };

  return (
    <div className="post-project-page">
      <Navbar links={navbarConfig} />

      <div className="pp-container">
        <h1 className="pp-title">
          <span className="pp-accent">Edit Project</span>
        </h1>

        <form className="pp-form" onSubmit={handleSubmit}>
          <div className="pp-grid">
            {/* Left column */}
            <div className="pp-field">
              <label>Project Title*</label>
              <input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
              />
            </div>

            <div className="pp-field">
              <label>Project Category*</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="pp-field1">
              <label>Project Brief*</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="pp-field">
              <label>Project Status*</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              <br /><br />
              <label>Initial Concept Deadline*</label>
              <input
                type="date"
                value={initialDeadline}
                onChange={(e) => setInitialDeadline(e.target.value)}
                required
              />
            </div>

            {/* Skills tags + reward + image (left col) */}
            <div className="pp-field">
              <label>Skills*</label>
              <SkillsInput value={skills} onChange={setSkills} />
            

              <label>Reward*</label>
              <input
                min={1}
                step={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />

              <br /><br />
              <div className="pp-field">
                <label>Project Images:</label>
                <button
                  type="button"
                  className="pp-attach"
                  onClick={() => imageInputRef.current?.click()}
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
                {projectImage ? (
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
                ) : (
                  !!existingImage && (
                    <div className="pp-fileitem pp-imageitem">
                      <span title={existingImage}>
                        {decodeURIComponent(existingImage.split("/").pop())}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right column: remaining deadlines + files */}
            <div className="pp-field">
              <label>50% of the work Deadline*</label>
              <input
                type="date"
                value={halfDeadline}
                onChange={(e) => setHalfDeadline(e.target.value)}
                required
              />
              <br /><br />
              <label>Final Submission Deadline*</label>
              <input
                type="date"
                value={finalDeadline}
                onChange={(e) => setFinalDeadline(e.target.value)}
                required
              />

              <br /><br />
              <div className="pp-field">
                <label>Project Files:</label>
                <button
                  type="button"
                  className="pp-attach"
                  onClick={() => filesInputRef.current?.click()}
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

                {/* Existing files (kept unless removed) */}
                {existingFiles.length > 0 && (
                  <div className="pp-filelist" style={{ marginTop: 10 }}>
                    {existingFiles.map((f, i) => (
                      <div key={`keep-${i}`} className="pp-fileitem">
                        <span title={f.url || f}>
                          {decodeURIComponent((f.name || (f.url || "")).split("/").pop())}
                        </span>
                        <button
                          type="button"
                          className="pp-remove"
                          onClick={() => removeExistingFile(i)}
                          aria-label="Remove kept file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New uploads preview */}
                {projectFiles.length > 0 && (
                  <div className="pp-filelist">
                    {projectFiles.map((f, i) => (
                      <div key={`new-${i}`} className="pp-fileitem">
                        <span title={f.name}>{f.name}</span>
                        <button
                          type="button"
                          className="pp-remove"
                          onClick={() => removeNewFile(i)}
                          aria-label="Remove new file"
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
            <button type="submit" className="pp-btn pp-primary">Update</button>
            <button type="button" className="pp-btn pp-secondary" onClick={() => navigate(-1)}>
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
