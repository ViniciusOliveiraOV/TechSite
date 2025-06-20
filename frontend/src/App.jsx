import React, { useState, useEffect } from 'react';
import { fetchComplaints, postComplaint, deleteComplaint } from './api';
import ComplaintForm from './ComplaintForm';
import ComplaintList from './ComplaintList';
import Login from './Login';
import Register from './Register';
import UserManagement from './UserManagement';
import './App.css';

export default function App() {
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Fetch complaints when user logs in
  useEffect(() => {
    if (user) {
      const getComplaints = async () => {
        try {
          console.log('Fetching complaints for user:', user.username); // Debug log
          const response = await fetchComplaints();
          console.log('Complaints fetched successfully:', response.data); // Debug log
          setComplaints(response.data);
        } catch (error) {
          console.error("Error fetching complaints:", error);
          console.error("Error response:", error.response?.data);
          // If token is invalid, logout user
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token invalid, logging out user');
            handleLogout();
          }
        }
      };
      
      // Add a small delay to ensure token is properly set
      setTimeout(getComplaints, 100);
    }
  }, [user]);

  const handleLogin = (userData) => {
    console.log('Setting user state:', userData);
    setUser(userData);
    setShowRegister(false); // Hide register form after login
    // Remove the undefined setLoginView(false) line
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setComplaints([]);
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false); // Go back to login after successful registration
  };

  const handleAddComplaint = async (formData) => {
    try {
      const response = await postComplaint(formData);
      setComplaints([...complaints, response.data]);
    } catch (error) {
      console.error("Failed to post complaint:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteComplaint(id);
      setComplaints(complaints.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete complaint:", error);
      alert("Failed to delete. You may not have permission.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Show register form
  if (showRegister) {
    return (
      <Register 
        onRegisterSuccess={handleRegisterSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Show login if user is not authenticated
  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        onShowRegister={handleShowRegister}
      />
    );
  }

  // Show main app if user is authenticated
  return (
    <div className="p-4 bg-pukeYellow min-h-screen font-retro">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-cyberBlue text-4xl underline">🧰 Tech Complaint Portal</h1>
        <div className="text-right">
          <p>Welcome, <strong>{user.username}</strong> ({user.role})</p>
          <button 
            onClick={handleLogout}
            className="p-1 bg-red-600 text-white border border-black mt-1"
          >
            Logout
          </button>
        </div>
      </div>
      
      {user.role === 'admin' && <UserManagement user={user} />}
      
      <ComplaintForm onComplaintSubmit={handleAddComplaint} />
      <hr className="border-retroGray my-4" />
      <span className="text-red-600 blink">🔥 Urgent!</span>
      <h2 className="text-2xl mb-2">All Complaints</h2>
      <ComplaintList 
        complaints={complaints} 
        onDelete={handleDelete}
        userRole={user.role}
      />
      <footer className="mt-8 text-sm">© 1998 TechPortal.com</footer>
    </div>
  );
}
