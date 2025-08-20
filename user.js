import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

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
      <h1 className="text-3xl font-bold mb-6">เช่ามอเตอร์ไซต์</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {motorcycles.map(moto => (
          <div key={moto.id} className="border p-4 rounded shadow">
            <img src={moto.imageUrl} alt={moto.name} className="w-full h-48 object-cover mb-2 rounded"/>
            <h2 className="text-xl font-semibold">{moto.name}</h2>
            <p className="text-gray-700">ราคาเช่า: {moto.pricePerDay} บาท/วัน</p>
            <button className="bg-blue-500 text-white p-2 rounded mt-2 w-full hover:bg-blue-600">จองเลย</button>
          </div>
        ))}
      </div>
    </div>
  );
}
