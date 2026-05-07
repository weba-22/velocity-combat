import { useGameStore } from '../../store/useGameStore';
import { motion } from 'motion/react';
import { Play, Settings, Trophy, Globe, LogIn, LogOut, User, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { signInWithGoogle, logout } from '../../lib/firebase';
import { Leaderboard } from './Leaderboard';
import { audioManager } from '../../lib/AudioManager';

export function MainMenu() {
  const startGame = useGameStore((state) => state.startGame);
  const user = useGameStore((state) => state.user);
  const isMuted = useGameStore((state) => state.isMuted);
  const toggleMute = useGameStore((state) => state.toggleMute);
  const { t, i18n } = useTranslation();

  const handleStart = () => {
    console.log("Start Game Clicked");
    audioManager.playSFX('click');
    startGame();
  };

  const handleToggleMute = () => {
    audioManager.playSFX('click');
    toggleMute();
  };

  const changeLanguage = (lng: string) => {
    audioManager.playSFX('click');
    i18n.changeLanguage(lng);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 overflow-hidden font-sans pointer-events-auto">
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

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-6xl px-4 z-10">
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
          >
            <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter text-white mb-2 leading-none">
              VELOCITY<span className="text-cyan-500">PUSH</span>
            </h1>
            <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-cyan-500 to-transparent" />
            <p className="text-gray-400 mt-4 tracking-[1em] uppercase text-sm">{t('game_title')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MenuButton 
              icon={<Play className="fill-current" />} 
              label={t('start_game')} 
              primary 
              onClick={handleStart}
            />
            {user ? (
               <MenuButton 
                 icon={<LogOut />} 
                 label="Sign Out" 
                 onClick={() => { audioManager.playSFX('click'); logout(); }}
               />
            ) : (
               <MenuButton 
                 icon={<LogIn />} 
                 label="Connect Google" 
                 onClick={() => { audioManager.playSFX('click'); signInWithGoogle(); }}
               />
            )}
            <MenuButton 
              icon={isMuted ? <VolumeX /> : <Volume2 />} 
              label={isMuted ? "Unmute" : "Mute"} 
              onClick={handleToggleMute}
            />
            <div className="flex gap-2">
              <MenuButton 
                 icon={<Settings />} 
                 label={t('settings')} 
                 className="flex-1"
                 onClick={() => audioManager.playSFX('click')}
              />
              <div className="flex flex-col gap-1">
                 {['en', 'rw', 'sw'].map((lng) => (
                   <button 
                     key={lng}
                     onClick={() => changeLanguage(lng)}
                     className={`px-3 py-2 text-[10px] uppercase font-bold border transition-colors ${i18n.language === lng ? 'bg-cyan-500 border-cyan-500 text-black' : 'bg-black text-white border-white/20 hover:border-white'}`}
                   >
                     {lng}
                   </button>
                 ))}
              </div>
            </div>
          </div>
          
          {user && (
            <div className="mt-8 flex items-center gap-4 p-4 bg-white/5 border-l-4 border-yellow-500">
               <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-black">
                  <User size={24} />
               </div>
               <div className="text-left">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">Pilot Authenticated</div>
                  <div className="text-white font-bold uppercase">{user.displayName}</div>
               </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-auto self-stretch flex flex-col justify-center">
            <Leaderboard />
        </div>
      </div>

      <div className="absolute bottom-8 left-8 text-[10px] text-zinc-600 uppercase tracking-widest flex items-center gap-8">
         <span>VER 0.1.0A</span>
         <span>DECRYPTING ASSETS... OK</span>
         <span>SECURE LINK ESTABLISHED</span>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, primary, onClick, className }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        flex items-center gap-4 p-6 border-b-2 transition-all group relative overflow-hidden
        ${primary ? 'bg-white text-black border-cyan-500' : 'bg-zinc-900/50 text-white border-white/10 hover:bg-zinc-800'}
        ${className || ''}
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
