import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import login3 from "../assets/login3.avif"
import login1 from "../assets/login.avif"
import login2 from "../assets/login2.avif"
import login4 from "../assets/login4.avif"

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  // Background images for carousel
  const images = [
    login3,
    login1,
    login2,
    login4
  ];

  // Changing background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const role = docSnap.data().role;

        if (role === "admin") navigate("/admin");
        else if (role === "customer") navigate("/customer");
        else if (role === "vendor") navigate("/vendor");
        else if (role === "rider") navigate("/rider");
        else alert("Role not assigned. Contact admin.");
      } else {
        alert("No user data found.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
     
      <div className="absolute inset-0 flex justify-center items-center">
        <img
          src={images[currentImage]}
          alt="background"
          className="w-[1000px] h-[600px] object-cover rounded-xl shadow-lg transition-opacity duration-1000 ease-in-out"
          key={currentImage}
        />
        
        
      </div>

      <div className="relative z-10 w-96 p-8 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/30">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full p-3 mb-4 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full p-3 mb-4 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="btn w-full text-lg bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg border-none"
        >
          Login
        </button>

        <p className="text-lg text-center mt-4 text-gray-200">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-green-400 font-medium hover:text-blue-500"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

