import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUserRole, auth } from "../firebase";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import video1 from "../assets/landing2.mp4"

const db =getFirestore();

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("")  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      //saving to firestore
      await setDoc(doc(db, "users", res.user.uid), {
        firstName,
        lastName,
        email,
        role,
      });

      alert("Account created successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <>
      <div className="relative flex items-center justify-center min-h-screen">
        <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover opacity-90"
  >
    <source src={ video1 } type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  

      <div className="relative z-10 w-120 rounded-xl border border-white/30 bg-white/20 shadow-xl backdrop-blur-md">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center">Register</h2>

          <input
            type="text"
            placeholder="First Name"
            className="input input-bordered border-green-500 w-full mt-3 bg-white/70 text-black p-3"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Last Name"
            className="input input-bordered border-green-500 w-full mt-3 bg-white/70 text-black p-3"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="input input-bordered border-green-500 w-full mt-3 bg-white/70 text-black p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input input-bordered border-green-500 w-full mt-3 bg-white/70 text-black p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="input input-bordered border-green-500 w-full mt-3 bg-white/70 text-black p-3"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <select
            className="select select-bordered border-2 border-green-500 w-full mt-3 bg-white/70 text-black p-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="rider">Rider</option>
          </select>

          <button
            onClick={handleRegister}
            className="btn btn-success border-1 bg-green-600 hover:bg-green-700 p-2 w-full mt-4 text-xl text-white"
          >
            Register
          </button>

          <p className="text-lg text-center mt-3 text-white">
            Already have an account?{" "}
            <Link to="/login" className="text-green-500 font-semibold hover:text-blue-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default Register;
