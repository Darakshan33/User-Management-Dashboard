import { useState, useEffect } from "react";
import { FaUser, FaPhone, FaVenusMars, FaEnvelope, FaFilePdf, FaCalendarAlt, FaImage, FaEdit } from "react-icons/fa";
import { db, storage } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

import "./CreateForm.css"; 

function EditForm() {
  const { userId } = useParams(); // Get user ID from URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    dob: "",
    gender: "",
    profilePhoto: null,
    resume: null,
  });

  const [currentFiles, setCurrentFiles] = useState({
    profilePhotoURL: "",
    resumeURL: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing user data 
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const userDoc = await getDoc(doc(db, "userSubmissions", userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            fullName: userData.fullName || "",
            phoneNumber: userData.phoneNumber || "",
            email: userData.email || "",
            dob: userData.dob || "",
            gender: userData.gender || "",
            profilePhoto: null, // File inputs start as null
            resume: null,
          });
          
          setCurrentFiles({
            profilePhotoURL: userData.profilePhotoURL || "",
            resumeURL: userData.resumeURL || "",
          });
        } else {
          alert("User data not found!");
          navigate("/page-details");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        alert("Error loading user data. Please try again.");
        navigate("/page-details");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId, navigate]);

  // Validate user inputs
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters.";
    }

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid 10-digit phone number.";
    }

    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.dob) newErrors.dob = "Please enter your date of birth.";
    if (!formData.gender) newErrors.gender = "Please select gender.";

    return newErrors;
  };

  // Handle input & file changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Delete old file from storage
  const deleteOldFile = async (fileURL) => {
    try {
      if (fileURL) {
        const fileRef = ref(storage, fileURL);
        await deleteObject(fileRef);
      }
    } catch (error) {
      console.error("Error deleting old file:", error);
    }
  };

  // Submit updated form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("User not logged in. Please login first.");
        setIsSubmitting(false);
        return;
      }

      let profilePhotoURL = currentFiles.profilePhotoURL;
      let resumeURL = currentFiles.resumeURL;

      // Upload new profile photo if selected
      if (formData.profilePhoto) {
        // Delete old profile photo
        await deleteOldFile(currentFiles.profilePhotoURL);
        
        // Upload new profile photo
        const profilePhotoRef = ref(storage, `profilePhotos/${Date.now()}_${formData.profilePhoto.name}`);
        await uploadBytes(profilePhotoRef, formData.profilePhoto);
        profilePhotoURL = await getDownloadURL(profilePhotoRef);
      }

      // Upload new resume if selected
      if (formData.resume) {
        // Delete old resume
        await deleteOldFile(currentFiles.resumeURL);
        
        // Upload new resume
        const resumeRef = ref(storage, `resumes/${Date.now()}_${formData.resume.name}`);
        await uploadBytes(resumeRef, formData.resume);
        resumeURL = await getDownloadURL(resumeRef);
      }

      // Update user data in Firestore
      await updateDoc(doc(db, "userSubmissions", userId), {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        dob: formData.dob,
        gender: formData.gender,
        profilePhotoURL,
        resumeURL,
        updatedAt: new Date().toISOString(),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="app">
        <div className="background">
          {[...Array(6)].map((_, i) => <div className={`ball ball-${i + 1}`} key={i}></div>)}
        </div>
        <div className="container">
          <div className="form-card">
            <div className="form-header">
              <h1 className="form-title">
                <FaEdit className="label-icon1" /> Loading User Data...
              </h1>
            </div>
            <div className="form" style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success Message UI
  if (isSubmitted) {
    return (
      <div className="app">
        <div className="background">
          {[...Array(6)].map((_, i) => <div className={`ball ball-${i + 1}`} key={i}></div>)}
        </div>

        <div className="container">
          <div className="form-card success-card">
            <h2 className="success-title">User Updated Successfully!</h2>
            <p className="success-message">Changes have been saved successfully.</p>
            <button className="submit-button" onClick={() => navigate("/page-details")}>
              Back to User Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit Form UI
  return (
    <div className="app">
      <div className="background">
        {[...Array(6)].map((_, i) => <div className={`ball ball-${i + 1}`} key={i}></div>)}
      </div>

      <div className="container">
        <div className="form-card">
          <div className="form-header">
            <h1 className="form-title">
              <FaEdit className="label-icon1" /> Edit User Information
            </h1>
            <p className="form-description">Update your details below</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            {/* Profile Photo */}
            <div className="form-group">
              <label className="form-label">
                <FaImage className="label-icon2" /> Profile Photo
              </label>
              {currentFiles.profilePhotoURL && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <small style={{ color: "#6b7280" }}>
                    Current: <a href={currentFiles.profilePhotoURL} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }}>View Current Photo</a>
                  </small>
                </div>
              )}
              <input 
                type="file" 
                name="profilePhoto" 
                accept="image/*" 
                onChange={handleInputChange} 
                className="form-input" 
              />
              <small className="form-description-text">Leave empty to keep current photo</small>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">
                <FaUser className="label-icon2" /> Full Name
              </label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleInputChange} 
                className={`form-input ${errors.fullName ? "error" : ""}`} 
                placeholder="Enter full name" 
                required
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">
                <FaPhone className="label-icon2" /> Phone Number
              </label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleInputChange} 
                className={`form-input ${errors.phoneNumber ? "error" : ""}`} 
                placeholder="10-digit number" 
                required
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                <FaEnvelope className="label-icon2" /> Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                className={`form-input ${errors.email ? "error" : ""}`} 
                placeholder="example@mail.com" 
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Resume */}
            <div className="form-group">
              <label className="form-label">
                <FaFilePdf className="label-icon2" /> Upload Resume
              </label>
              {currentFiles.resumeURL && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <small style={{ color: "#6b7280" }}>
                    Current: <a href={currentFiles.resumeURL} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }}>View Current Resume</a>
                  </small>
                </div>
              )}
              <input 
                type="file" 
                name="resume" 
                accept="application/pdf" 
                onChange={handleInputChange} 
                className="form-input" 
              />
              <small className="form-description-text">Leave empty to keep current resume</small>
            </div>

            {/* Date of Birth and Gender */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <FaCalendarAlt className="label-icon2" /> Date of Birth
                </label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  className={`form-input ${errors.dob ? "error" : ""}`} 
                  required
                />
                {errors.dob && <span className="error-message">{errors.dob}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaVenusMars className="label-icon2" /> Gender
                </label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  className={`form-select ${errors.gender ? "error" : ""}`}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={() => navigate("/page-details")}
                className="submit-button"
                style={{ 
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  flex: '1'
                }}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`submit-button ${isSubmitting ? "submitting" : ""}`}
                style={{
                  background:'linear-gradient(135deg, #3b82f6, #2563eb)',
                  flex: '2' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditForm;