import { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Initial setup for new users (Default to patient)
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'patient',
          isVerified: false,
          createdAt: new Date().toISOString(),
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-slate-100"
      >
        <div className="text-center mb-8">
           <div className="inline-flex bg-emerald-600 p-3 rounded-2xl mb-4 shadow-inner">
             <Activity className="text-white w-8 h-8" />
           </div>
           <h1 className="text-3xl font-bold text-emerald-950">Welcome to BarangayCare</h1>
           <p className="text-slate-500 mt-2">Healthcare access for every Filipino.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-14 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Continue with Google
            </>
          )}
        </button>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <HeartPulse className="w-5 h-5 text-emerald-600 mb-2" />
             <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Patient</p>
             <p className="text-[10px] text-slate-500 leading-tight">Access consultations & medicine tracker.</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
             <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
             <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Doctor</p>
             <p className="text-[10px] text-emerald-700 leading-tight">Volunteer your expertise & save lives.</p>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 mt-8 uppercase tracking-widest font-medium">
          Secure • Encrypted • Privacy First
        </p>
      </motion.div>
    </div>
  );
}
