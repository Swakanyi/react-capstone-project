// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc,getDoc } from "firebase/firestore"

// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional 


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
// const firebaseConfig = {
//   apiKey: "AIzaSyDmrtFN3zx8ESWMrp7jtyFIZ9iodpeBKnk",
//   authDomain: "fresh-basket-app-a1589.firebaseapp.com",
//   projectId: "fresh-basket-app-a1589",
//   storageBucket: "fresh-basket-app-a1589.firebasestorage.app",
//   messagingSenderId: "838352118166",
//   appId: "1:838352118166:web:2de35e20a9b8176551bdb7",
//   measurementId: "G-E7BXZKJ4MW"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
 
// export const registerUser = (email, password) => createUserWithEmailAndPassword (auth, email, password);
// export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
// export const logoutUser = () => signOut(auth);


export const usersCollection = collection(db, 'users');  //all user roles
export const productsCollection = collection(db, 'products')
export const ordersCollection = collection(db, 'orders')

//users
export const setUserRole = (userId, role) => setDoc (doc(db, 'users', userId), { role },);

export const getUserRole = async (userId) => {
    try{
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? userDoc.data().role : null;
    } catch(error){
        console.error('Error getting user role:', error);
        return null;
    }
};
//products
export const addProduct = (product) => addDoc(productsCollection, product);
export const getProducts = async () =>{
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
};
export const updateProduct = (id, product) => updateDoc (doc(db, 'products', id), product);

export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));

//orders
export const addOrder = (order) => addDoc(ordersCollection, order);
export const getOrders = async () =>{
    const snapshot = await getDocs(ordersCollection);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
};
export const updateOrder = (id, order) => updateDoc (doc(db, 'orders', id), order);

export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id));