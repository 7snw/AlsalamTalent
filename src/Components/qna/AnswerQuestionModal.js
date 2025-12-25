import React, { useState } from "react";
import axios from "axios";

function AnswerQuestionModal({ currentUser, question, onClose, onSubmitted }) {
  const [answer, setAnswer] = useState(question.answer || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!answer.trim()) {
      setError("Please write an answer.");
      return;
    }

    if (!currentUser?._id) {
      setError("You need to log in before answering a question.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `http://localhost:5000/api/qna/${question._id}/answer`,
        {
          answer,
          answeredBy: {
            _id: currentUser._id,
            name: currentUser.name,
            role: currentUser.role,
            avatarUrl: currentUser.avatarUrl,
          },
        }
      );

      onSubmitted();
    } catch (err) {
      console.error(
        "AnswerQuestionModal error:",
        err.response?.status,
        err.response?.data || err.message
      );
      const msg =
        err.response?.data?.message ||
        "Could not submit answer. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qna-modal-backdrop">
      <div className="qna-modal">
        <div className="qna-modal-header">
          <h2 className="qna-modal-title">Answer Question</h2>
          <button className="qna-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="qna-modal-subtitle">
          Help a fellow CtrlZ member by providing a detailed answer.
        </p>

        <div className="qna-question-preview">
          <p className="qna-question-preview-title">{question.title}</p>
          <p className="qna-question-preview-text">
            {question.details || "No extra details provided."}
          </p>
        </div>

        {error && <div className="qna-modal-error">{error}</div>}

        <form className="qna-modal-form" onSubmit={handleSubmit}>
          <div className="qna-form-group">
            <label className="qna-label">Your answer</label>
            <textarea
              className="qna-textarea"
              rows={5}
              placeholder="Your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
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
              {loading ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnswerQuestionModal;
