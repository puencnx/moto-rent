import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Home() {
  const [motorcycles, setMotorcycles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "motorcycles"));
      setMotorcycles(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchData();
  }, []);

  return (
    <div className="p-4">
      {motorcycles.map(moto => (
        <div key={moto.id} className="border p-2 m-2">
          <img src={moto.imageUrl} alt={moto.name} className="w-32 h-20"/>
          <h2>{moto.name}</h2>
          <p>ราคาเช่า: {moto.pricePerDay} บาท/วัน</p>
        </div>
      ))}
    </div>
  );
}
