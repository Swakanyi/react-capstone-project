import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, getUserRole } from "../firebase";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try{
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      const docRef = doc (db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()){
        const role = docSnap.data().role;

        if (role === 'admin'){
          navigate('/admin');
        } if (role === 'customer'){
          navigate('/customer');
        } if (role === 'vendor'){
          navigate('/vendor');
        } if (role === 'rider'){
          navigate('/rider');
        } else{
          alert('Role not assigned. Contact admin.');
        }
      }else{
        alert('No user data found.');
      }
    }catch(error){
      alert(error.message);
    }
  };

  return (
    <>
      
        <input
          type="email"
          placeholder="Janedoe@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>

        <p>
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      
    </>
  );
}

export default Login;
