import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";


import Login from "./Components/Login";
import Register from "./Components/Register";
import CustomerDashboard from "./Components/CustomerDashboard";
import VendorDashboard from "./Components/VendorDashboard";
import AdminDashboard from "./Components/AdminDashboard";
import RiderDashboard from "./Components/RiderDashboard";
import Homepage from "./Components/Homepage";



function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/register" element= {<Register />} />
        <Route path="/login" element= {<Login />} />
        <Route path="/admin" element= {<AdminDashboard />} />
        <Route path="/customer" element= {<CustomerDashboard />} />
        <Route path="/vendor" element= {<VendorDashboard />} />
        <Route path="/rider" element= {<RiderDashboard />} />
        <Route path="/homepage" element={<Homepage />} />

        <Route path="/" element={<Navigate to="/homepage" />} />

      </Routes>
    </Router>
    
    
    </>
  );
}

export default App;
