import { Link } from 'react-router-dom';
import { Twitter, Youtube, Github, Disc as Discord, Shield, Map, Newspaper } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-cyan-500 rounded-sm skew-x-[-12deg] flex items-center justify-center font-black text-black">
                VC
              </div>
              <span className="font-black italic tracking-tighter text-lg underline decoration-cyan-500 decoration-4">NEON RUSH</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Vantage Point Studios. <br />
              Pushing the boundaries of arcade combat racing since 20XX.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-zinc-600 hover:text-cyan-500 transition-colors"><Twitter size={18} /></Link>
              <Link to="/" className="text-zinc-600 hover:text-cyan-500 transition-colors"><Youtube size={18} /></Link>
              <Link to="/" className="text-zinc-600 hover:text-cyan-500 transition-colors"><Discord size={18} /></Link>
              <Link to="/" className="text-zinc-600 hover:text-cyan-500 transition-colors"><Github size={18} /></Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-zinc-400">Combat Log</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-zinc-500 text-xs uppercase font-bold hover:text-white transition-colors flex items-center gap-2"><Newspaper size={14} /> Patch Notes</Link></li>
              <li><Link to="/" className="text-zinc-500 text-xs uppercase font-bold hover:text-white transition-colors flex items-center gap-2"><Map size={14} /> Map Rotation</Link></li>
              <li><Link to="/" className="text-zinc-500 text-xs uppercase font-bold hover:text-white transition-colors flex items-center gap-2"><Shield size={14} /> Anti-Cheat</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-zinc-400">Protocol</h4>
            <ul className="space-y-4 text-xs font-mono text-zinc-500">
              <li className="hover:text-cyan-500 transition-colors cursor-pointer">PRIVACY_POLICY.MD</li>
              <li className="hover:text-cyan-500 transition-colors cursor-pointer">TERMS_OF_SERVICE.MD</li>
              <li className="hover:text-cyan-500 transition-colors cursor-pointer">EULA_AGREEMENT.MD</li>
              <li className="hover:text-cyan-500 transition-colors cursor-pointer">COOKIE_OPT_OUT</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-zinc-400">Status</h4>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Global Servers</span>
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Matchmaking</span>
                <span className="text-[10px] font-mono text-green-500 uppercase">ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-zinc-900 pt-10 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
          <p>© 2026 VANTAGE POINT STUDIOS. ALL RIGHTS RESERVED.</p>
          <p>BUILT BY NEURAL_LINK_v2.4.0</p>
        </div>
      </div>
    </footer>
  );
}
