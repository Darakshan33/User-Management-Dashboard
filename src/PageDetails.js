import { useNavigate } from "react-router-dom";
import "./PageDetails.css";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, storage } from "./firebase";
import { getAuth } from "firebase/auth";
import { ref, deleteObject } from "firebase/storage";

function PageDetails() {
  const navigate = useNavigate();
  
  // State variables for managing component data
  const [users, setUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filterBy, setFilterBy] = useState("name"); 
  const [showFilterDropdown, setShowFilterDropdown] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false); 

  // Fetch user data 
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        // Check if user is logged in
        if (!currentUser) {
          alert("User not logged in. Please login first.");
          navigate("/login");
          return;
        }

        // Check if current user is admin 
        if (currentUser.email === "ayushrvscse@gmail.com") {
          setIsAdmin(true);
        }

        const uid = currentUser.uid;

        // Get all user submissions from Firestore database
        const querySnapshot = await getDocs(collection(db, "userSubmissions"));
        const allUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter data based on user role
        const filteredUsers = allUsers.filter(
          (user) =>
            currentUser.email === "ayushrvscse@gmail.com" || user.uid === uid
        );

        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // Filter users based on search term and filter type
  useEffect(() => {
    let filtered = users;

    // Apply search filter 
    if (searchTerm) {
      filtered = users.filter((user) => {
        const term = searchTerm.toLowerCase();
        
        // Search based on selected filter type
        if (filterBy === "name") {
          return user.fullName?.toLowerCase().includes(term);
        } else if (filterBy === "email") {
          return user.email?.toLowerCase().includes(term);
        } else if (filterBy === "phone") {
          return user.phoneNumber?.toLowerCase().includes(term);
        } else {
          return true;
        }
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterBy, users]);

  // Navigation functions
  const handleBackToHome = () => {
    navigate("/homepage");
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleEdit = (userId) => {
    // EditForm page navigate with user ID
    navigate(`/Edit/${userId}`);
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete?");
    
    if (confirmed) {
      try {
        setLoading(true);
        
        // Find user data to get file URLs
        const userToDelete = users.find(user => user.id === userId);
        
        if (userToDelete) {
          // Delete files from Firebase Storage 
          if (userToDelete.profilePhotoURL) {
            try {
              const profilePicRef = ref(storage, userToDelete.profilePhotoURL);
              await deleteObject(profilePicRef);
            } catch (error) {
              console.error("Error deleting profile picture:", error);
            }
          }
          
          if (userToDelete.resumeURL) {
            try {
              const resumeRef = ref(storage, userToDelete.resumeURL);
              await deleteObject(resumeRef);
            } catch (error) {
              console.error("Error deleting resume:", error);
            }
          }
        }
        
        // Delete user document from Firestore
        await deleteDoc(doc(db, "userSubmissions", userId));
        
        // Update local state
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        alert("User deleted successfully!");
        
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="pd-dashboard-container">
      {/* Animated background elements */}
      <div className="pd-background-container">
        {[...Array(14)].map((_, i) => (
          <div key={i} className={`pd-floating-ball pd-ball-${i + 1}`}></div>
        ))}
      </div>

      <div className="pd-content-container">
        <div className="pd-card">
          {/* Page header */}
          <div className="pd-header">
            <div className="pd-title-container">
              <div className="pd-user-icon">
                <svg className="pd-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h1 className="pd-title">User Details</h1>
            </div>
          </div>

          {/* Search and filter section */}
          {isAdmin && (
            <div className="pd-search-filter-container">
              {/* Search input box */}
              <div className="pd-search-box">
                <div className="pd-search-input-container">
                  <svg className="pd-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={`Search by ${filterBy}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pd-search-input"
                  />
                  {/* Clear search button */}
                  {searchTerm && (
                    <button onClick={clearSearch} className="pd-clear-search">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter dropdown */}
              <div className="pd-filter-container">
                <button
                  className="pd-filter-button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <svg className="pd-filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                  <svg className={`pd-dropdown-arrow ${showFilterDropdown ? 'rotated' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Filter options dropdown */}
                {showFilterDropdown && (
                  <div className="pd-filter-dropdown">
                    <button
                      className={`pd-filter-option ${filterBy === 'name' ? 'active' : ''}`}
                      onClick={() => {
                        setFilterBy('name');
                        setShowFilterDropdown(false);
                      }}
                    >
                      By Name
                    </button>
                    <button
                      className={`pd-filter-option ${filterBy === 'email' ? 'active' : ''}`}
                      onClick={() => {
                        setFilterBy('email');
                        setShowFilterDropdown(false);
                      }}
                    >
                      By Email
                    </button>
                    <button
                      className={`pd-filter-option ${filterBy === 'phone' ? 'active' : ''}`}
                      onClick={() => {
                        setFilterBy('phone');
                        setShowFilterDropdown(false);
                      }}
                    >
                      By Phone
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className="pd-content-box">
            <div className="pd-corner-decoration pd-top-right"></div>
            <div className="pd-corner-decoration pd-bottom-left"></div>

            {/* Conditional rendering */}
            {loading ? (
              <p className="pd-loading">Loading...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="pd-no-data">
                {searchTerm ? `No users found matching "${searchTerm}"` : "No user data found."}
              </p>
            ) : (
              // Display user list
              <ul className="pd-user-list slide-in-left">
                {filteredUsers.map((user) => (
                  <li key={user.id} className="pd-user-item">
                    {/* Action buttons container  */}
                    <div className="pd-action-buttons">
                      <button 
                        className="pd-edit-button"
                        onClick={() => handleEdit(user.id)}
                        title="Edit User"
                      >
                        <svg className="pd-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button 
                        className="pd-delete-button"
                        onClick={() => handleDelete(user.id)}
                        title="Delete User"
                      >
                        <svg className="pd-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Profile photo */}
                    {user.profilePhotoURL && (
                      <div className="pd-image-preview">
                        <img
                          src={user.profilePhotoURL || "/placeholder.svg"}
                          alt="Profile"
                          className="pd-profile-img"
                        />
                      </div>
                    )}
                    
                    {/* User information display */}
                    <p><strong>Name:</strong> {user.fullName}</p>
                    <p><strong>Phone:</strong> {user.phoneNumber}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Date of Birth:</strong> {user.dob}</p>
                    <p><strong>Gender:</strong> {user.gender}</p>

                    {/* Resume link */}
                    {user.resumeURL && (
                      <p>
                        <strong>Resume:</strong>{" "}
                        <a
                          href={user.resumeURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pd-resume-link"
                        >
                          View Resume (PDF)
                        </a>
                      </p>
                    )}
                    <hr />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Back to home button */}
          <div className="pd-button-container">
            <button className="pd-back-button" onClick={handleBackToHome}>
              <svg className="pd-arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageDetails;