import { motion, AnimatePresence } from 'motion/react';
import { Download, Play, Trophy, Users, Shield, Zap, Globe, MessageSquare, ChevronRight, Monitor, Cpu, HardDrive, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function LandingPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await addDoc(collection(db, 'newsletters'), {
        email,
        subscribedAt: serverTimestamp()
      });
      setSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />
      
      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-zinc-900 overflow-hidden shadow-2xl rounded-sm border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowTrailer(false)}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <X size={24} />
              </button>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                   <Play fill="black" size={32} className="ml-1" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">NEON SIGNAL DETECTED</h3>
                <p className="text-zinc-500 font-mono text-sm max-w-sm mb-8 uppercase tracking-widest">Buffer loaded. Simulation ready. High fidelity visuals detected.</p>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden max-w-md">
                   <motion.div 
                    className="h-full bg-cyan-500" 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, repeat: Infinity }}
                   />
                </div>
                <p className="mt-12 text-[10px] font-mono text-zinc-700 uppercase tracking-[0.4em]">Official Gameplay Trailer • 4K ULTRA</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=1920&h=1080"
            alt="Neon City"
            className="w-full h-full object-cover opacity-30 scale-110 animate-pulse"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              VELOCITY COMBAT<br />NEON RUSH
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
              The definitive high-speed combat racing experience. Master the streets, deploy devastating weaponry, and climb the global ranks.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link 
                to="/download"
                className="w-full md:w-auto px-8 py-4 bg-white text-black font-black uppercase flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all transform hover:scale-105"
              >
                <Download size={20} />
                Download Windows
              </Link>
              <button 
                onClick={() => setShowTrailer(true)}
                className="w-full md:w-auto px-8 py-4 border border-zinc-700 bg-zinc-900/50 backdrop-blur-md font-black uppercase flex items-center justify-center gap-2 hover:border-cyan-400 transition-all transform hover:scale-105"
              >
                <Play size={20} />
                Watch Trailer
              </button>
              <Link 
                to="/play"
                className="w-full md:w-auto px-8 py-4 border border-zinc-800 bg-zinc-900/10 backdrop-blur-md font-black uppercase flex items-center justify-center gap-2 hover:text-cyan-500 transition-all"
              >
                Web Demo
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-500"
        >
          <div className="w-1 h-6 bg-zinc-800 rounded-full overflow-hidden">
            <div className="w-full h-1/2 bg-cyan-500 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black italic mb-4">ENGINEERED FOR SUPREMACY</h2>
          <div className="h-1 w-20 bg-cyan-500 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <Zap />, title: "Combat Racing", desc: "Equip your vehicle with missiles, mines, and thermal shields. Speed isn't enough." },
            { icon: <Globe />, title: "Global Ranks", desc: "Climb the worldwide leaderboards in ranked play. Only the fastest survive." },
            { icon: <Users />, title: "Multiplayer", desc: "Battle up to 16 players in synchronous online racing modes." },
            { icon: <Shield />, title: "Customization", desc: "Deep garage system with performance tuning and aesthetic neon mods." },
            { icon: <Monitor />, title: "PC Optimized", desc: "Designed for high refresh rate monitors with low-latency feedback." },
            { icon: <Cpu />, title: "Advanced AI", desc: "Dynamic AI threats that learn from your driving style." },
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 border border-zinc-800 bg-zinc-900/30 hover:border-cyan-500/50 transition-colors group"
            >
              <div className="text-cyan-500 mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2 uppercase italic">{f.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Download Section */}
      <section className="py-32 bg-zinc-900/50 border-y border-zinc-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-black italic mb-6">READY TO DROP IN?</h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-lg">
                Download the full high-fidelity version of Neon Rush. Includes 4K textures, story mode, and offline play.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4 text-zinc-300">
                  <div className="p-2 bg-zinc-800 rounded">
                    <Monitor size={20} className="text-cyan-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase">Recommended OS</h4>
                    <p className="text-xs text-zinc-500">Windows 10 / 11 (64-bit)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-zinc-300">
                  <div className="p-2 bg-zinc-800 rounded">
                    <HardDrive size={20} className="text-cyan-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase">Disk Space</h4>
                    <p className="text-xs text-zinc-500">4.2 GB Available</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/download" className="px-10 py-5 bg-cyan-500 text-black font-black uppercase flex items-center gap-3 hover:bg-white transition-all transform hover:scale-105">
                  <Download size={24} />
                  Download Installer
                </Link>
                <button className="px-10 py-5 border border-zinc-700 font-black uppercase flex items-center gap-3 hover:bg-zinc-800 transition-all">
                  Steam Store
                </button>
              </div>
              <p className="mt-6 text-xs text-zinc-600 font-mono italic underline cursor-pointer">View full system requirements</p>
            </div>
            
            <div 
              onClick={() => setShowTrailer(true)}
              className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden group shadow-2xl cursor-pointer"
            >
              <img 
                src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800" 
                alt="Game Preview"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-all">
                  <Play fill="white" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 container mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black italic mb-4">JOIN THE GRID</h2>
          <p className="text-zinc-500 mb-8 font-medium">Subscribe for early access, development logs, and exclusive weapon skins.</p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4">
            <input 
              type="email" 
              placeholder="YOUR.EMAIL@CYBERNET.COM" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 px-6 py-4 focus:outline-none focus:border-cyan-500 font-mono text-sm uppercase tracking-widest transition-colors"
            />
            <button 
              type="submit"
              disabled={subscribed}
              className="px-10 py-4 bg-white text-black font-black uppercase hover:bg-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribed ? "LINKED" : "ENLIST"}
            </button>
          </form>
          {subscribed && <p className="mt-4 text-cyan-500 font-bold animate-pulse">Neural link established. Check your inbox.</p>}
        </div>
      </section>

      <Footer />
    </div>
  );
}
