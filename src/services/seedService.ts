import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const seedDemoData = async () => {
  try {
    // 1. Seed Volunteer Doctors
    const doctors = [
      {
        uid: "demo_doctor_1",
        displayName: "Dr. Maria Santos",
        email: "maria.santos@example.com",
        role: "doctor",
        specialization: "Pediatrics",
        photoURL: "https://images.unsplash.com/photo-1559839734-2b71f1e3c77c?auto=format&fit=crop&q=80&w=200",
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        uid: "demo_doctor_2",
        displayName: "Dr. Roberto Reyes",
        email: "roberto.reyes@example.com",
        role: "doctor",
        specialization: "Internal Medicine",
        photoURL: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        uid: "demo_doctor_3",
        displayName: "Dr. Elena Cruz",
        email: "elena.cruz@example.com",
        role: "doctor",
        specialization: "Obstetrics & Gynecology",
        photoURL: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200",
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        uid: "demo_doctor_4",
        displayName: "Dr. Juan dela Cruz",
        email: "juan.dc@example.com",
        role: "doctor",
        specialization: "Cardiology",
        photoURL: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
        isVerified: true,
        createdAt: new Date().toISOString()
      }
    ];

    console.log("Starting seed process...");
    for (const doctor of doctors) {
      console.log(`Seeding doctor: ${doctor.displayName}`);
      await setDoc(doc(db, 'users', doctor.uid), doctor);
    }

    console.log("Seeding inventory...");
    const inventory = [
      { id: "inv_1", name: "Paracetamol (500mg)", quantity: 250, unit: "Tablets", barangayId: "Brgy. San Jose" },
      { id: "inv_2", name: "Amoxicillin (250mg)", quantity: 120, unit: "Capsules", barangayId: "Brgy. San Jose" },
      { id: "inv_3", name: "Ascorbic Acid (Vit C)", quantity: 500, unit: "Tablets", barangayId: "Brgy. San Jose" },
      { id: "inv_4", name: "Salbutamol Inhaler", quantity: 15, unit: "Vials", barangayId: "Brgy. San Jose" },
      { id: "inv_5", name: "Metformin (500mg)", quantity: 300, unit: "Tablets", barangayId: "Brgy. Poblacion" },
      { id: "inv_6", name: "Losartan (50mg)", quantity: 200, unit: "Tablets", barangayId: "Brgy. Poblacion" },
      { id: "inv_7", name: "Cetirizine (10mg)", quantity: 150, unit: "Tablets", barangayId: "Brgy. Poblacion" },
      { id: "inv_8", name: "Oral Rehydration Salts", quantity: 100, unit: "Sachets", barangayId: "Brgy. Poblacion" },
      { id: "inv_9", name: "Mefenamic Acid", quantity: 18, unit: "Capsules", barangayId: "Brgy. Santo Nino" },
      { id: "inv_10", name: "Amlodipine (5mg)", quantity: 240, unit: "Tablets", barangayId: "Brgy. Santo Nino" }
    ];

    for (const item of inventory) {
      const { id, ...data } = item;
      console.log(`Seeding medicine: ${data.name}`);
      await setDoc(doc(db, 'inventory', id), {
        ...data,
        lastUpdated: serverTimestamp()
      });
    }

    console.log("Demo data seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding demo data:", error);
    return false;
  }
};
