import React from 'react'
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function RiderDashboard() {

  const navigate = useNavigate();
  const handleLogout = async () => {
      try {
        await signOut(auth);   
        navigate("/login");    
      } catch (error) {
        alert("Logout failed: " + error.message);
      }
    }
  
  return (
    <>
    <h1>Rider Dashboard</h1>
     <button onClick={handleLogout}>Logout</button>
    </>
  )
}

export default RiderDashboard