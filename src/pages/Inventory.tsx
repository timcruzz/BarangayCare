import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pill, 
  Search, 
  MapPin, 
  Plus, 
  Minus, 
  History, 
  Filter, 
  MoreVertical,
  Activity,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState(0);
  const [newUnit, setNewUnit] = useState('Tablets');
  const [newBarangay, setNewBarangay] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Inventory page onSnapshot error:", error);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBarangay = selectedBarangay === 'All' || item.barangayId === selectedBarangay;
    return matchesSearch && matchesBarangay;
  });

  const uniqueBarangays = ['All', ...new Set(items.map(item => item.barangayId))];

  const updateQuantity = async (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newCount = Math.max(0, item.quantity + delta);
    await updateDoc(doc(db, 'inventory', id), {
      quantity: newCount,
      lastUpdated: serverTimestamp()
    });
  };

  const addItem = async () => {
    if (!newName || !newBarangay) return;
    await addDoc(collection(db, 'inventory'), {
      name: newName,
      quantity: Number(newQuantity),
      unit: newUnit,
      barangayId: newBarangay,
      lastUpdated: serverTimestamp()
    });
    setShowAddModal(false);
    setNewName('');
    setNewQuantity(0);
    setNewBarangay('');
  };

  const seedData = async () => {
    const data = [
      { name: 'Paracetamol', quantity: 150, unit: 'Tablets', barangayId: 'Barangay San Jose' },
      { name: 'Amoxicillin', quantity: 45, unit: 'Capsules', barangayId: 'Barangay San Jose' },
      { name: 'Salbutamol', quantity: 12, unit: 'Vials', barangayId: 'Barangay San Jose' },
      { name: 'Vitamin C', quantity: 500, unit: 'Tablets', barangayId: 'Barangay Poblacion' },
      { name: 'Metformin', quantity: 120, unit: 'Tablets', barangayId: 'Barangay Poblacion' },
      { name: 'ORS (Oral Rehydration)', quantity: 80, unit: 'Packs', barangayId: 'Barangay Poblacion' },
    ];
    for (const item of data) {
      await addDoc(collection(db, 'inventory'), {
        ...item,
        lastUpdated: serverTimestamp()
      });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Medicine Inventory</h1>
           <p className="text-slate-500 text-sm font-medium">Real-time availability for regional health centers.</p>
        </div>
        <div className="flex gap-4">
          {items.length === 0 && (
            <button 
              onClick={seedData}
              className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              Seed Initial Data
            </button>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition-all text-sm shadow-sm"
          >
            <Plus size={18} />
            Register Stock
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search medicine name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-11 pr-4 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm text-sm font-medium"
            />
         </div>
         <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-11 pr-4 appearance-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm text-xs font-bold text-slate-700"
            >
              {uniqueBarangays.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
         </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-20 border-2 border-dashed border-slate-100 rounded-2xl text-center">
            <Pill className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm">No items matching your criteria.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <motion.div 
              key={item.id}
              layout
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-emerald-300 transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-emerald-600">
                  <Pill size={18} />
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    item.quantity < 20 ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {item.quantity < 20 ? 'Critical' : 'Stable'}
                  </span>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <h3 className="text-base font-bold text-slate-800 leading-tight mb-1">{item.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                   <MapPin size={12} className="text-emerald-500" />
                   {item.barangayId}
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800 tracking-tighter">{item.quantity}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.unit}</span>
                    </div>
                    <div className="flex gap-1.5">
                       <button 
                         onClick={() => updateQuantity(item.id, -1)}
                         className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all"
                       >
                         <Minus size={14} />
                       </button>
                       <button 
                         onClick={() => updateQuantity(item.id, 1)}
                         className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                       >
                         <Plus size={14} />
                       </button>
                    </div>
                 </div>
                 
                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${item.quantity < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min(100, (item.quantity / 200) * 100)}%` }}
                    />
                 </div>
                 <p className="text-[10px] text-slate-300 font-medium italic">Stock level monitored by central server</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAddModal(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-slate-200"
            >
               <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <Activity size={18} />
                  </div>
                  Register Inventory Update
               </h2>
               <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Scientific/Generic Name</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Paracetamol"
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Initial Pack Count</label>
                      <input 
                        type="number" 
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(Number(e.target.value))}
                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Dispensing Unit</label>
                      <select 
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none font-bold text-slate-700"
                      >
                        <option>Tablets</option>
                        <option>Capsules</option>
                        <option>Vials</option>
                        <option>Bottles</option>
                        <option>Packs</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Assigned Health Center</label>
                    <input 
                      type="text" 
                      value={newBarangay}
                      onChange={(e) => setNewBarangay(e.target.value)}
                      placeholder="e.g. Barangay San Jose"
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold text-slate-800"
                    />
                  </div>
                  <button 
                    onClick={addItem}
                    className="w-full h-14 bg-emerald-600 text-white rounded-xl font-bold mt-4 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs"
                  >
                    Confirm Registration
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
