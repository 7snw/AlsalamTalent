import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../../Style/Admin/FreelancersDetails.css';
import Footer from '../../Components/Footer';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Navbar from '../../Components/Navbar';
import { showAlert } from '../../utils/toastMessages';

// Same API base pattern as the rest of your app
const RAW_API_BASE =
  (process.env.REACT_APP_API_BASE || process.env.VITE_API_BASE || 'http://localhost:5000').trim();
const API_BASE = RAW_API_BASE.replace(/\/$/, '');



// ---------- helpers ----------
const toStr = (v) => String(v ?? '').toLowerCase();
const matchesQuery = (row, q) => {
  if (!q) return true;
  const s = toStr(q);
  return (
    toStr(row.fullName).includes(s) ||
    toStr(row.studentId).includes(s) ||
    toStr(row.email).includes(s) ||
    toStr(row.major).includes(s) ||
    toStr(row.phone).includes(s) ||
    toStr(row.status).includes(s) ||
    toStr((row.expertise || []).join(' ')).includes(s)
  );
};

export default function FreelancersDetails() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  // filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');      // all | Verified | Pending | Disabled
  const [major, setMajor] = useState('all');        // 'all' or exact major
  const [skill, setSkill] = useState('all');        // 'all' or exact expertise
  const [hasCv, setHasCv] = useState('all');        // all | yes | no

  // fetch all (we facet client-side)
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${API_BASE}/api/freelancer/admin/all`, { params: { limit: 1000 } });
        if (!stop) setRows(res.data?.items || []);
      } catch (e) {
        console.error(e);
        if (!stop) {
          setError(e.response?.data?.message || 'Failed to load freelancers.');
          showAlert(e.response?.data?.message || 'Failed to load freelancers.');
        }
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => { stop = true; };
  }, []);


  
  // final filtered rows
  const filtered = useMemo(() => {
    return rows.filter(r =>
      matchesQuery(r, q) &&
      (status === 'all' || r.status === status) &&
      (major === 'all' || r.major === major) &&
      (skill === 'all' || (r.expertise || []).includes(skill)) &&
      (hasCv === 'all' || (hasCv === 'yes' ? !!r.cvUrl : !r.cvUrl))
    );
  }, [rows, q, status, major, skill, hasCv]);

  const resetFilters = () => {
    setQ(''); setStatus('all'); setMajor('all'); setSkill('all'); setHasCv('all');
  };

  const totalAll = rows.length;
  const totalShown = filtered.length;

  return (
    <div className="page-root">
      <Navbar links={NavConfig4} />

      <div className="page-header">
        <h2>Freelancers Details</h2>
        <div className="fd-actions" style={{flexWrap:'wrap', gap:12}}>
          <input
            className="fd-search"
            type="text"
            placeholder="Search by (ID, name, email, major, expertise)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
         


          <button className="fd-filter" onClick={resetFilters} title="Clear all filters">Reset</button>
        </div>
      </div>

      {/* summary */}
      <div style={{padding:'0 24px 8px', marginLeft:'107px', marginTop:'15px',  color:'#4c576d',}}>
        <strong>Showing {totalShown}</strong> of {totalAll}
        {major !== 'all' && <> • <strong>{totalShown}</strong> from <strong>{major}</strong></>}
        {skill !== 'all' && <> • Expertise: <strong>{skill}</strong></>}
        {status !== 'all' && <> • Status: <strong>{status}</strong></>}
        {hasCv !== 'all' && <> • {hasCv === 'yes' ? 'With CV' : 'No CV'}</>}
      </div>

      <div className="page-content">
        <div className="fd-card">
          {loading ? (
            <div className="fd-empty">Loading…</div>
          ) : error ? (
            <div className="fd-empty error">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="fd-empty">No freelancers match your filters.</div>
          ) : (
            <div className="fd-table-wrap">
              <table className="fd-table">
                <thead>
                  <tr>
                  
                    <th>Student&nbsp;ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Major</th>
                    <th>Phone</th>
                    <th>Expertise</th>
                    <th>CV</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={`${r.status}-${r._id}`}>
                  
                      <td className="mono">{r.studentId || '—'}</td>
                      <td>{r.fullName || '—'}</td>
                      <td className="mono">{r.email || '—'}</td>
                      <td>{r.major || '—'}</td>
                      <td className="mono">{r.phone || '—'}</td>
                      <td className="truncate" title={(r.expertise || []).join(', ')}>
                        {(r.expertise || []).join(', ') || '—'}
                      </td>
                      <td>
                        {r.cvUrl ? (
                          <a className="link" href={r.cvUrl} target="_blank" rel="noreferrer">View</a>
                        ) : '—'}
                      </td>
                      <td className="mono">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
