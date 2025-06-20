import { useState } from "react";
import { FaUser,FaPhone,FaBirthdayCake,FaVenusMars,FaEnvelope,FaFilePdf,FaCalendarAlt,FaImage} from "react-icons/fa";
import { db, storage } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import "./CreateForm.css";

function CreateForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    dob: "",
    gender: "",
    profilePhoto: null,
    resume: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();

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
    if (!formData.profilePhoto) newErrors.profilePhoto = "Upload a profile photo.";
    if (!formData.resume) newErrors.resume = "Upload your resume.";

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

  // Submit form
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

      // Upload files to Firebase Storage
      const profilePhotoRef = ref(storage, `profilePhotos/${formData.profilePhoto.name}`);
      await uploadBytes(profilePhotoRef, formData.profilePhoto);
      const profilePhotoURL = await getDownloadURL(profilePhotoRef);

      const resumeRef = ref(storage, `resumes/${formData.resume.name}`);
      await uploadBytes(resumeRef, formData.resume);
      const resumeURL = await getDownloadURL(resumeRef);

      // Add form data to Firestore
      await addDoc(collection(db, "userSubmissions"), {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        dob: formData.dob,
        gender: formData.gender,
        profilePhotoURL,
        resumeURL,
        uid: user.uid,
        submittedAt: new Date().toISOString(),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Message UI
  if (isSubmitted) {
    return (
      <div className="app">
        <div className="background">
          {[...Array(6)].map((_, i) => <div className={`ball ball-${i + 1}`} key={i}></div>)}
        </div>

        <div className="container">
          <div className="form-card success-card">
            <h2 className="success-title">🎉 Form Submitted Successfully!</h2>
            <p className="success-message">Thank you for your response.</p>
            <button className="submit-button" onClick={() => navigate("/homepage")}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form UI
  return (
    <div className="app">
      <div className="background">
        {[...Array(6)].map((_, i) => <div className={`ball ball-${i + 1}`} key={i}></div>)}
      </div>

      <div className="container">
        <div className="form-card">
          <div className="form-header">
            <h1 className="form-title">
              <FaUser className="label-icon1" /> User Information
            </h1>
            <p className="form-description">Please fill all required fields below</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            {/* Profile Photo */}
            <div className="form-group">
              <label className="form-label"><FaImage className="label-icon2" /> Profile Photo</label>
              <input type="file" name="profilePhoto" accept="image/*" onChange={handleInputChange} className="form-input" />
              {errors.profilePhoto && <span className="error-message">{errors.profilePhoto}</span>}
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label"><FaUser className="label-icon2" /> Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={`form-input ${errors.fullName ? "error" : ""}`} placeholder="Enter full name" />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label"><FaPhone className="label-icon2" /> Phone Number</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={`form-input ${errors.phoneNumber ? "error" : ""}`} placeholder="10-digit number" />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label"><FaEnvelope className="label-icon2" /> Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`form-input ${errors.email ? "error" : ""}`} placeholder="example@mail.com" />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Resume */}
            <div className="form-group">
              <label className="form-label"><FaFilePdf className="label-icon2" /> Upload Resume</label>
              <input type="file" name="resume" accept="application/pdf" onChange={handleInputChange} className="form-input" />
              {errors.resume && <span className="error-message">{errors.resume}</span>}
            </div>

            {/* Date of Birth and Gender (side-by-side) */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><FaCalendarAlt className="label-icon2" /> Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={`form-input ${errors.dob ? "error" : ""}`} />
                {errors.dob && <span className="error-message">{errors.dob}</span>}
              </div>

              <div className="form-group">
                <label className="form-label"><FaVenusMars className="label-icon2" /> Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className={`form-select ${errors.gender ? "error" : ""}`}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className={`submit-button ${isSubmitting ? "submitting" : ""}`}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateForm;
