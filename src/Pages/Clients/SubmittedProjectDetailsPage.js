// src/Pages/Clients/SubmittedProjectDetailsPage.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import "../../Style/Clients/SubmittedProjectDetailsPage.css";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import axios from "axios";
import { FiDownload } from "react-icons/fi";
import { showAlert } from "../../utils/toastMessages";
import PaymentInfoModal from "../../Components/PaymentInfoModal";

const STAGES = [
  { key: "initial", title: "Initial Concept" },
  { key: "half",    title: "50% of the work" },
  { key: "final",   title: "Final Submission" },
];

const statusLabel = (st) => {
  switch (st) {
    case "pending":
    case "submitted": return "Pending";
    case "reviewed":  return "Reviewed";
    case "declined":  return "Declined";
    case "completed": return "Completed";
    case "not_submitted":
    default:          return "Not submitted";
  }
};

// ---- helpers
const normalizeId = (x) => (typeof x === "string" ? x : (x?._id || x?.id || ""));
const pickPaymentInfo = (obj) => {
  if (!obj || typeof obj !== "object") return null;
  const p =
    obj.paymentInfo ||
    obj.bankInfo ||
    obj.payoutInfo ||
    obj.financials ||
    obj.profilePaymentInfo ||
    obj;

  const iban =
    p?.iban || p?.IBAN || p?.accountIban || p?.accountIBAN || p?.account?.iban;

  if (!iban) return null;

  return { ...p, iban: String(iban).trim() };
};

// NEW: Safe name getter
const getFreelancerName = (f) => {
  if (!f) return "";
  if (typeof f === "string") return f;
  return (
    f.fullName ||
    [f.firstName, f.lastName].filter(Boolean).join(" ") ||
    f.name ||
    f.username ||
    ""
  );
};

const SubmittedProjectDetailsPage = () => {
  const { id } = useParams();

  const [assignment, setAssignment]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [localFb, setLocalFb]         = useState({ initial: "", half: "", final: "" });
  const [finalRating, setFinalRating] = useState(0);

  // payment modal state
  const [paymentInfo, setPaymentInfo]   = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  // logged-in user
  const whoami = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);

  // ---------- fetch assignment ----------
  const fetchAssignment = useCallback(async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/assignments/${id}`);
      setAssignment(data);

      const s = data?.stages || {};
      setLocalFb({
        initial: s?.initial?.feedback || "",
        half:    s?.half?.feedback || "",
        final:   s?.final?.feedback || "",
      });
      setFinalRating(Number(s?.final?.rating || 0));
    } catch (err) {
      console.error("Error fetching assignment:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAssignment(); }, [fetchAssignment]);

  const stages = useMemo(() => assignment?.stages || {}, [assignment]);

  // NEW: name + id + profile path
  const freelancerId = useMemo(
    () => normalizeId(assignment?.freelancerId),
    [assignment]
  );
  const freelancerName = useMemo(
    () => getFreelancerName(assignment?.freelancerId) || assignment?.freelancerName || "",
    [assignment]
  );
  const freelancerProfilePath = freelancerId
    ? `/freelancerprofile/${freelancerId}`
    : "/freelancerprofile"; // adjust if your route differs

  // ---------- load freelancer's payment info ----------
  const loadPaymentInfo = useCallback(async () => {
    const projectId    = normalizeId(assignment?.projectId);
    const fId          = normalizeId(assignment?.freelancerId);
    if (!projectId || !fId) return;

    let info = null;

    try {
      const appRes = await axios.get(
        `http://localhost:5000/api/applications/by-project-and-freelancer`,
        { params: { projectId, freelancerId: fId } }
      );
      info = pickPaymentInfo(appRes?.data);
    } catch (err) {
      if (err?.response?.status !== 404) {
        console.error('applications/by-project-and-freelancer failed:', err?.response?.data || err);
      }
    }

    if (!info) {
      try {
        const fRes = await axios.get(`http://localhost:5000/api/freelancer/profile/${fId}`);
        info = pickPaymentInfo(fRes?.data);
      } catch (err2) {
        console.error('freelancer/profile lookup failed:', err2?.response?.data || err2);
      }
    }

    if (info?.iban) {
      setPaymentInfo(info);
      setShowPayModal(true);
    } else {
      showAlert('No payment info found for this freelancer.');
    }
  }, [assignment]);

  // ---------- review actions per stage ----------
  const handleStageAction = async (stageKey, action) => {
    if (!assignment) return;

    const current = stages?.[stageKey];
    if (!current || current.status !== "pending") {
      showAlert("This stage is not pending review.");
      return;
    }

    const payload = {
      status:
        action === "approve"
          ? (stageKey === "final" ? "completed" : "reviewed")
          : "declined",
      feedback: localFb[stageKey] || "",
       // NEW: tell backend if this was a revision request or a hard reject
    decision: action === "reject" ? "reject" : (action === "revise" ? "revise" : undefined),
    };

    if (stageKey === "final" && action === "approve") {
      if (!finalRating) {
        showAlert("Please add a rating for the final submission.");
        return;
      }
      payload.rating = finalRating;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/assignments/${assignment._id}/stages/${stageKey}/review`,
        payload
      );

      showAlert("Review submitted.");

      if (stageKey === "final" && action === "approve") {
        await fetchAssignment();
        await loadPaymentInfo();
      } else {
        await fetchAssignment();
      }
    } catch (err) {
      console.error("Error submitting review:", err?.response?.data || err);
      showAlert("Something went wrong.");
    }
  };

  // record payment
  const acceptPayment = async () => {
    try {
      const clientId =
        whoami?._id || assignment?.authorId || assignment?.projectId?.authorId;

      await axios.post("http://localhost:5000/api/payments/record", {
        clientId,
        freelancerId: normalizeId(assignment?.freelancerId),
        assignmentId: assignment?._id,
        projectId: normalizeId(assignment?.projectId),

        projectTitle: assignment?.projectId?.title || "",
        freelancerName: assignment?.freelancerId?.fullName || "",

        iban: paymentInfo?.iban || "",
        amount: assignment?.projectId?.budget || 0,
        method: "Bank Transfer",
      });

      setShowPayModal(false);
      showAlert("Payment recorded.");
    } catch (e) {
      console.error("record payment error:", e?.response?.data || e);
      showAlert("Failed to record payment.");
    }
  };

  if (loading) return <p>Loading project...</p>;
  if (!assignment || !assignment.projectId) return <p>Project not found</p>;

  return (
    <div className="submitted-details-page">
      <Navbar links={NavConfig3} />
      <div className="details-container">
        <h2>{assignment.projectId?.title || "Submitted Project"}</h2>

        {/* NEW: Submitted-by with link to freelancer profile */}
        <div className="submitted-by-row">
          <span className="submitted-by-label">Submitted by: </span>
          {freelancerName ? (
            freelancerId ? (
              <Link
                to={freelancerProfilePath}
                className="submitted-by-name linkish"
                title="View freelancer profile"
              >
                {freelancerName}
              </Link>
            ) : (
              <span className="submitted-by-name">{freelancerName}</span>
            )
          ) : (
            <span className="submitted-by-name">Unknown freelancer</span>
          )}
        </div>

        <div className="client-stages">
          {STAGES.map(({ key, title }) => {
            const st = stages[key] || {};
            const files = Array.isArray(st.docs) ? st.docs : [];
            const canReview = st.status === "pending";
            const needsRating = key === "final";

            return (
              <div key={key} className="client-stage-card">
                <div className="stage-card-head">
                  <div className="stage-card-title">{title}</div>
                  <div className={`stage-card-status ${st.status || "not_submitted"}`}>
                    {statusLabel(st.status)}
                  </div>
                </div>

                {files.length > 0 ? (
                  <ul className="attached-files-list3">
                    {files.map((f, i) => (
                      <li key={i} className="attached-file-item3">
                        {f.name || `Submission ${i + 1}`}
                        <button
                          type="button"
                          className="download-file-btn90"
                          onClick={() => window.open(f.url, "_blank")}
                          title="Download"
                        >
                          <FiDownload size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="submitted-no-files">No files submitted for this stage.</p>
                )}

                {needsRating && (
                  <>
                    <h4>Rating:*</h4>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          onClick={() => canReview && setFinalRating(n)}
                          className={finalRating >= n ? "filled" : ""}
                          aria-label={`Rate ${n}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <h4>Feedback/Comments{canReview ? ":*" : ":"}</h4>
                <textarea
                  placeholder="Write your feedback..."
                  value={localFb[key]}
                  onChange={(e) =>
                    setLocalFb((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  disabled={!canReview}
                />

                <div className="actions">
                  <button
                    className="approve"
                    disabled={
                      !canReview ||
                      (needsRating && (!finalRating || !localFb[key])) ||
                      (!needsRating && !localFb[key])
                    }
                    onClick={() => handleStageAction(key, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="revise"
                    disabled={!canReview}
                    onClick={() => handleStageAction(key, "revise")}
                  >
                    Request Revision
                  </button>
                  <button
                    className="decline"
                    disabled={!canReview}
                    onClick={() => handleStageAction(key, "reject")}
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PaymentInfoModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        info={paymentInfo}
        projectTitle={assignment.projectId.title}
        amount={assignment.projectId.budget}
        onAccept={acceptPayment}
      />

      <Footer />
    </div>
  );
};

export default SubmittedProjectDetailsPage;
