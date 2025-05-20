import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../../Components/Navbar'
import { NavConfig3 } from '../../Data/NavbarConfigs'
import Footer from '../../Components/Footer'
import '../../Style/Clients/ProfileSettingsClient.css'
import { showAlert } from '../../utils/toastMessages'

const ProfileSettingsClient = () => {
  // Active tab: 'edit' or 'password'
  const [activeSection, setActiveSection] = useState('edit')

  // Client profile data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    occupation: '',
    phone: '',
    companyName: '',
    dateOfBirth: ''
  })

  // Password fields
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Get client ID from localStorage
  const user = JSON.parse(localStorage.getItem('user'))
  const clientId = user?._id

  // Fetch client profile on mount
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/client/${clientId}`)
        const data = response.data
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          occupation: data.occupation || '',
          phone: data.phone || '',
          companyName: data.companyName || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : ''
        })
      } catch (err) {
        console.error('Error fetching client profile:', err)
        showAlert('Failed to load profile.')
      }
    }

    if (clientId) fetchClient()
  }, [clientId])

  // Handle field changes for profile inputs
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Save updated profile info
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/client/${clientId}`, formData)
      showAlert('Profile updated successfully!')
    } catch (err) {
      console.error('Error updating profile:', err)
      showAlert('Failed to update profile.')
    }
  }

  // Save new password
  const handleChangePassword = async () => {
    try {
      await axios.put(`http://localhost:5000/api/client/changepassword/${clientId}`, {
        oldPassword,
        newPassword
      })
      showAlert('Password updated successfully!')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      console.error('Password update failed:', err)
      showAlert(err.response?.data?.message || 'Failed to update password.')
    }
  }

  return (
    <div className="client-settings-page">
      {/* Top navbar */}
      <Navbar links={NavConfig3} />

      <div className="client-settings-container">
        {/* Sidebar navigation */}
        <div className="client-settings-sidebar">
          <h3 className="client-settings-username">{formData.fullName || 'Client'}</h3>
          <ul className="client-settings-tabs">
            <li className={activeSection === 'edit' ? 'active' : ''} onClick={() => setActiveSection('edit')}>Edit Profile</li>
            <li className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>Password</li>
          </ul>
        </div>

        {/* Main content area */}
        <div className="client-settings-content">
          {/* Edit profile section */}
          {activeSection === 'edit' && (
            <div className="client-section">
              <h4>Name</h4>
              <input type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
              <h4>Email</h4>
              <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
              <h4>Occupation</h4>
              <input type="text" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} />
              <h4>Phone Number</h4>
              <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              <h4>Company Name</h4>
              <input type="text" value={formData.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
              <h4>Date of Birth</h4>
              <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
              <button className="client-save-btn" onClick={handleSave}>Save</button>
            </div>
          )}

          {/* Change password section */}
          {activeSection === 'password' && (
            <div className="client-section">
              <h4>Old Password</h4>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <h4>New Password</h4>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button className="client-save-btn" onClick={handleChangePassword}>Save</button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ProfileSettingsClient
