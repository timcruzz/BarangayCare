import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Stethoscope, Pill, ShieldCheck, ArrowRight, Activity, Users, MapPin } from 'lucide-react';

export default function Home({ user, userData }: { user: any, userData: any }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 h-20 flex justify-between items-center z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/20">B</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">BarangayCare</h1>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Rural Telehealth Portal</p>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
          <Link to="/inventory" className="hover:text-emerald-600 transition-colors">Inventory</Link>
          <a href="#services" className="hover:text-emerald-600 transition-colors">Services</a>
          {user ? (
            <Link to="/dashboard" className="text-emerald-600">Dashboard</Link>
          ) : (
            <Link to="/login" className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition-all shadow-sm">Sign In</Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 w-fit mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Low-Bandwidth Mode Active</span>
            </div>
            <p className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-[10px] mb-4 ml-1">Bridging the Distance, Strengthening the Barangay</p>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-slate-900 mb-6 tracking-tighter">
              Healthcare for our <span className="text-emerald-600">Rural Heroes.</span>
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-lg leading-relaxed font-medium">
              We connect remote barangays with volunteer doctors and real-time medicine tracking. Professional care that works on any connection.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to={user ? "/dashboard" : "/login"} 
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/20 transition-all group"
              >
                Consult a Doctor Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/inventory" 
                className="bg-white border-2 border-slate-200 text-slate-600 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:border-emerald-600 hover:text-emerald-600 transition-all"
              >
                Stock Tracker
                <Pill className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-2xl shadow-emerald-600/20 aspect-square flex flex-col justify-between">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                 <Activity size={20} />
              </div>
              <div>
                <p className="text-xl font-bold mb-2 leading-tight tracking-tight">Text-Based Triage</p>
                <p className="text-[11px] text-emerald-100 font-medium leading-relaxed opacity-80">Optimized for 2G/EDGE. Connect in minutes.</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm aspect-square flex flex-col justify-between">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                 <Stethoscope size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 mb-2 leading-tight tracking-tight">Volunteer MDs</p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">PRC-verified specialists donating time for you.</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm aspect-square flex flex-col justify-between">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                 <Users size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 mb-2 leading-tight tracking-tight">1.2k+ Active</p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Families served across 50+ remote barangays.</p>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 aspect-square flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center mb-4">
                  <MapPin size={20} />
                </div>
                <p className="text-xl font-bold text-emerald-900 mb-2 leading-tight tracking-tight">Live Supply</p>
                <p className="text-[11px] text-emerald-700/60 font-medium leading-relaxed">Real-time inventory for local health units.</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-100 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Services Grid */}
      <section id="services" className="bg-white py-24 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Purpose-Built Infrastructure</h2>
             <p className="text-slate-500 font-medium max-w-xl mx-auto">Connecting the dots in rural healthcare logistics and professional expertise.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: <Activity className="w-5 h-5" />, 
                title: "Resilient Network", 
                desc: "Our platform uses ultra-low bandwidth synchronization, ensuring data reach even in 2G 'dead zones'." 
              },
              { 
                icon: <ShieldCheck className="w-5 h-5" />, 
                title: "PRC Verification", 
                desc: "Every volunteer doctor is verified through the Professional Regulation Commission for your safety." 
              },
              { 
                icon: <Pill className="w-5 h-5" />, 
                title: "Smart Inventory", 
                desc: "Predictive tracking helps barangay centers request supplies before they run out of essential meds." 
              }
            ].map((s, i) => (
              <div key={i} className="group">
                <div className="bg-slate-50 border border-slate-100 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  {s.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 tracking-tight">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 max-w-7xl mx-auto border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">© 2026 BarangayCare Philippines</p>
        <div className="flex gap-6">
          <a href="#" className="text-[11px] text-slate-400 font-bold hover:text-emerald-600 transition-colors uppercase tracking-widest">Contact Support</a>
          <a href="#" className="text-[11px] text-slate-400 font-bold hover:text-emerald-600 transition-colors uppercase tracking-widest">Doctor Registration</a>
        </div>
      </footer>
    </div>
  );
}
