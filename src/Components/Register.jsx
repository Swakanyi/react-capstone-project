import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setUserRole, auth } from '../firebase';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const handleSignUp= async () => {
        try{
            const res = await createUserWithEmailAndPassword(auth, email, password);
            setUser(res.user);
            await setUserRole(res.user.uid,role);
            navigate('/login')
        }catch(error){
            alert(error.message);
        }
    };

   return (
    <>
    
        <input type='email' placeholder='janedoe@gmail.com' value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type='password' placeholder='Password' onChange={(e) => setPassword(e.target.value)}/>

        <select value={role} onChange={(e) => setRole(e.target.value)}> 
            <option value="">Select Role</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="rider">Rider</option>
        </select>
        <button onClick={handleSignUp}>Register</button>

        <p>Already have an account? <Link to="/login">Login here</Link></p>

    
    </>
  )
}

export default Register