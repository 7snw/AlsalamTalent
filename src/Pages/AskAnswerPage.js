// src/Pages/AskAnswerPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig2, NavConfig3 } from "../Data/NavbarConfigs";

import SearchIcon from "../Assets/search.png";
import AskQuestionModal from "../Components/qna/AskQuestionModal";
import AnswerQuestionModal from "../Components/qna/AnswerQuestionModal";

function AskAnswerPage() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const isClient = storedUser?.role === "client";
  const isFreelancer = storedUser?.role === "freelancer";

  // choose navbar config:
  // - clients  -> NavConfig3
  // - others   -> NavConfig2 (freelancers / guests)
  const navbarLinks = isClient ? NavConfig3 : NavConfig2;

  const [questions, setQuestions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("open"); // "open" | "answered"
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [showAskModal, setShowAskModal] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const CATEGORIES = [
    "All",
    "Projects",
    "Submissions",
    "Payments",
    "Suggestions",
    "Other",
  ];

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/qna", {
        params: { status: statusFilter, category: categoryFilter, search },
      });
      setQuestions(response.data || []);
    } catch (err) {
      console.error(
        "Error loading Q&A:",
        err.response?.status,
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter]);

  const filteredBySearch = useMemo(() => {
    if (!search) return questions;
    const term = search.toLowerCase();
    return questions.filter(
      (q) =>
        q.title.toLowerCase().includes(term) ||
        (q.details || "").toLowerCase().includes(term) ||
        (q.tags || []).some((t) => t.toLowerCase().includes(term))
    );
  }, [questions, search]);

  return (
    <div className="qa-page">
      {/* use dynamic navbar config */}
      <Navbar links={navbarLinks} />

      <div className="qa-container">
        {/* LEFT SIDE – title + category filter */}
        <aside className="qa-filter">
          <h1 className="qa-title">
            <span className="qa-title-accent">Ask</span> &amp; Answer
          </h1>

          <div className="qa-filter-box">
            <h3 className="qa-filter-heading">Categories</h3>
            <p className="qa-filter-hint">
              Browse questions based on their topic or type.
            </p>

            <div className="qa-filter-group">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={
                    categoryFilter === cat
                      ? "qa-filter-chip qa-filter-chip-active"
                      : "qa-filter-chip"
                  }
                  onClick={() => setCategoryFilter(cat)}
                >
                  <span className="qa-filter-icon">
                    {cat === "All" && "❓"}
                    {cat === "Projects" && "📂"}
                    {cat === "Submissions" && "📤"}
                    {cat === "Payments" && "💳"}
                    {cat === "Suggestions" && "💡"}
                    {cat === "Other" && "⋯"}
                  </span>
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT SIDE – search + list */}
        <main className="qa-content">
          <div className="qa-top-row">
            <div className="qa-search">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={fetchQuestions}
              />
              <img src={SearchIcon} alt="Search" />
            </div>

            <div className="qa-top-actions">
              <div className="qa-status-toggle">
                <button
                  className={
                    statusFilter === "open"
                      ? "qa-status-pill qa-status-pill-active"
                      : "qa-status-pill"
                  }
                  onClick={() => setStatusFilter("open")}
                >
                  Open
                </button>
                <button
                  className={
                    statusFilter === "answered"
                      ? "qa-status-pill qa-status-pill-active"
                      : "qa-status-pill"
                  }
                  onClick={() => setStatusFilter("answered")}
                >
                  Answered
                </button>
              </div>

              {isFreelancer && (
                <button
                  className="qa-button-ask"
                  onClick={() => setShowAskModal(true)}
                >
                  Ask a Question
                </button>
              )}
            </div>
          </div>

          {/* Questions list */}
          <div className="qa-list">
            {filteredBySearch.length === 0 ? (
              <h3 className="qa-empty-title">No questions yet.</h3>
            ) : (
              filteredBySearch.map((q) => (
                <div key={q._id} className="qa-card">
                  <div className="qa-card-main">
                    <h4 className="qa-card-title">{q.title}</h4>
                    <p className="qa-card-details">
                      {q.details || "No additional details provided."}
                    </p>

                    {q.tags && q.tags.length > 0 && (
                      <div className="qa-tags">
                        {q.tags.map((tag) => (
                          <span key={tag} className="qa-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {q.status === "answered" && q.answer && (
                      <div className="qa-answer-block">
                        <br />
                        <strong>Answer:</strong>
                        <p>{q.answer}</p>
                      </div>
                    )}
                  </div>

                  <div className="qa-card-side">
                    {isClient && q.status === "open" ? (
                      <button
                        className="qa-button-answer"
                        onClick={() => setActiveQuestion(q)}
                      >
                        Answer
                      </button>
                    ) : (
                      <span
                        className={
                          q.status === "answered"
                            ? "qa-status-badge qa-status-badge-answered"
                            : "qa-status-badge qa-status-badge-open"
                        }
                      >
                        {q.status === "answered" ? "Answered" : "Open"}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* Modals */}
      {showAskModal && (
        <AskQuestionModal
          currentUser={storedUser}
          onClose={() => setShowAskModal(false)}
          onSubmitted={() => {
            setShowAskModal(false);
            fetchQuestions();
          }}
        />
      )}

      {activeQuestion && isClient && (
        <AnswerQuestionModal
          currentUser={storedUser}
          question={activeQuestion}
          onClose={() => setActiveQuestion(null)}
          onSubmitted={() => {
            setActiveQuestion(null);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}

export default AskAnswerPage;
