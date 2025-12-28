import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig3 } from "../../Data/NavbarConfigs";

import SearchIcon from "../../Assets/search.png";


import ConfirmationModal from "../../Components/ConfirmationModal";
import "../../Style/Clients/ProjectApplications.css"; // now mirrors freelancer .ma-* look

const ProjectApplications = () => {
  const navigate = useNavigate();

  // UI state
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: [] });
  const [applications, setApplications] = useState([]);
  const [confirmData, setConfirmData] = useState(null);
  
  // Current client
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const clientId = storedUser?._id;

  // Fetch applications for this client
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!clientId) return;
        const { data } = await axios.get(
          `http://localhost:5000/api/applications/by-author/${clientId}`
        );
        setApplications(data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    fetchApplications();
  }, [clientId]);

  // Toggle checkbox
  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const list = prev[category] || [];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...prev, [category]: next };
    });
  };

  // Map status to pill class (match freelancer look)
  const pillClass = (status = "") => {
    switch (status.toLowerCase()) {
      case "assigned":
        return "Approved";
      case "cancelled":
        return "Canceled";
      default:
        return "Pending"; // Under Review or unknown
    }
  };

  // Approve / Cancel with notification
  const handleAction = async (projectId, freelancerId, action) => {
    try {
      await axios.post(
        `http://localhost:5000/api/applications/${projectId}/${action}`,
        { freelancerId, clientId }
      );

      const found = applications.find(
        (a) =>
          (a.project?.id || a.projectId?._id) === projectId &&
          (a.freelancer?.id || a.freelancerId?._id) === freelancerId
      );

      if (found?.freelancer?.email && found?.project?.title) {
        await axios.post("http://localhost:5000/api/notifications", {
          userId: freelancerId,
          userType: "freelancer",
          email: found.freelancer.email,
          type: "info",
          subject:
            action === "approve" ? "You've been assigned!" : "Application Cancelled",
          message:
            action === "approve"
              ? `You have been assigned to the project "${found.project.title}".`
              : `Your application to "${found.project.title}" has been declined.`,
        });
      }

      setApplications((prev) =>
        prev.map((a) => {
          const pid = a.project?.id || a.projectId?._id;
          const fid = a.freelancer?.id || a.freelancerId?._id;
          return pid === projectId && fid === freelancerId
            ? { ...a, status: action === "approve" ? "Assigned" : "Cancelled" }
            : a;
        })
      );
    } catch (error) {
      console.error(`Error on ${action}:`, error);
    }
  };

  // Filtered list
  const filtered = applications.filter((a) => {
    const stat = a.status || "Under Review";
    const title = (a.project?.title || "").toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase());
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(stat);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="ma-page">
      <Navbar links={NavConfig3} />

   

      <div className="ma-container">
        {/* LEFT FILTER (status) */}
        <aside className="ma-filter">
          <h1 className="ma-title">
            <span className="ma-title-accent"></span> Applications
          </h1>

          <div className="ma-filter-box">
            <h3 className="ma-filter-heading">Filter</h3>
            <p className="ma-filter-hint">Filter your applications by status.</p>

            <div className="ma-filter-group">
              <h4 className="ma-filter-label">Status</h4>
              {["Under Review", "Assigned", "Cancelled"].map((s) => (
                <label key={s} className="ma-check">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(s)}
                    onChange={() => toggleFilter("status", s)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="ma-content">
          <div className="ma-search">
            <input
              type="text"
              placeholder="Search by project title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="Search" />
          </div>

          <div className="ma-list">
                {filtered.length === 0 ? (
    <h3 className="empty-title5">No project applications yet.</h3>
  ) : (
            <AnimatePresence>
              {filtered.map((app, index) => (
                <motion.div
                  key={app._id || index}
                  className="ma-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}

                  
                >
                  
                  <img
                    className="ma-thumb"
                    src={
                      app.project?.imageUrl ||
                      app.project?.coverImage ||
                      app.project?.image ||
                      ""
                    }
                    alt={app.project?.title || "Project"}
                    loading="lazy"
                  />

                  <div className="ma-info">
                    <h4>{app.project?.title}</h4>
                    <p>
                      Freelancer:{" "}
                      <span
                        className="ma-freelancer-link"
                        onClick={() =>
                          navigate(`/freelancerprofile/${app.freelancer?.id}`)
                        }
                      >
                        {app.freelancer?.name || app.freelancerId?.fullName || "—"}
                      </span>
                    </p>
                  </div>

                  <div className="ma-actions">
                    {/* Under Review -> show buttons; else pill */}
                    {(!app.status || app.status === "Under Review") ? (
                      <>
                        <button
                          className="assign"
                          onClick={() =>
                            setConfirmData({
                              projectId: app.project?.id,
                              freelancerId: app.freelancer?.id,
                              action: "approve",
                              message:
                                "Are you sure you want to assign this freelancer?",
                            })
                          }
                        >
                          Assign
                        </button>
                        <button
                          className="cancel"
                          onClick={() =>
                            setConfirmData({
                              projectId: app.project?.id,
                              freelancerId: app.freelancer?.id,
                              action: "reject",
                              message:
                                "Are you sure you want to cancel this application?",
                            })
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button className={pillClass(app.status)}>
                        {app.status}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
  )}
          </div>
        </main>
      </div>

      {/* Confirm modal */}
      {confirmData && (
        <ConfirmationModal
          message={confirmData.message}
          onConfirm={async () => {
            await handleAction(
              confirmData.projectId,
              confirmData.freelancerId,
              confirmData.action
            );
            setConfirmData(null);
          }}
          onCancel={() => setConfirmData(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProjectApplications;
