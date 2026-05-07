import { useGameStore } from '../../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Target, Bomb } from 'lucide-react';

export function HUD() {
  const { speed, score, lap, totalLaps, powerUp, health } = useGameStore();

  return (
    <div className="fixed inset-0 pointer-events-none p-8 flex flex-col justify-between font-mono">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="bg-black/60 backdrop-blur-md border-l-4 border-cyan-500 p-4">
          <div className="text-gray-400 text-xs uppercase tracking-widest">Global Score</div>
          <div className="text-4xl text-white font-bold tabular-nums">
            {score.toString().padStart(6, '0')}
          </div>
        </div>
        
        <div className="bg-black/60 backdrop-blur-md border-r-4 border-fuchsia-500 p-4 text-right">
          <div className="text-gray-400 text-xs uppercase tracking-widest">Lap Progress</div>
          <div className="text-4xl text-white font-bold italic">
            {lap}<span className="text-xl text-gray-500"> / {totalLaps}</span>
          </div>
        </div>
      </div>

      {/* Power-up Slot */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2">
        <AnimatePresence>
          {powerUp && (
            <motion.div
              initial={{ scale: 0, x: -100, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              exit={{ scale: 0, x: -100, opacity: 0 }}
              className="bg-black/80 p-6 border-2 border-white/20 backdrop-blur-xl relative"
            >
               <div className="text-[10px] text-gray-500 uppercase mb-2">Weapon Loaded</div>
               <div className="flex items-center gap-4">
                  {powerUp === 'nitro' && <Zap className="text-yellow-400 w-12 h-12 animate-pulse" />}
                  {powerUp === 'shield' && <Shield className="text-blue-400 w-12 h-12" />}
                  {powerUp === 'missile' && <Target className="text-red-500 w-12 h-12" />}
                  {powerUp === 'mine' && <Bomb className="text-orange-500 w-12 h-12" />}
                  <span className="text-2xl text-white font-black uppercase italic tracking-tighter">
                     {powerUp}
                  </span>
               </div>
               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end gap-12">
        {/* Speedometer */}
        <div className="relative">
           <div className="text-[100px] leading-none font-black italic text-white tabular-nums tracking-tighter flex items-baseline">
              {speed}
              <span className="text-2xl text-gray-500 ml-2 not-italic font-medium">KM/H</span>
           </div>
           <div className="w-full h-2 bg-gray-900 mt-2 relative overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-cyan-500"
                animate={{ width: `${Math.min(100, (speed / 300) * 100)}%` }}
              />
           </div>
        </div>

        {/* Health */}
        <div className="w-96">
           <div className="flex justify-between mb-2">
              <span className="text-xs text-white uppercase tracking-tighter">Structural Integrity</span>
              <span className="text-xs text-white">{health}%</span>
           </div>
           <div className="h-6 bg-black/40 border border-white/10 p-1 flex gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 transition-colors duration-300 ${
                    i < (health / 5) ? 'bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-white/5'
                  }`}
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
