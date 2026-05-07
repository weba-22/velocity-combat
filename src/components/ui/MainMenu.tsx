import { useGameStore } from '../../store/useGameStore';
import { motion } from 'motion/react';
import { Play, Settings, Trophy, Globe } from 'lucide-react';

export function MainMenu() {
  const startGame = useGameStore((state) => state.startGame);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 overflow-hidden font-sans">
      {/* Background Animated Lines */}
      <div className="absolute inset-0 opacity-20">
         {Array.from({ length: 20 }).map((_, i) => (
           <motion.div
             key={i}
             className="absolute h-px bg-cyan-500"
             initial={{ width: 0, left: '-20%', top: `${i * 5}%` }}
             animate={{ width: '140%', left: '120%' }}
             transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
           />
         ))}
      </div>

      <div className="relative text-center w-full max-w-4xl px-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter text-white mb-2">
            VELOCITY<span className="text-cyan-500">PUSH</span>
          </h1>
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <p className="text-gray-400 mt-4 tracking-[1em] uppercase text-sm ml-[1em]">Racing evolved</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <MenuButton 
            icon={<Play className="fill-current" />} 
            label="Grand Prix" 
            primary 
            onClick={startGame}
          />
          <MenuButton 
            icon={<Globe />} 
            label="Online Battle" 
          />
          <MenuButton 
            icon={<Trophy />} 
            label="Leaderboards" 
          />
          <MenuButton 
            icon={<Settings />} 
            label="System Config" 
          />
        </div>

        <div className="mt-24 text-[10px] text-zinc-600 uppercase tracking-widest flex items-center justify-center gap-8">
           <span>VER 0.1.0A</span>
           <span>DECRYPTING ASSETS... OK</span>
           <span>SECURE LINK ESTABLISHED</span>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, primary, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        flex items-center gap-4 p-6 border-b-2 transition-all group relative overflow-hidden
        ${primary ? 'bg-white text-black border-cyan-500' : 'bg-zinc-900/50 text-white border-white/10 hover:bg-zinc-800'}
      `}
    >
      <div className={`${primary ? 'text-cyan-600' : 'text-zinc-500'} group-hover:text-white transition-colors`}>
        {icon}
      </div>
      <span className="text-xl font-bold uppercase italic tracking-tight">{label}</span>
      <div className={`absolute top-0 right-0 w-2 h-full ${primary ? 'bg-cyan-500' : 'bg-transparent'}`} />
    </motion.button>
  );
}
