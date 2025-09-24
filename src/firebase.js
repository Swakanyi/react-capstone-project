// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc, getDoc, query, where } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional 


const firebaseConfig = {
  apiKey: "AIzaSyDmrtFN3zx8ESWMrp7jtyFIZ9iodpeBKnk",
  authDomain: "fresh-basket-app-a1589.firebaseapp.com",
  projectId: "fresh-basket-app-a1589",
  storageBucket: "fresh-basket-app-a1589.appspot.com",
  messagingSenderId: "838352118166",
  appId: "1:838352118166:web:2de35e20a9b8176551bdb7",
  measurementId: "G-E7BXZKJ4MW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app)
 
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
export const addProduct = async (product) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  try {
    return await addDoc(productsCollection, {
      ...product,
      vendorId: user.uid,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};
export const getProducts = async () =>{
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
};
//for vendor dashboard
export const getVendorProducts = async (vendorId) => {
  try {
    const q = query(productsCollection, where("vendorId", "==", vendorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return [];
  }
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

//to upload product image to FireBase
export const uploadProductImage = async (file) => {
  if (!file) return null;

  try {
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    console.log("Uploaded image URL:", url); // ✅ debug
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
