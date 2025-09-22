import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig2 } from "../../Data/NavbarConfigs";
import "../../Style/Freelancer/PaymentHistory.css";
import "../../Style/Navbar.css";
import "../../Style/PageContents.css";
import CtrlzLogo from "../../Assets/ctrlz-logo.png";

const TABS = ["All", "Pending", "Completed"];

const formatBHD = (n) =>
  Number(n || 0).toLocaleString("en-BH", { maximumFractionDigits: 0 });

const PaymentHistory = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const freelancerId = storedUser?._id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("All");
  const [summary, setSummary] = useState({
    currency: "BHD",
    totalEarnings: 0,
    transactions: [],
  });

  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:5000/api/payments/freelancer/${freelancerId}`
        );

        if (mounted) {
          const tx = data?.transactions || [];
          const computedTotal = tx.reduce((s, t) => s + Number(t.amount || 0), 0);

          setSummary({
            currency: data?.currency || "BHD",
            totalEarnings: data?.totalEarnings ?? computedTotal,
            transactions: tx,
          });
          setError("");
        }
      } catch (err) {
        setError("Failed to load payment history.");
      } finally {
        mounted && setLoading(false);
      }
    };
    if (freelancerId) fetchHistory();
    return () => { mounted = false; };
  }, [freelancerId]);

  const filtered = useMemo(() => {
    if (tab === "All") return summary.transactions;
    return summary.transactions.filter(
      (t) => (t.status || "").toLowerCase() === tab.toLowerCase()
    );
  }, [tab, summary.transactions]);

  return (
    <div className="ph-page">
      <Navbar links={NavConfig2} />

      <div className="ph-container">
        <h1 className="ph-title">Payment History</h1>

        {/* Total earnings banner */}
        <section className="ph-banner">
          <div className="ph-banner-inner">
            <p className="ph-banner-kicker">
  YOUR TOTAL EARNINGS
  <img src={CtrlzLogo} alt="ctrlZ logo" className="ph-logo" />
</p>

            <div className="ph-amount">
              {summary.currency} {formatBHD(summary.totalEarnings)}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="ph-tabs">
          <div className="ph-tabs-group">
            {TABS.map((t) => (
              <button
                key={t}
                className={`ph-tab ${t === tab ? "is-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <section className="ph-table-card">
          <div className="ph-table-head">
            <h3>Transactions:</h3>
          </div>

          {loading ? (
            <div className="ph-empty">Loading…</div>
          ) : error ? (
            <div className="ph-empty ph-error">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="ph-empty">No transactions to show.</div>
          ) : (
            <div className="ph-table-scroll">
              <table className="ph-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment ID</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t._id}>
                      <td>{t.projectTitle || "—"}</td>
                      <td>
                        {new Date(t.date).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        {summary.currency} {formatBHD(t.amount)}
                      </td>
                      <td>
                        <span
                          className={`ph-badge ${
                            t.status === "Completed"
                              ? "ph-badge--completed"
                              : t.status === "Pending"
                              ? "ph-badge--pending"
                              : ""
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td>{t.paymentId || "—"}</td>
                      <td>
                        <button className="ph-row-more" aria-label="More">
                          ⋮
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentHistory;
