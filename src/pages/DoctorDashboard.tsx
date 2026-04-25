import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock, ArrowRight, User, Stethoscope, ClipboardList, Send, X, ShieldCheck, Activity } from 'lucide-react';

export default function DoctorDashboard() {
  const [pendingConsultations, setPendingConsultations] = useState<any[]>([]);
  const [activeConsultations, setActiveConsultations] = useState<any[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Pending requests (not yet assigned)
    const pendingQ = query(collection(db, 'consultations'), where('status', '==', 'pending'));
    const unsubscribePending = onSnapshot(pendingQ, (snapshot) => {
      setPendingConsultations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Pending consultations error:", error);
    });

    // Active requests (assigned to this doctor)
    const activeQ = query(collection(db, 'consultations'), where('doctorId', '==', auth.currentUser.uid), where('status', '==', 'accepted'));
    const unsubscribeActive = onSnapshot(activeQ, (snapshot) => {
      setActiveConsultations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Active consultations error:", error);
    });

    return () => {
      unsubscribePending();
      unsubscribeActive();
    };
  }, []);

  const acceptRequest = async (id: string) => {
    if (!auth.currentUser) return;
    const docRef = doc(db, 'consultations', id);
    await updateDoc(docRef, {
      doctorId: auth.currentUser.uid,
      doctorName: auth.currentUser.displayName,
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
  };

  const completeConsultation = async () => {
    if (!selectedConsultation) return;
    const docRef = doc(db, 'consultations', selectedConsultation.id);
    await updateDoc(docRef, {
      status: 'completed',
      notes,
      prescription,
      updatedAt: serverTimestamp()
    });
    setSelectedConsultation(null);
    setNotes('');
    setPrescription('');
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Volunteer Panel</h1>
           <p className="text-slate-500 text-sm font-medium">Providing care to rural barangays today.</p>
        </div>
        <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl flex items-center gap-3 shadow-sm">
           <ShieldCheck className="text-emerald-600" size={20} />
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">PRC Verified</p>
              <p className="text-xs font-bold text-slate-700">Active License: 0123-456</p>
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending Requests */}
        <section>
           <h2 className="text-lg font-bold text-slate-800 pb-6 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Clock className="text-amber-500" size={18} />
               Queue: Pending Requests
             </div>
             <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{pendingConsultations.length}</span>
           </h2>
           {pendingConsultations.length === 0 ? (
             <div className="border-2 border-dashed border-slate-100 rounded-2xl p-16 text-center">
                <ClipboardList className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-sm tracking-tight">Queue is currently clear.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {pendingConsultations.map((c) => (
                 <motion.div 
                   key={c.id}
                   layout
                   className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-emerald-300 transition-all flex flex-col"
                 >
                    <div className="flex items-center justify-between mb-5">
                       <div className="flex items-center gap-3">
                          <img src={c.patientPhoto} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt="" />
                          <div>
                             <p className="font-bold text-slate-800 text-base leading-tight">{c.patientName}</p>
                             <p className="text-[10px] text-slate-400 font-medium">Received {new Date(c.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => acceptRequest(c.id)}
                         className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10"
                       >
                         Accept
                       </button>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                         <Activity size={12} className="text-emerald-500" />
                         Chief Complaint
                       </p>
                       <p className="text-slate-600 text-sm italic font-medium leading-relaxed">"{c.symptoms}"</p>
                    </div>
                 </motion.div>
               ))}
             </div>
           )}
        </section>

        {/* Active Consultations */}
        <section>
           <h2 className="text-lg font-bold text-slate-800 pb-6 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Stethoscope className="text-emerald-600" size={18} />
               Assigned Sessions
             </div>
             <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{activeConsultations.length}</span>
           </h2>
           {activeConsultations.length === 0 ? (
             <div className="bg-emerald-50/20 border border-emerald-100 border-dashed rounded-2xl p-16 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-100 mx-auto mb-4" />
                <p className="text-emerald-700/40 font-bold text-sm">No active sessions assigned.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {activeConsultations.map((c) => (
                 <motion.div 
                   key={c.id}
                   layout
                   onClick={() => setSelectedConsultation(c)}
                   className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm cursor-pointer hover:border-emerald-600 group transition-all"
                 >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={c.patientPhoto} className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-50" alt="" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                          </div>
                          <div>
                             <p className="font-bold text-lg text-slate-800 leading-none mb-1 group-hover:text-emerald-600 transition-colors">{c.patientName}</p>
                             <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Active Treatment</p>
                          </div>
                       </div>
                       <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <ArrowRight size={20} />
                       </div>
                    </div>
                 </motion.div>
               ))}
             </div>
           )}
        </section>
      </div>

      {/* Consultation Modal */}
      <AnimatePresence>
        {selectedConsultation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedConsultation(null)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
               <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <img src={selectedConsultation.patientPhoto} className="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="" />
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Patient: {selectedConsultation.patientName}</h2>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Treatment Protocol Active</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedConsultation(null)} className="text-slate-400 hover:text-rose-600 p-2 transition-colors">
                    <X size={24} />
                  </button>
               </div>

               <div className="p-8 overflow-y-auto flex-1 grid md:grid-cols-2 gap-10">
                  {/* Left: Patient Info & AI Analysis */}
                  <div className="space-y-8">
                     <section>
                        <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 block px-1">Barangay Triage Info</label>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                           <p className="text-slate-700 italic font-medium leading-relaxed">"{selectedConsultation.symptoms}"</p>
                        </div>
                     </section>

                     {selectedConsultation.aiAnalysis && (
                        <section>
                           <label className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-3 block px-1">AI Differential Analysis</label>
                           <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl leading-relaxed text-slate-700 text-sm font-medium">
                              {selectedConsultation.aiAnalysis}
                           </div>
                        </section>
                     )}
                  </div>

                  {/* Right: Treatment Plan */}
                  <div className="space-y-8">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Clinical Observations</label>
                        <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Document scientific findings and observations..."
                          className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-6 focus:ring-1 focus:ring-emerald-500 transition-all resize-none text-slate-800 font-medium text-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">E-Prescription & Dosage</label>
                        <textarea 
                          value={prescription}
                          onChange={(e) => setPrescription(e.target.value)}
                          placeholder="Meds, Generic name, Frequency..."
                          className="w-full h-32 bg-slate-50 border border-emerald-200 rounded-2xl p-6 focus:ring-1 focus:ring-emerald-500 transition-all resize-none text-emerald-900 placeholder:text-emerald-300 font-mono text-sm leading-relaxed"
                        />
                     </div>
                     <button 
                        onClick={completeConsultation}
                        className="w-full bg-emerald-600 text-white h-16 rounded-2xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs"
                     >
                        <Send size={18} />
                        Finalize & Transmit Case
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
