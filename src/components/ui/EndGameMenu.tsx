import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, Home, Bomb } from 'lucide-react';
import { saveHighScore } from '../../lib/firebase';
import { useTranslation } from 'react-i18next';

import { audioManager } from '../../lib/AudioManager';

export function EndGameMenu() {
  const score = useGameStore((state) => state.score);
  const health = useGameStore((state) => state.health);
  const resetGame = useGameStore((state) => state.resetGame);
  const startGame = useGameStore((state) => state.startGame);
  const { t } = useTranslation();

  const isVictory = health > 0;

  useEffect(() => {
    if (isVictory) saveHighScore(score);
  }, [score, isVictory]);

  const handleRetry = () => {
    audioManager.playSFX('click');
    startGame();
  };

  const handleQuit = () => {
    audioManager.playSFX('click');
    resetGame();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-[60] font-sans pointer-events-auto">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-center p-12 bg-white/5 border rounded-lg shadow-[0_0_50px_rgba(0,255,255,0.2)] ${isVictory ? 'border-cyan-500/30' : 'border-red-500/30'}`}
      >
        <motion.div
           animate={isVictory ? { rotateY: 360 } : { y: [0, -10, 0] }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="inline-block mb-6"
        >
           {isVictory ? <Trophy size={80} className="text-yellow-500" /> : <Bomb size={80} className="text-red-500" />}
        </motion.div>
        
        <h1 className={`text-6xl font-black italic uppercase tracking-tighter mb-2 ${isVictory ? 'text-white' : 'text-red-500'}`}>
           {isVictory ? t('victory') : t('game_over')}
        </h1>
        <div className={`h-1 w-full mb-8 ${isVictory ? 'bg-cyan-500' : 'bg-red-500'}`} />
        
        <div className="mb-12">
           <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">Race Points Secured</div>
           <div className="text-7xl font-bold text-white tabular-nums tracking-tighter">
              {score.toLocaleString()}
           </div>
        </div>

        <div className="flex gap-4 justify-center">
           <button 
             onClick={handleRetry}
             className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase italic tracking-tighter hover:bg-cyan-500 transition-colors"
           >
              <RotateCcw size={20} />
              {t('retry')}
           </button>
           <button 
             onClick={handleQuit}
             className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black uppercase italic tracking-tighter border border-white/10 hover:border-white transition-colors"
           >
              <Home size={20} />
              {t('quit')}
           </button>
        </div>
      </motion.div>
    </div>
  );
}
