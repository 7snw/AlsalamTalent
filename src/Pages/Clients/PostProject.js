// src/Pages/Clients/PostProject.js
import React, { useState } from 'react';
import '../../Style/Clients/PostProject.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';

const PostProject = () => {
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const projectData = {
      projectTitle,
      description,
      budget,
      startDate,
      endDate,
    };

    console.log('Project Posted:', projectData);
    alert('Project successfully posted!');
  };

  return (
    <div className="post-project-page">
      <Navbar links={NavConfig3} />
      <div className="post-project-container">
        <h2>Post Project</h2>
        <form className="post-project-form" onSubmit={handleSubmit}>
          <label>Project Title*</label>
          <input
            type="text"
            placeholder="Write a title..."
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
          />

          <label>About this project/Description*</label>
          <textarea
            placeholder="Write a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

          <label>Budget/Price*</label>
          <input
            type="number"
            placeholder="0 BD"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />

          <label>Timeframe/Duration*</label>
          <div className="date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <span className="to-separator">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="upload-group">
            <label>Project Files*</label>
            <label className="upload-btn">
              Attach files <span className="upload-icon">📎</span>
              <input type="file" multiple hidden />
            </label>
          </div>

          <div className="upload-group">
            <label>Contract Documents*</label>
            <label className="upload-btn">
              Attach files <span className="upload-icon">📎</span>
              <input type="file" multiple hidden />
            </label>
          </div>

          <div className="upload-group">
            <label>Project Image*</label>
            <label className="upload-btn">
              Attach files <span className="upload-icon">📎</span>
              <input type="file" accept="image/*" hidden />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">Post</button>
            <button type="button" className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProject;
