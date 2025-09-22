// src/Pages/ProjectDetails.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Style/ProjectDetailsPage.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import axios from "axios";
import {
  NavConfig1,
  NavConfig2,
  NavConfig3,
  NavConfig4,
} from "../Data/NavbarConfigs";
import { FiDownload, FiLock } from "react-icons/fi";
import { showAlert } from "../utils/toastMessages";
import TermsContent from "../Components/TermsContent";

/* ---------------- Helpers ---------------- */
const splitLoose = (str) =>
  String(str)
    .split(/[,;/|]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const extractSkills = (p) => {
  if (!p) return [];
  const candidates = [
    p.skills,
    p.requiredSkills,
    p.skillTags,
    p.categories,
    p.tags,
    p.skillset,
  ].filter((v) => v != null);

  for (const c of candidates) {
    if (Array.isArray(c)) {
      const arr = c
        .map((x) =>
          typeof x === "string"
            ? x
            : (x && (x.name || x.label || x.title || x.value)) || ""
        )
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) return arr;
    }
    if (typeof c === "string") {
      const arr = splitLoose(c);
      if (arr.length) return arr;
    }
    if (typeof c === "object") {
      const nested =
        c.items || c.list || c.values || c.options || c.data || c.skills;
      if (Array.isArray(nested)) {
        const arr = nested
          .map((x) =>
            typeof x === "string"
              ? x
              : (x && (x.name || x.label || x.title || x.value)) || ""
          )
          .map((s) => s.trim())
          .filter(Boolean);
        if (arr.length) return arr;
      }
    }
  }
  return [];
};

const toAbsUrl = (f) => {
  const raw = typeof f === "string" ? f : f.url || f.path || "";
  if (!raw) return "#";
  return raw.startsWith("http")
    ? raw
    : `http://localhost:5000${raw.startsWith("/") ? raw : `/${raw}`}`;
};
const toNiceName = (f) => {
  if (typeof f === "string") {
    const parts = f.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "File");
  }
  return f.name || f.originalname || toNiceName(f.url || f.path || "File");
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");
const getDeadlines = (p) => {
  const d = p?.deadlines || {};
  const initial =
    d.initial || p?.initialDeadline || p?.duration?.from || null;
  const half = d.half || p?.halfDeadline || p?.duration?.to || null;
  const final = d.final || p?.finalDeadline || null;
  return { initial, half, final };
};

/** Normalize different id shapes to a string */
const normId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v._id || v.id || "";
};

/** Try to read the assigned freelancer id(s) from various common fields */
const getAssignedFreelancerIds = (project) => {
  if (!project) return [];
  const candidates = [
    project.assignedFreelancerId,
    project.assignedFreelancer,
    project.assignedTo,
    project.assignee,
    project.assigned,
    project.acceptedFreelancerId,
    project.hiredFreelancerId,
    project.chosenFreelancerId,
    project.selectedFreelancerId,
    project.contractorId,
    project.winner,
    project.assignedUsers,
    project.assignees,
    project.team?.members,
  ].filter(Boolean);

  const ids = new Set();
  for (const c of candidates) {
    if (Array.isArray(c)) {
      c.forEach((x) => {
        const id = normId(x);
        if (id) ids.add(id);
      });
    } else {
      const id = normId(c);
      if (id) ids.add(id);
    }
  }
  return Array.from(ids);
};

/* ------------- Terms modal (shared content) ------------- */
const PDTermsModal = ({ open, onClose, onAccept }) => {
  const bodyRef = useRef(null);
  const [atEnd, setAtEnd] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!open) {
      setAtEnd(false);
      setChecked(false);
    }
  }, [open]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    setAtEnd(nearBottom);
  };

  if (!open) return null;

  return (
    <div className="pd-tc-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="pd-tc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pd-tc-head">
          <h3>Terms &amp; Conditions</h3>
          <button className="pd-tc-x" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="pd-tc-body" onScroll={onScroll} ref={bodyRef}>
          <TermsContent hideTitle />
          <div style={{ height: 16 }} />
        </div>

        <div className={`pd-tc-consent ${atEnd ? "show" : ""}`}>
          <label className="pd-tc-check">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span>I read, I understand, and I agree to the Terms &amp; Conditions</span>
          </label>
        </div>

        <div className="pd-tc-actions">
          <button
            className="pd-tc-accept"
            disabled={!checked}
            onClick={() => {
              onAccept();
              onClose();
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= Page ================= */
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [navbarConfig, setNavbarConfig] = useState(NavConfig1);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?._id;
  const role = storedUser?.role;

  useEffect(() => {
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
  }, [role]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/projects/${id}`);
        const files = Array.isArray(data.files) ? data.files : [];
        data.files = files.map((f) => ({ name: toNiceName(f), url: toAbsUrl(f) }));
        setProject(data);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    const checkIfApplied = async () => {
      if (role === "freelancer" && userId && project?._id) {
        try {
          const res = await axios.get(`http://localhost:5000/api/applications/check`, {
            params: { freelancerId: userId, projectId: project._id },
          });
          if (res.data?.applied) setApplied(true);
        } catch (err) {
            console.error("Error checking application status:", err);
        }
      }
    };
    checkIfApplied();
  }, [role, userId, project]);

  const handleApplyClick = async () => {
    if (!userId || role !== "freelancer") {
      return showAlert("Please sign in as a freelancer to apply.");
    }
    if (applied) return;
    if (!acceptedTerms) {
      return showAlert("Please accept the Terms & Conditions first.");
    }
    try {
      await axios.post("http://localhost:5000/api/applications/create", {
        projectId: project._id,
        freelancerId: userId,
        authorId: project?.authorId?._id || project?.authorId,
      });
      showAlert("Successfully applied to this project!");
      setApplied(true);
    } catch (error) {
      const message = error.response?.data?.message || "";
      if (message.toLowerCase().includes("already")) {
        showAlert("You have already applied to this project.");
        setApplied(true);
      } else {
        showAlert(message || "An error occurred while applying.");
      }
    }
  };

  const skills = useMemo(() => extractSkills(project), [project]);
  const deadlines = useMemo(() => getDeadlines(project), [project]);

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found.</p>;

  // ---- File access rules ----
  const isFreelancerSignedIn = role === "freelancer" && !!userId;

  // Who is assigned?
  const assignedIds = getAssignedFreelancerIds(project); // array of string ids
  const isAssignedToMe =
    isFreelancerSignedIn && assignedIds.includes(userId);

  // Lock logic for freelancers:
  // - Open  -> lock for all freelancers
  // - Assigned -> unlock only for the assigned freelancer; lock for others
  const filesLockedForThisFreelancer =
    isFreelancerSignedIn &&
    ((project.status === "Open") ||
      (project.status === "Assigned" && !isAssignedToMe));

  return (
    <>
      <Navbar links={navbarConfig} />

      <div className="pd-container">
        <h1 className="pd-title">{project.title || "Project"}</h1>

        <div className="pd-grid">
          {/* LEFT */}
          <div className="pd-left">
            <div className="pd-field">
              <p className="pd-label">Posted By:</p>
              <p className="pd-text">
                {project.authorId?.fullName || project.authorName || "Unknown"}
              </p>
            </div>

            <div className="pd-field">
              <p className="pd-label">Project Brief:</p>
              <p className="pd-text">{project.brief}</p>
            </div>

            <div className="pd-field">
              <p className="pd-label">Skills:</p>
              {skills.length ? (
                <div className="pd-skill-row">
                  {skills.map((s, i) => (
                    <span className="pd-skill" key={`${s}-${i}`}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="pd-text pd-muted">No skills specified</p>
              )}
            </div>

            <div className="pd-field">
              <p className="pd-label">Your Reward:</p>
              <p className="pd-text">BHD {project.budget}</p>
            </div>

            <div className="pd-field">
              <p className="pd-label">Milestones &amp; Deadlines:</p>
              <ul className="pd-milestones">
                <li>
                  <span>Initial Concept:</span> <strong>{fmtDate(deadlines.initial)}</strong>
                </li>
                <li>
                  <span>50% of the work:</span> <strong>{fmtDate(deadlines.half)}</strong>
                </li>
                <li>
                  <span>Final Submission:</span> <strong>{fmtDate(deadlines.final)}</strong>
                </li>
              </ul>
            </div>

            <div className="pd-field">
              <p className="pd-label">Status:</p>
              <p className="pd-text">{project.status || "Open"}</p>
            </div>

            {role === "freelancer" && project.status === "Open" && (
              <>
                <p className="pd-terms-hint">
                  Please click the link to view the full Terms &amp; Conditions.
                </p>
                <label className="pd-terms-row">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <span>
                    I read, I understand, and I agree to the{" "}
                    <button
                      type="button"
                      className="pd-terms-link"
                      onClick={() => setShowTerms(true)}
                    >
                      Terms &amp; Conditions
                    </button>
                  </span>
                </label>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="pd-right">
            <p className="pd-right-title">Project Files:</p>


            {project.files && project.files.length > 0 ? (
              <div className="pd-file-list">
                {project.files.map((file, idx) => {
                  const locked = filesLockedForThisFreelancer;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`pd-file-pill${locked ? " is-locked" : ""}`}
                      onClick={!locked ? () => window.open(file.url, "_blank") : undefined}
                      title={
                        locked ? "Locked: Only the assigned freelancer can open" : "Open file"
                      }
                      disabled={locked}
                      style={
                        locked
                          ? { opacity: 0.6, cursor: "not-allowed", pointerEvents: "auto" }
                          : undefined
                      }
                    >
                      <span className="pd-file-name">{file.name}</span>
                      <span className="pd-file-dl">
                        {locked ? <FiLock /> : <FiDownload />}
                      </span>
                    </button>

                  
                  );
                })}
              </div>
            ) : (
              <div className="pd-file-list">
                <div className="pd-file-pill" style={{ opacity: 0.6, cursor: "default" }}>
                  <span className="pd-file-name">No files uploaded</span>
                  <span className="pd-file-dl">
                    <FiDownload />
                  </span>
                </div>
              </div>
            )}

            {role === "freelancer" && (
              <button
                className={`pd-apply ${
                  !acceptedTerms || applied || project.status !== "Open" ? "disabled" : ""
                }`}
                onClick={handleApplyClick}
                disabled={!acceptedTerms || applied || project.status !== "Open"}
              >
                {applied ? "Applied" : "Apply"}
              </button>
            )}

            {role === "client" && storedUser?._id === normId(project.authorId) && (
              <button
                className="pd-edit"
                onClick={() => navigate(`/edit-project/${project._id}`)}
              >
                Edit Project
              </button>
            )}
          </div>
        </div>
      </div>

      <PDTermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => setAcceptedTerms(true)}
      />

      <Footer />
    </>
  );
};

export default ProjectDetails;
