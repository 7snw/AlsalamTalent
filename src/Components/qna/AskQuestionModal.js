import React, { useState } from "react";
import axios from "axios";

function AskQuestionModal({ currentUser, onClose, onSubmitted }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("Platform Help");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Question title is required.");
      return;
    }

    if (!currentUser?._id) {
      setError("You need to log in before asking a question.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/qna", {
        title,
        details,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        askedBy: {
          _id: currentUser._id,
          name: currentUser.name,
          role: currentUser.role,
          avatarUrl: currentUser.avatarUrl,
        },
      });

      onSubmitted();
    } catch (err) {
      console.error(
        "AskQuestionModal error:",
        err.response?.status,
        err.response?.data || err.message
      );
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qna-modal-backdrop">
      <div className="qna-modal">
        <div className="qna-modal-header">
          <h2 className="qna-modal-title">Ask a Question</h2>
          <button className="qna-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="qna-modal-subtitle">
          Get help from the CtrlZ community of freelancers.
        </p>

        {error && <div className="qna-modal-error">{error}</div>}

        <form className="qna-modal-form" onSubmit={handleSubmit}>
          <div className="qna-form-group">
            <label className="qna-label">Question Title</label>
            <input
              type="text"
              className="qna-input"
              placeholder='E.g., Potfolio'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="qna-form-group">
            <label className="qna-label">Details</label>
            <textarea
              className="qna-textarea"
              rows={4}
              placeholder="Explain your question in detail..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="qna-form-row">
            <div className="qna-form-group half">
              <label className="qna-label">Category</label>
              <select
                className="qna-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Platform Help">Platform Help</option>
                <option value="Projects">Projects</option>
                <option value="Submissions">Submissions</option>
                <option value="Payments">Payments</option>
                <option value="Suggestions">Suggestions</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="qna-form-group half">
              <label className="qna-label">Tags</label>
              <input
                type="text"
                className="qna-input"
                placeholder="payments, profile, upload"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="qna-modal-actions">
            <button
              type="button"
              className="qna-button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="qna-button-primary"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AskQuestionModal;
