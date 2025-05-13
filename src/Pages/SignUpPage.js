import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/SignUpPage.css";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

const expertiseOptions = [
  "Marketing Consultant",
  "Graphic Designer",
  "Illustrator",
  "Web Developer",
  "Content Creator",
  "UX/UI Designer",
];

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    password: "",
    major: "",
    contactNumber: "",
    expertise: [],
  });

  const [isPolyStudent, setIsPolyStudent] = useState(null);
  const [checkingId] = useState(false);
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
  const navigate = useNavigate();

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "studentId") {
      if (value === "") {
        setIsPolyStudent(null);
        return;
      }

      const year = parseInt(value.substring(0, 4), 10);
      const validFormat = /^\d{9}$/.test(value);

      if (validFormat && year >= 2008 && year <= new Date().getFullYear()) {
        setIsPolyStudent(true); //  Accept any valid-format ID from 2008 onward
      } else {
        setIsPolyStudent(false);
      }
    }
  };

  const handleExpertiseChange = (value) => {
    setFormData((prev) => {
      const isSelected = prev.expertise.includes(value);
      const updated = isSelected
        ? prev.expertise.filter((item) => item !== value)
        : [...prev.expertise, value];
      return { ...prev, expertise: updated };
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!/^\d+$/.test(formData.studentId)) {
    alert("Student ID must contain numbers only.");
    return;
  }

  const year = parseInt(formData.studentId.substring(0, 4), 10);
  if (year < 2008 || year > new Date().getFullYear()) {
    alert("Invalid Student ID");
    return;
  }

  if (!formData.fullName.trim()) {
    alert("Full Name is required.");
    return;
  }

  if (formData.password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  if (!formData.major) {
    alert("Please select your Major.");
    return;
  }

  if (!/^\d{8}$/.test(formData.contactNumber)) {
    alert("Phone number must be exactly 8 digits.");
    return;
  }

  if (formData.expertise.length === 0) {
    alert("Please select at least one area of expertise.");
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:5000/api/freelancer/student-register",
      formData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.status === 200 || response.status === 201) {
      alert("Account Created! Waiting for admin verification.");

      //  Try sending notification to admin
      try {
        await axios.post("http://localhost:5000/api/notifications/send", {
          userType: "admin",
          subject: "New Freelancer Signup",
          message: `${formData.fullName} has registered as a freelancer and is awaiting approval.`,
          type: "info",
        });
      } catch (notifyErr) {
        console.warn("⚠️ Admin notification failed:", notifyErr.message);
      }

      navigate("/signin");
    }
  } catch (error) {
    console.error("Signup failed:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Signup failed.");
  }
};

  return (
    <div className="signup-body">
      <div className="signup-container">
        <button
          className="back-btn"
          onClick={() => navigate("/studentgraduate")}
        >
          <FaArrowLeft />
        </button>

        <h2>Create your Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="left-fields">
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
                {isPolyStudent === true && (
                  <p style={{ color: "green" }}></p>
                )}
                {isPolyStudent === false && (
                  <p style={{ color: "red" }}></p>
                )}
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
              <label>Email</label>
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

          <div className="student-divider"></div>

          <div className="right-fields">
            <div>
              <label>Major</label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                required
              >
                <option value="">Select Major</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Accounting">Accounting</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div>
              <label>Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                pattern="\d{8}"
                required
              />
            </div>

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
                  <div className="expertise-dropdown-actions9">
                    <button
                      type="button"
                      onClick={() => setShowExpertiseDropdown(false)}
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, expertise: [] }))
                      }
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

        <p className="signin-link">
          I have an account?{" "}
          <span onClick={() => navigate("/signin")}>Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
