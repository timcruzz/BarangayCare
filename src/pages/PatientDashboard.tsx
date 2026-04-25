import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  MessageSquarePlus, 
  Activity, 
  Pill, 
  User, 
  Clock, 
  ArrowRight, 
  X, 
  HeartPulse,
  Search,
  Filter,
  Stethoscope,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { routeHealthQuery } from '../services/geminiService';

export default function PatientDashboard() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showSymptomsModal, setShowSymptomsModal] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'consultations'), where('patientId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConsultations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Consultations snapshot error:", error);
    });

    const invQ = query(collection(db, 'inventory'));
    const unsubscribeInv = onSnapshot(invQ, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Inventory snapshot error:", error);
    });

    // Fetch Doctors
    const docQ = query(collection(db, 'users'), where('role', '==', 'doctor'));
    const unsubscribeDocs = onSnapshot(docQ, (snapshot) => {
      setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Doctors snapshot error:", error);
    });

    return () => {
      unsubscribe();
      unsubscribeInv();
      unsubscribeDocs();
    };
  }, []);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await routeHealthQuery(symptoms, inventory);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const submitRequest = async () => {
    if (!auth.currentUser) return;
    await addDoc(collection(db, 'consultations'), {
      patientId: auth.currentUser.uid,
      patientName: auth.currentUser.displayName,
      patientPhoto: auth.currentUser.photoURL,
      status: 'pending',
      symptoms: symptoms,
      aiAnalysis: aiAnalysis?.analysis || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    setShowSymptomsModal(false);
    setSymptoms('');
    setAiAnalysis(null);
  };

  const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)))];

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = (d.displayName || '').toLowerCase().includes(doctorFilter.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || d.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Kumusta, {auth.currentUser?.displayName?.split(' ')[0]}!</h1>
           <p className="text-slate-500 text-sm font-medium">Stay updated with your barangay medical records.</p>
        </div>
        <button 
          onClick={() => setShowSymptomsModal(true)}
          className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition-all text-sm"
        >
          <MessageSquarePlus size={18} />
          Consult a Doctor
        </button>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-8 flex flex-col gap-8">
           {/* Doctor Directory Section */}
           <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                   <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Stethoscope className="text-emerald-600" size={20} />
                      Volunteer Specialists
                   </h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Found {filteredDoctors.length} verified doctors</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                   <div className="relative flex-1 sm:w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search doctor..."
                        value={doctorFilter}
                        onChange={(e) => setDoctorFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                      />
                   </div>
                   <div className="relative">
                      <select 
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 appearance-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={12} />
                   </div>
                </div>
             </div>

             <div className="grid sm:grid-cols-2 gap-4">
                {filteredDoctors.length === 0 ? (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-50 rounded-xl">
                    <User className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                    <p className="text-slate-400 text-xs font-bold">No doctors found matching your criteria.</p>
                  </div>
                ) : (
                  filteredDoctors.map(doctor => (
                    <motion.div 
                      key={doctor.id}
                      layout
                      className="group bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-4 hover:border-emerald-300 transition-all cursor-pointer"
                      onClick={() => setShowSymptomsModal(true)}
                    >
                       <img 
                         src={doctor.photoURL || `https://ui-avatars.com/api/?name=${doctor.displayName}`} 
                         alt="" 
                         className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                       />
                       <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 leading-tight mb-0.5">{doctor.displayName}</p>
                          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">{doctor.specialization || 'General Physician'}</p>
                       </div>
                       <ChevronRight className="text-slate-200 group-hover:text-emerald-600 transition-colors" size={16} />
                    </motion.div>
                  ))
                )}
             </div>
           </section>

           <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <Clock className="text-emerald-600" size={20} />
                   Recent Consultations
                </h2>
                <button className="text-xs text-emerald-600 font-bold hover:underline uppercase tracking-wider">View Full History</button>
             </div>
             
             {consultations.length === 0 ? (
                <div className="border-2 border-dashed border-slate-100 rounded-xl p-12 text-center">
                   <HeartPulse className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                   <p className="text-slate-400 text-sm font-semibold">No visits recorded yet.</p>
                </div>
             ) : (
                <div className="space-y-3">
                  {consultations.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).map((c) => (
                    <motion.div 
                      key={c.id} 
                      layout
                      className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                           c.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                           c.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                         }`}>
                           <Activity size={20} />
                         </div>
                         <div>
                            <p className="font-bold text-sm text-slate-800">{c.doctorName || 'Verification in progress...'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{new Date(c.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                           c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                           c.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                         }`}>
                           {c.status}
                         </span>
                         <ArrowRight className="text-slate-200 group-hover:text-emerald-600 transition-colors" size={16} />
                      </div>
                    </motion.div>
                  ))}
                </div>
             )}
           </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Medicine Inventory</h2>
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                  <Search size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mb-6 font-medium">Real-time availability for <span className="font-bold text-slate-600">Local Brgy. Unit</span></p>
              <div className="space-y-4 flex-1">
                {inventory.slice(0, 3).map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-slate-700">{m.name}</span>
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                         m.quantity < 20 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                       }`}>
                         {m.quantity < 20 ? 'Low Stock' : 'Good Stock'}
                       </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                       <div 
                        className={`h-full rounded-full transition-all ${m.quantity < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(100, (m.quantity / 200) * 100)}%` }}
                       />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 font-medium">Updated 15 mins ago</p>
                  </div>
                ))}
              </div>
              <Link to="/inventory" className="w-full mt-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 text-center transition-colors">
                CHECK OTHER PHARMACIES
              </Link>
           </section>

           <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white">
              <div className="flex items-center gap-2 mb-3 text-rose-400 font-bold uppercase tracking-widest text-[10px]">
                 <AlertTriangle size={14} />
                 Emergency Alert
              </div>
              <p className="text-slate-300 text-[11px] mb-4 leading-relaxed font-medium">For serious emergencies requiring immediate intervention, call provincial HQ.</p>
              <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/10">
                 <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Response Unit 24/7</p>
                 <p className="text-lg font-black tracking-tighter">0917-HELP-ME</p>
              </div>
           </div>
        </div>
      </div>

      {/* Symptoms Modal with Gemini AI Analysis */}
      <AnimatePresence>
        {showSymptomsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowSymptomsModal(false)}
               className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
               <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2 rounded-lg">
                      <Activity className="text-white w-5 h-5 shadow-lg shadow-emerald-500/20" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">Health Triage Protocol</h2>
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Powered by AI Analysis</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSymptomsModal(false)} className="text-slate-400 hover:text-rose-600 p-2 transition-colors">
                    <X size={24} />
                  </button>
               </div>

               <div className="p-8 overflow-y-auto flex-1 space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 px-1">Barangay Triage Form</label>
                    <textarea 
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g. My 3-year old daughter has a mild fever for 2 days. She has a slight cough too. No rashes."
                      className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl p-5 focus:ring-1 focus:ring-emerald-500 transition-all resize-none text-slate-800 font-medium text-sm placeholder:text-slate-300"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleAiAnalysis}
                      disabled={!symptoms || isAnalyzing}
                      className="flex-1 bg-white border border-emerald-600 text-emerald-600 h-14 rounded-xl font-bold hover:bg-emerald-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                    >
                      {isAnalyzing ? "Processing..." : "Ask AI First"}
                    </button>
                    {aiAnalysis && (
                       <button 
                        onClick={submitRequest}
                        className="flex-1 bg-emerald-600 text-white h-14 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-xs uppercase tracking-widest"
                      >
                        Transmit to Doctor
                      </button>
                    )}
                  </div>

                  {aiAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 space-y-6"
                    >
                       <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Preliminary AI Insights
                       </div>
                       <p className="text-slate-700 leading-relaxed text-sm font-medium italic">
                          "{aiAnalysis.empatheticResponse}"
                       </p>
                       <div className="grid sm:grid-cols-2 gap-4">
                          <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-sm">
                             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">Specialist Target</p>
                             <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Stethoscope size={14} className="text-emerald-500" />
                                {aiAnalysis.specialistNeeded}
                             </p>
                          </div>
                          {aiAnalysis.relevantMedicines?.length > 0 && (
                            <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-sm">
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">Stock Indicator</p>
                              <div className="flex flex-wrap gap-1.5">
                                {aiAnalysis.relevantMedicines.map((m: string) => (
                                  <span key={m} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-black uppercase tracking-tighter border border-emerald-100">{m}</span>
                                ))}
                              </div>
                            </div>
                          )}
                       </div>
                       <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                          <p className="text-[10px] text-amber-700 font-bold leading-tight">Disclaimer: This is an AI pre-triage simulation. Wait for a PRC-verified doctor's official prescription.</p>
                       </div>
                    </motion.div>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
