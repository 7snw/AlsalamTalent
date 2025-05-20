import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/SignUpPage.css";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { showAlert } from '../utils/toastMessages';

// Expertise options for dropdown
const expertiseOptions = [
  "Marketing",
  "Graphic Designer",
  "Illustrator",
  "Web Developer",
  "UX/UI Designer",
  "Content Creator"
];

const SignUpPage = () => {
  // Form data state
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    password: "",
    major: "",
    phone: "",
    expertise: [],
  });

  // Validation & UI state
  const [isPolyStudent, setIsPolyStudent] = useState(null);
  const [checkingId] = useState(false); // Currently unused loading flag
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);

  const navigate = useNavigate();

  // Handle field changes
  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Student ID check logic
    if (name === "studentId") {
      if (value === "") {
        setIsPolyStudent(null);
        return;
      }

      const year = parseInt(value.substring(0, 4), 10);
      const validFormat = /^\d{9}$/.test(value);

      // Accept student IDs from 2008 onwards
      if (validFormat && year >= 2008 && year <= new Date().getFullYear()) {
        setIsPolyStudent(true);
      } else {
        setIsPolyStudent(false);
      }
    }
  };

  // Toggle expertise selection
  const handleExpertiseChange = (value) => {
    setFormData((prev) => {
      const isSelected = prev.expertise.includes(value);
      const updated = isSelected
        ? prev.expertise.filter((item) => item !== value)
        : [...prev.expertise, value];
      return { ...prev, expertise: updated };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!/^\d+$/.test(formData.studentId)) {
      showAlert("Student ID must contain numbers only.");
      return;
    }

    const year = parseInt(formData.studentId.substring(0, 4), 10);
    if (year < 2008 || year > new Date().getFullYear()) {
      showAlert("Invalid Student ID");
      return;
    }

    if (!formData.fullName.trim()) {
      showAlert("Full Name is required.");
      return;
    }

    if (formData.password.length < 8) {
      showAlert("Password must be at least 8 characters long.");
      return;
    }

    if (!formData.major) {
      showAlert("Please select your Major.");
      return;
    }

    if (!/^\d{8}$/.test(formData.phone)) {
      showAlert("Phone number must be exactly 8 digits.");
      return;
    }

    if (formData.expertise.length === 0) {
      showAlert("Please select at least one area of expertise.");
      return;
    }

    // Submit data to backend
    try {
      const response = await axios.post(
        "http://localhost:5000/api/freelancer/student-register",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        showAlert("Account Created! Waiting for admin verification.");

        // Send admin notification
        try {
          await axios.post("http://localhost:5000/api/notifications/send", {
            userType: "admin",
            subject: "New Freelancer Signup",
            message: `${formData.fullName} has registered as a freelancer and is awaiting approval.`,
            type: "info",
          });
        } catch (notifyErr) {
          console.warn("Admin notification failed:", notifyErr.message);
        }

        navigate("/signin");
      }
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      showAlert(error.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-body">
      <div className="signup-container">
        {/* Back button */}
        <button className="back-btn" onClick={() => navigate("/studentgraduate")}>
          <FaArrowLeft />
        </button>

        <h2>Create your Account</h2>

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="left-fields">
            {/* Left side inputs */}
            <div>
              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
              <div style={{ minHeight: "5px", marginTop: "0px" }}>
                {checkingId && <p style={{ color: "#888" }}>Checking ID...</p>}
                {isPolyStudent === true && <p style={{ color: "green" }}></p>}
                {isPolyStudent === false && <p style={{ color: "red" }}></p>}
              </div>
            </div>

            <div>
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Personal Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="8"
                required
              />
            </div>
          </div>

          {/* Divider */}
          <div className="student-divider"></div>

          <div className="right-fields">
            {/* Right side inputs */}
            <div className="major-field">
              <p>Major</p>
              <div className="major-display" onClick={() => setShowMajorDropdown((prev) => !prev)}>
                {formData.major || "Select Major"}
              </div>

              {showMajorDropdown && (
                <div className="major-dropdown-list">
                  {[
                    "School of ICT",
                    "School of Creative Media",
                    "School of Business",
                    "School of Logistics & Maritime Studies",
                    "School of Engineering",
                    "School of Foundation",
                  ].map((option, index) => (
                    <div
                      key={index}
                      className="major-option"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, major: option }));
                        setShowMajorDropdown(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label>Contact Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                pattern="\d{8}"
                required
              />
            </div>

            {/* Expertise multiselect */}
            <div className="expertiseer9">
              <p>Expertise</p>
              <div
                className="expertise-display9"
                onClick={() => setShowExpertiseDropdown(!showExpertiseDropdown)}
              >
                {formData.expertise?.length
                  ? formData.expertise.join(", ")
                  : "Select Expertise"}
              </div>

              {showExpertiseDropdown && (
                <div className="expertise-dropdown-list9">
                  {expertiseOptions.map((option, index) => (
                    <label key={index} className="expertise-checkbox-item9">
                      <input
                        type="checkbox"
                        checked={formData.expertise?.includes(option)}
                        onChange={() => handleExpertiseChange(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                  <div className="expertise-dropdown-actions99">
                    <button
                      className="close-expertise-dropdown99"
                      type="button"
                      onClick={() => setShowExpertiseDropdown(false)}
                    >
                      Done
                    </button>
                    <button
                      className="clear-expertise-dropdown99"
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, expertise: [] }))}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="create-btn">
              Create
            </button>
          </div>
        </form>

        {/* Sign in link */}
        <p className="signin-link">
          I have an account?{" "}
          <span onClick={() => navigate("/signin")}>Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
