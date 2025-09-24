
import { db } from "./firebase.js";
import { collection, addDoc } from "firebase/firestore";
import products from "./products.js";

async function seedProducts() {
  try {
    for (let product of products) {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date(),
      });
      console.log(`Added: ${product.name}`);
    }
    console.log("All products uploaded to Firestore!");
  } catch (error) {
    console.error("Error uploading products:", error);
  }
}

seedProducts();
