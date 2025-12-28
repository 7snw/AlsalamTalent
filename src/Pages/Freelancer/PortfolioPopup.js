// src/Pages/Freelancer/PortfolioPopup.js
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../../Style/Freelancer/PortfolioPopup.css";
import { showAlert } from "../../utils/toastMessages";
const tokenize = (raw = "") =>
  String(raw)
    .split(/[,;|\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const unique = (arr) => {
  // keep first occurrence case while deduping case-insensitively
  const lowerSeen = new Set();
  const out = [];
  for (const s of arr) {
    const l = s.toLowerCase();
    if (!lowerSeen.has(l)) {
      lowerSeen.add(l);
      out.push(s);
    }
  }
  return out;
};

const PortfolioPopup = ({ onClose, onSubmit }) => {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // NEW: skills as chips
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);

  // collaborators (kept as you had)
  const [allPeople, setAllPeople] = useState([]);
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState([]);
  const dialogRef = useRef(null);

  useEffect(() => {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.classList.add("no-scroll");
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);

    setTimeout(() => {
      dialogRef.current?.querySelector("input, textarea, select")?.focus();
    }, 0);

    (async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/freelancer/search?limit=200"
        );
        if (res.ok) setAllPeople(await res.json());
      } catch {
        /* ignore */
      }
    })();

    return () => {
      document.body.classList.remove("no-scroll");
      document.body.style.paddingRight = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files?.length) setImages((prev) => [...prev, ...Array.from(files)]);
  };
  const handleRemoveImage = (i) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  // ---- skills chip input
  const addSkill = (raw) => {
    const parts = tokenize(raw);
    if (!parts.length) return;
    setSkills((prev) => unique([...prev, ...parts]));
  };
  const removeSkill = (s) => setSkills((prev) => prev.filter((x) => x !== s));
  const onSkillKey = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      addSkill(skillInput);
      setSkillInput("");
    }
  };
  const onSkillBlur = () => {
    if (skillInput.trim()) {
      addSkill(skillInput);
      setSkillInput("");
    }
  };

  // collaborators (unchanged)
  const filtered = query
    ? allPeople.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.fullName?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
        );
      })
    : [];
  const addTag = (p) => {
    if (!p?._id) return;
    setTags((prev) => (prev.find((x) => x._id === p._id) ? prev : [...prev, p]));
    setQuery("");
  };
  const removeTag = (id) => setTags((prev) => prev.filter((p) => p._id !== id));

  const handleSubmit = () => {
    // include any uncommitted text from the input
    const finalSkills = unique([...skills, ...tokenize(skillInput)]);
    const hasAll =
      title.trim() && description.trim() && images.length > 0 && finalSkills.length > 0;

    if (!hasAll) {
      showAlert(
        "Please add a title, description, at least one image, and at least one skill/type."
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("skills", JSON.stringify(finalSkills));

    // Back-compat: current API requires `projectType` (stored as `category`)
    const primaryType = finalSkills[0] || "Other";
    formData.append("projectType", primaryType);

    formData.append(
      "collaborators",
      JSON.stringify(tags.map((t) => t._id))
    );
    images.forEach((f) => formData.append("images", f));

    onSubmit?.(formData);
    onClose?.();
  };

  return createPortal(
    <div className="popup-overlay" onClick={onClose} role="presentation">
      <div
        className="popup-container"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
      >
        <div className="popup-content">
          <h2 className="view-title">Add Project Details</h2>

          <label className="popup-label">Project Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Brand Identity Kit"
          />

          <label className="popup-label">Upload Project Images:</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
          {images.length > 0 && (
            <div className="image-list">
              <ul>
                {images.map((img, idx) => (
                  <li key={idx} className="image-item">
                    {img.name}
                    <button
                      type="button"
                      className="remove-btn2"
                      onClick={() => handleRemoveImage(idx)}
                      aria-label={`Remove ${img.name}`}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="popup-label">Add Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Skills/Types input */}
          <label className="popup-label">Skills (press Enter or comma):</label>
          <div className="tag-box">
            <div className="tag-chips">
              {skills.map((s) => (
                <span key={s} className="chip">
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    aria-label={`Remove ${s}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={onSkillKey}
              onBlur={onSkillBlur}
              placeholder="e.g., UI/UX, Illustration, Web Design"
              aria-label="Add a skill/type"
            />
          </div>

          {/* Collaborators (optional) */}
          <label className="popup-label">Tag collaborators (optional):</label>
          <div className="tag-box">
            <div className="tag-chips">
              {tags.map((t) => (
                <span key={t._id} className="chip">
                  {t.fullName || t.email}
                  <button
                    type="button"
                    onClick={() => removeTag(t._id)}
                    aria-label="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search freelancers to tag"
            />
            {!!filtered.length && (
              <ul className="tag-suggestions">
                {filtered.slice(0, 8).map((p) => (
                  <li key={p._id}>
                    <button type="button" onClick={() => addTag(p)}>
                      {p.fullName}{" "}
                      <small style={{ opacity: 0.6 }}>• {p.email}</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="popup-buttons">
            <button className="submit-btn" type="button" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PortfolioPopup;
