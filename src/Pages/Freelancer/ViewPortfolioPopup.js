// src/Pages/Freelancer/ViewPortfolioPopup.js
import React, { useEffect, useState } from "react";
import "../../Style/Freelancer/ViewPortfolioPopup.css";
import axios from "axios";
import { showAlert } from "../../utils/toastMessages";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const ViewPortfolioPopup = ({ project, onClose, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?._id || "";

  const handlePrev = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? (project?.imageUrls?.length || 1) - 1 : prev - 1
    );

  const handleNext = () =>
    setCurrentIndex((prev) =>
      prev === (project?.imageUrls?.length || 1) - 1 ? 0 : prev + 1
    );

  const handleToggleFullScreen = () => setIsFullScreen((v) => !v);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/freelancer/portfolio/${project._id}`);
      showAlert("Project deleted successfully!");
      onDelete(project._id);
      onClose();
    } catch (error) {
      console.error("Error deleting project:", error);
      showAlert("Failed to delete project.");
    }
  };

  // close when clicking the overlay
  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // after hooks are declared, it’s safe to early-return
  if (!project) return null;

  const currentImage = project.imageUrls?.[currentIndex] || "";
  const isOwner = [project?.createdBy, project?.ownerId].filter(Boolean).map(String).includes(String(userId));
  const hasSkills = Array.isArray(project?.skills) && project.skills.length > 0;

  return (
    <div
      className={`popup-overlay0 ${isFullScreen ? "fullscreen-mode" : ""}`}
      onClick={onOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="popup-box0">
        {!isFullScreen && <h2 className="popup-title0">Project Details</h2>}

        <div className="popup-content0">
          {!isFullScreen && <p><strong>Project Image:</strong></p>}

          {currentImage ? (
            <div style={{ position: "relative" }}>
              <img
                src={currentImage}
                alt={`Portfolio ${currentIndex + 1}`}
                style={{ width: "100%", borderRadius: "10px", cursor: "pointer" }}
                onClick={handleToggleFullScreen}
              />

              {project.imageUrls.length > 1 && !isFullScreen && (
                <>
                  <button
                    onClick={handlePrev}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "10px",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                    }}
                  >
                    &#8592;
                  </button>
                  <button
                    onClick={handleNext}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                    }}
                  >
                    &#8594;
                  </button>
                </>
              )}
            </div>
          ) : (
            <p>No images available.</p>
          )}

          {!isFullScreen && (
            <>
              <p><strong>Description:</strong></p>
              <p>{project.description || "No description available."}</p>

          

              <br />

              <p><strong>Skills:</strong></p>
              {hasSkills ? (
                <div className="skills-list3" style={{ marginTop: 6 }}>
                  {project.skills.map((s, i) => (
                    <span key={i} className="skill-pill3">{s}</span>
                  ))}
                </div>
              ) : project.category ? (
                <div className="skills-list3" style={{ marginTop: 6 }}>
                  <span className="skill-pill3">{project.category}</span>
                </div>
              ) : (
                <p>N/A</p>
              )}

    {Array.isArray(project.collaborators) && project.collaborators.length > 0 && (
                <>
                  <br />
                  <p><strong>Collaborators:</strong></p>
                  <div className="collab-chips">
                    {project.collaborators.map((c) => {
                      const display = c.fullName || c.email || "User";
                      return (
                        <span className="collab-chip" key={c._id} title={c.email || display}>
                          <span className="collab-avatar">
                            <FaUser size={12} color="#1b223c" />
                          </span>
                          <Link to={`/freelancerprofile/${c._id}`} className="collab-name">
                            {display}
                          </Link>
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="popup-actions0">
                {isOwner && (
                  <button onClick={handleDelete} className="delete-btn0">
                    Delete Portfolio
                  </button>
                )}
                {/* Close button intentionally removed */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPortfolioPopup;
