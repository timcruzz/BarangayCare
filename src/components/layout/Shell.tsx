import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Pill, 
  Settings, 
  LogOut, 
  Activity, 
  Menu, 
  X,
  Stethoscope,
  ChevronRight,
  Database,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { seedDemoData } from '../../services/seedService';
import { motion, AnimatePresence } from 'motion/react';

export default function Shell({ user, userData }: { user: any, userData: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Medicines', icon: <Pill size={20} />, path: '/inventory' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header Layer */}
      <header className="bg-white border-b border-slate-200 px-6 h-20 flex justify-between items-center z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/20">B</div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">BarangayCare</h1>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Rural Telehealth Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-tight">Low-Bandwidth Mode Active</span>
          </div>
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none">{user?.displayName}</p>
              <p className="text-[10px] text-slate-400 capitalize font-medium mt-1">{userData?.role}</p>
            </div>
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} 
              className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" 
              alt="Profile" 
            />
          </div>

          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-slate-600">
             {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6">
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  location.pathname === item.path 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-600 transition-all rounded-xl hover:bg-rose-50 font-semibold text-sm"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed inset-0 top-[80px] bg-white z-40 p-6 flex flex-col md:hidden"
            >
               <nav className="space-y-2 flex-1">
                 {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-xl font-bold ${
                        location.pathname === item.path ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-600'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
               </nav>
               <button
                  onClick={handleSignOut}
                  className="mt-auto flex items-center gap-3 px-4 py-4 text-rose-600 bg-rose-50 rounded-xl font-bold"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-6xl mx-auto relative min-h-full flex flex-col">
            {/* Demo Helpers */}
            <div className="flex justify-end mb-8 gap-2">
              <button 
                onClick={async () => {
                  if (isSeeding) return;
                  setIsSeeding(true);
                  const success = await seedDemoData();
                  setIsSeeding(false);
                  if (success) {
                    alert("Demo data (Doctors & Inventory) seeded successfully!");
                    window.location.reload();
                  }
                }}
                disabled={isSeeding}
                className="text-[10px] font-bold bg-white text-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSeeding ? <RefreshCw size={12} className="animate-spin" /> : <Database size={12} />}
                {isSeeding ? 'Seeding...' : 'Seed Demo Data'}
              </button>

              <button 
                onClick={async () => {
                  const docRef = doc(db, 'users', user.uid);
                  await updateDoc(docRef, { role: userData.role === 'doctor' ? 'patient' : 'doctor' });
                  window.location.reload();
                }}
                className="text-[10px] font-bold bg-white text-slate-400 px-3 py-1.5 rounded-full hover:bg-emerald-600 hover:text-white transition-all border border-slate-200 shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                Demo: Switch to {userData?.role === 'doctor' ? 'Patient' : 'Doctor'}
              </button>
            </div>
            
            <div className="flex-1">
              <Outlet />
            </div>

            {/* Content Footer */}
            <footer className="mt-12 py-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[11px] text-slate-400 font-medium">Network Latency: <span className="text-emerald-600 font-mono">142ms</span> • System Secure</p>
              <div className="flex gap-4">
                <a href="#" className="text-[11px] text-slate-400 hover:text-slate-600 underline">Privacy Policy</a>
                <a href="#" className="text-[11px] text-rose-500 font-bold uppercase tracking-wider">EMERGENCY: DIAL 911</a>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
