// src/Pages/Freelancer/MyProjectsDetails.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Style/Freelancer/MyProjectsDetails.css";
import Navbar from "../../Components/Navbar";
import { NavConfig2 } from "../../Data/NavbarConfigs";
import Footer from "../../Components/Footer";
import axios from "axios";
import { FiDownload } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
// import ChatBox from "../../Components/ChatBox";
import { showAlert } from "../../utils/toastMessages";

import PlaneIcon from "../../Assets/plane.png";
import HourglassIcon from "../../Assets/hourglass.png";
import ClockIcon from "../../Assets/clock.png";

/* ---------- config ---------- */
// Webpack/CRA-safe: do not use import.meta here
const RAW_API_BASE =
  (process.env.REACT_APP_API_BASE ||
    process.env.VITE_API_BASE ||
    "http://localhost:5000").trim();
const API_BASE = RAW_API_BASE.replace(/\/$/, ""); // remove trailing slash if present

const STAGES = [
  { key: "initial", title: "Initial Concept", icon: PlaneIcon, order: 0 },
  { key: "half", title: "50% of the work", icon: HourglassIcon, order: 1 },
  { key: "final", title: "Final Submission", icon: ClockIcon, order: 2 },
];

const emptyStage = () => ({
  status: "not_submitted",
  docs: [],
  feedback: "",
  rating: 0,
});

/* ---------- file helpers ---------- */
const toAbsUrl = (f) => {
  const raw = typeof f === "string" ? f : f.url || f.path || "";
  if (!raw) return "#";
  if (raw.startsWith("http")) return raw;
  // support both `/uploads/..` and `uploads/..`
  return `${API_BASE}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

const toNiceName = (f) => {
  if (typeof f === "string") {
    const parts = f.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "File");
  }
  return f.name || f.originalname || toNiceName(f.url || f.path || "File");
};

export default function MyProjectsDetails() {
  const { id } = useParams(); // assignmentId
  const [assignment, setAssignment] = useState(null);
  const [selected, setSelected] = useState({ initial: [], half: [], final: [] });
  const [activeStage, setActiveStage] = useState("initial");
  // const [showChat, setShowChat] = useState(false);

  const bubbleRef = useRef(null);
  const stageRefs = useRef({});

  const fetchAssignment = async () => {
    const { data } = await axios.get(`${API_BASE}/api/assignments/${id}`);
    const stages = { ...(data.stages || {}) };
    // ensure all 3 stages exist
    STAGES.forEach(({ key }) => {
      if (!stages?.[key]) stages[key] = emptyStage();
    });

    const proj = data.projectId || {};
    const files = Array.isArray(proj.files) ? proj.files : [];
    const normFiles = files.map((f) => ({ name: toNiceName(f), url: toAbsUrl(f) }));

    setAssignment({
      ...data,
      stages,
      projectId: { ...proj, files: normFiles },
    });

    // open last stage that has feedback, else initial
    const lastWithFeedback =
      STAGES.slice()
        .reverse()
        .find((s) => (stages[s.key]?.feedback || "").trim().length > 0)?.key || "initial";
    setActiveStage(lastWithFeedback);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchAssignment();
      } catch (e) {
        console.error(e);
        showAlert("Failed to load assignment.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const project = assignment?.projectId;
  const stages = useMemo(() => assignment?.stages ?? {}, [assignment]);

  /* ---------- submission gates ---------- */
  const canSubmit = useMemo(() => {
    if (!assignment) return { initial: false, half: false, final: false };
    const s0 = stages.initial?.status;
    const s1 = stages.half?.status;

    const topDeclined = assignment.status === "Declined";
    const requestedRevision = assignment.status === "Requested Revision";
    const terminal = Boolean(assignment.terminal); // server may set this on hard reject

    // If terminal/closed or top-level Declined, nothing can be submitted.
    if (terminal || topDeclined) return { initial: false, half: false, final: false };

    return {
      // Initial: only allow when not_submitted OR (declined but in Requested Revision window)
      initial:
        (s0 === "not_submitted" || (requestedRevision && s0 === "declined")) &&
        selected.initial.length > 0,

      // Half: requires initial reviewed/completed, then same pattern as above
      half:
        ["reviewed", "completed"].includes(s0) &&
        (stages.half?.status === "not_submitted" ||
          (requestedRevision && stages.half?.status === "declined")) &&
        selected.half.length > 0,

      // Final: requires half reviewed/completed, then same pattern
      final:
        ["reviewed", "completed"].includes(s1) &&
        (stages.final?.status === "not_submitted" ||
          (requestedRevision && stages.final?.status === "declined")) &&
        selected.final.length > 0,
    };
  }, [assignment, selected, stages]);

   const statusLabel = (st, topLevelStatus) => {
   // If the stage itself is in "declined" but the assignment is in
   // "Requested Revision", show the correct label to the freelancer.
    if (st === "declined" && topLevelStatus === "Requested Revision") {
      return "Requested Revision";
    }
    switch (st) {
       case "not_submitted":
         return "";
       case "submitted":
       case "pending":
         return "Pending";
       case "reviewed":
         return "Reviewed";
       case "declined":
         return "Declined";
       case "completed":
         return "Completed";
       default:
         return st || "";
    }
  };

  const onFileChange = (stageKey, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelected((prev) => ({ ...prev, [stageKey]: [...prev[stageKey], ...files] }));
    e.target.value = "";
  };

  const removeSelected = (stageKey, index) => {
    setSelected((prev) => ({
      ...prev,
      [stageKey]: prev[stageKey].filter((_, i) => i !== index),
    }));
  };

  const submitStage = async (stageKey) => {
    try {
      const fd = new FormData();
      (selected[stageKey] || []).forEach((f) => fd.append("docs", f));

      // 1) upload files
      await axios.post(`${API_BASE}/api/assignments/${id}/stages/${stageKey}/upload`, fd);

      // 2) submit stage for review
      await axios.put(`${API_BASE}/api/assignments/${id}/stages/${stageKey}/submit`);

      await fetchAssignment(); // refresh everything
      setSelected((prev) => ({ ...prev, [stageKey]: [] }));
      setActiveStage(stageKey);
      showAlert("Submitted. Waiting for client's review.");
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Submission failed.";
      showAlert(msg);
    }
  };

  /* ---------- feedback bubble pointer ---------- */
  useEffect(() => {
    const updatePointer = () => {
      const bubble = bubbleRef.current;
      const wrap = stageRefs.current[activeStage];
      if (!bubble || !wrap) return;
      const target = wrap.querySelector(".stage-card") || wrap;
      const tRect = target.getBoundingClientRect();
      const bRect = bubble.getBoundingClientRect();
      let y = tRect.top + tRect.height / 2 - bRect.top;
      const pad = 22;
      y = Math.max(pad, Math.min(y, bRect.height - pad));
      bubble.style.setProperty("--bubble-anchor", `${Math.round(y)}px`);
    };
    updatePointer();
    window.addEventListener("resize", updatePointer);
    window.addEventListener("scroll", updatePointer, { passive: true });
    return () => {
      window.removeEventListener("resize", updatePointer);
      window.removeEventListener("scroll", updatePointer);
    };
  }, [activeStage, assignment]);

  if (!assignment)
    return (
      <div className="project-progress-page">
        <Navbar links={NavConfig2} />
        <div className="progress-container">Loading…</div>
      </div>
    );

  const showRating =
    (stages.final?.status === "completed" || stages.final?.status === "reviewed") &&
    Number(stages.final?.rating) > 0;

  const prereqBlocked = (stageKey) => {
    if (stageKey === "initial") return false;
    if (stageKey === "half") return !["reviewed", "completed"].includes(stages.initial?.status);
    if (stageKey === "final") return !["reviewed", "completed"].includes(stages.half?.status);
    return false;
  };

  const globalClosed = Boolean(assignment.terminal);
  const topDeclined = assignment.status === "Declined";
  const requestedRevision = assignment.status === "Requested Revision";

  return (
    <div className="project-progress-page">
      <Navbar links={NavConfig2} />
      <div className="progress-container">
        <h1 className="work-title">{project?.title || project?.type || ""}</h1>

       

        {/* ===== PROJECT DETAILS ===== */}
        <div className="details">
          <div className="d-left">
            <h2>Project Details</h2>

            <h4>Project Brief:</h4>
            <p>{project?.brief || "No brief provided."}</p>

            <h4>Reward:</h4>
            <p>{project?.budget ? `BHD ${project.budget}` : "—"}</p>

            {/* Project Files under Reward */}
            <h4 style={{ marginTop: 16 }}>Project Files:</h4>
            {Array.isArray(project?.files) && project.files.length > 0 ? (
              <div className="pd-file-list" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {project.files.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    className="pd-file-pill"
                    onClick={() => window.open(f.url, "_blank")}
                    title="Download file"
                  >
                    <span className="pd-file-name">{f.name}</span>
                    <span className="pd-file-dl">
                      <FiDownload />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted">No files were attached to this project.</p>
            )}
          </div>

          <div className="d-right">
            {project?.imageUrl ? (
              <img src={project.imageUrl} alt={project.title || "Project"} />
            ) : (
              <div className="no-image">No image</div>
            )}
          </div>
        </div>

        {/* ===== SUBMISSION / TIMELINE ===== */}
        <div className="progress-grid">
          <div className="timeline-col">
            <p className="subhead">Submit your project:</p>

            {STAGES.map((stage, idx) => {
              const data = stages[stage.key] || emptyStage();
              const blockedByPrereq = prereqBlocked(stage.key);

              // Disable attaching/submitting if prereqs block, terminal/closed, or top-level Declined.
              // If stage is declined but the overall status is "Requested Revision", allow re-submit.
              const stageDeclinedBlock =
                data.status === "declined" && !requestedRevision;

              const disabled =
                blockedByPrereq || globalClosed || topDeclined || stageDeclinedBlock;

              return (
                <div
                  key={stage.key}
                  className="stage-wrap"
                  ref={(el) => (stageRefs.current[stage.key] = el)}
                >
                  <div
                    className={`rail-dot ${idx === 0 ? "first" : ""} ${
                      idx === STAGES.length - 1 ? "last" : ""
                    }`}
                  />

                  <div
                    className={`stage-card ${activeStage === stage.key ? "active" : ""}`}
                    onClick={() => setActiveStage(stage.key)}
                  >
                    <div className="stage-left">
                      <div className="stage-icon">
                        <img src={stage.icon} alt="" />
                      </div>
                      <div className="stage-text">
                        <div className="stage-title">{stage.title}</div>

                        {Array.isArray(data.docs) && data.docs.length > 0 ? (
                          <div className="file-links">
                            {data.docs.map((f, i) => (
                              <button
                                key={i}
                                type="button"
                                className="file-link"
                                onClick={() => window.open(toAbsUrl(f.url || f), "_blank")}
                              >
                                {f.name || `Submission ${i + 1}`}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="muted">You haven’t submitted any files yet.</div>
                        )}
                      </div>
                    </div>

                   <div className={`stage-status ${data.status}`}>
   {statusLabel(data.status, assignment.status)}
 </div>
                  </div>

                  <div className="uploader">
                    <div className="upload-row">
                      <label className={`upload-btn ${disabled ? "disabled" : ""}`}>
                        Attach files
                        <input
                          type="file"
                          multiple
                          disabled={disabled}
                          onChange={(e) => onFileChange(stage.key, e)}
                        />
                      </label>

                      <button
                        className="primary-submit"
                        disabled={disabled || !canSubmit[stage.key]}
                        onClick={() => submitStage(stage.key)}
                      >
                        Submit
                      </button>
                    </div>

                    {selected[stage.key]?.length > 0 && (
                      <ul className="chosen-list">
                        {selected[stage.key].map((f, i) => (
                          <li key={i}>
                            {f.name}
                            <button
                              type="button"
                              className="remove-mini"
                              onClick={() => removeSelected(stage.key, i)}
                              aria-label="Remove file"
                            >
                              <AiOutlineClose size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {blockedByPrereq && (
                      <div className="muted tiny">
                       
                      </div>
                    )}
                    {globalClosed && (
                      <div className="muted tiny">
                        This assignment is closed by the client. Uploads are disabled.
                      </div>
                    )}
                    {topDeclined && !globalClosed && (
                      <div className="muted tiny">
                        Your submission was declined by the client. Further uploads are disabled.
                      </div>
                    )}
                    {data.status === "declined" && requestedRevision && (
                      <div className="muted tiny">
                        Revisions requested. Please attach your updated files and resubmit.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {showRating && (
              <div className="rating-block">
                <span>Rating:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={n <= Number(stages.final.rating) ? "star filled" : "star"}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            {/* ChatBox (optional)
            <button className="open-chat-btn" onClick={() => setShowChat(true)}>
              <FiMessageCircle />
            </button>
            {showChat && (
              <ChatBox
                userId={freelancerId}
                otherUserId={clientId}
                role="Freelancer"
                assignmentId={assignment._id}
                closeChat={() => setShowChat(false)}
              />
            )} */}
          </div>

          <div className="feedback-col">
            <p className="subhead">Comments:</p>
            <div className="bubblee" ref={bubbleRef}>
              <div className="bubblee-body">
                {(stages?.[activeStage]?.feedback || "No comments yet.").trim()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
