import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Download, User } from 'lucide-react';
import { useState } from 'react';
import { auth, signInWithGoogle } from '../../lib/firebase';
import { useGameStore } from '../../store/useGameStore';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useGameStore((state) => state.user);

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-cyan-500 rounded-sm skew-x-[-12deg] flex items-center justify-center font-black text-black group-hover:scale-110 transition-transform">
            VC
          </div>
          <span className="font-black italic tracking-tighter text-xl hidden sm:block">NEON RUSH</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          <Link to="/play" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors">Web Demo</Link>
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors">Community</Link>
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors">Patches</Link>
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors">Rankings</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 pr-4 rounded-full overflow-hidden">
               <img src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg'} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-cyan-500" />
               <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">{user.displayName?.split(' ')[0]}</span>
            </div>
          ) : (
            <button 
              onClick={() => signInWithGoogle()}
              className="text-xs font-black uppercase tracking-widest px-4 py-2 hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              <User size={14} />
              Login
            </button>
          )}
          
          <Link 
            to="/download"
            className="hidden sm:flex px-6 py-2 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-500 transition-colors items-center gap-2"
          >
            <Download size={14} />
            Download
          </Link>

          <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-zinc-950 px-6 py-10 space-y-6 overflow-hidden"
          >
            <Link to="/play" className="block text-lg font-black uppercase italic text-zinc-400" onClick={() => setIsOpen(false)}>Play Demo</Link>
            <Link to="/download" className="block text-lg font-black uppercase italic text-zinc-400" onClick={() => setIsOpen(false)}>Download PC</Link>
            <Link to="/" className="block text-lg font-black uppercase italic text-zinc-400" onClick={() => setIsOpen(false)}>Community</Link>
            <Link to="/" className="block text-lg font-black uppercase italic text-zinc-400" onClick={() => setIsOpen(false)}>Leaderboards</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
