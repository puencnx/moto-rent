import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

async function addMotorcycle(data) {
  try {
    const docRef = await addDoc(collection(db, "motorcycles"), data);
    console.log("รถถูกเพิ่ม ID:", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// เรียกใช้
addMotorcycle({
  name: "Honda Click",
  pricePerDay: 300,
  imageUrl: "https://linktoimage.com/honda.png",
});
