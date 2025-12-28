import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../Style/Clients/PostProject.css"; // reuse same styling
import "../../Style/PageContents.css";
import Navbar from "../../Components/Navbar";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import Footer from "../../Components/Footer";
import axios from "axios";
import { FiPaperclip } from "react-icons/fi";
import { showAlert } from "../../utils/toastMessages";

const SECTION_OPTIONS = [
  { value: "platform", label: "Platform Tutorial" },
  { value: "resources", label: "Freelancers Resources" },
  { value: "bank", label: "AlSalam Bank Guidelines" },
];

const PostResource = () => {
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("resources");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [order, setOrder] = useState(0);

  const [resourceFiles, setResourceFiles] = useState([]);
  const [resourceImage, setResourceImage] = useState(null);

  const filesInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If you want: read user to ensure role client; but request said no auth/mw
  }, []);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setResourceFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleImageChange = (e) => {
    setResourceImage((e.target.files && e.target.files[0]) || null);
    e.target.value = "";
  };

  const removeFileAt = (i) =>
    setResourceFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) return showAlert("Please add a title.");
    if (!section) return showAlert("Please choose a section.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("section", section);
    formData.append("description", description);
    formData.append("externalUrl", externalUrl);
    formData.append("order", String(order ?? 0));

    if (resourceImage) formData.append("resourceImage", resourceImage);
    resourceFiles.forEach((f) => formData.append("resourceFile", f));

    try {
      await axios.post("http://localhost:5000/api/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showAlert("Resource successfully posted!");
      navigate("/library");
    } catch (err) {
      console.error("Resource upload failed:", err?.response?.data || err);
      showAlert("Failed to post resource.");
    }
  };

  return (
    <div className="post-project-page">
      <Navbar links={NavConfig3} />
      <div className="pp-container">
        <h1 className="pp-title">
          <span className="pp-accent">Post a Resource</span>
        </h1>

        <form className="pp-form" onSubmit={handleSubmit}>
          <div className="pp-grid">
            {/* Title */}
            <div className="pp-field">
              <label>Title*</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Section */}
            <div className="pp-field">
              <label>Section*</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                required
              >
                {SECTION_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="pp-field1">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description (optional)"
              />
            </div>

            {/* External URL + Order */}
            <div className="pp-field">
              <label>External URL (optional)</label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
              />
              <br /><br />
              <label>Order (optional)</label>
              <input
                type="number"
                step={1}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>

            {/* Image + Files */}
            <div className="pp-field">
              <label>Cover/Image:</label>
              <button
                type="button"
                className="pp-attach"
                onClick={() => imageInputRef.current && imageInputRef.current.click()}
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
              {resourceImage && (
                <div className="pp-fileitem pp-imageitem">
                  <span title={resourceImage.name}>{resourceImage.name}</span>
                  <button
                    type="button"
                    className="pp-remove"
                    onClick={() => setResourceImage(null)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}
              <br /><br />

              <label>Attach Files:</label>
              <button
                type="button"
                className="pp-attach"
                onClick={() => filesInputRef.current && filesInputRef.current.click()}
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
              {resourceFiles.length > 0 && (
                <div className="pp-filelist">
                  {resourceFiles.map((f, i) => (
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

            <div className="pp-field" />
          </div>

          <div className="pp-actions">
            <button type="submit" className="pp-btn pp-primary"
>Post</button>
            <button type="button" className="pp-btn pp-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default PostResource;
