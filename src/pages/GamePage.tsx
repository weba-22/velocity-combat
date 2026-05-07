import { useEffect, useState, Component, ReactNode } from 'react';
import { Scene } from '../components/game/Scene';
import { HUD } from '../components/ui/HUD';
import { MainMenu } from '../components/ui/MainMenu';
import { EndGameMenu } from '../components/ui/EndGameMenu';
import { useGameStore } from '../store/useGameStore';
import { AnimatePresence, motion } from 'motion/react';
import { audioManager } from '../lib/AudioManager';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Game Crash Detected:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-8">
          <h1 className="text-4xl font-black italic text-red-500 mb-4">CRITICAL SYSTEM FAILURE</h1>
          <p className="text-zinc-400 mb-8 max-w-md text-center">{this.state.error?.message || "An unexpected error occurred in calculations."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-black font-bold uppercase hover:bg-red-500 transition-colors"
          >
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] font-sans">
      <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <motion.div 
          className="h-full bg-cyan-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <div className="text-cyan-500 font-black italic tracking-widest text-xs uppercase animate-pulse">
        Initializing Neural Link...
      </div>
    </div>
  );
}

export function GamePage() {
  const status = useGameStore((state) => state.status);
  const setLoading = useGameStore((state) => state.setLoading);
  const isMuted = useGameStore((state) => state.isMuted);
  const volume = useGameStore((state) => state.volume);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [setLoading]);

  // Audio Control
  useEffect(() => {
    try {
      if (isMuted) {
        audioManager.toggleMute(); 
      }
      audioManager.setVolume(volume);
    } catch (e) {
      console.warn("Audio Manager sync failed", e);
    }
  }, [isMuted, volume]);

  useEffect(() => {
    if (status === 'playing') {
      window.focus();
    }
    
    try {
      switch (status) {
        case 'menu':
          audioManager.playMusic('menu');
          audioManager.stopEngine();
          break;
        case 'playing':
          audioManager.playMusic('race');
          audioManager.startEngine();
          break;
        case 'finished':
          audioManager.playMusic('gameover');
          audioManager.stopEngine();
          break;
        default:
          audioManager.stopEngine();
      }
    } catch (e) {
      console.warn("Audio Context playback failed", e);
    }
  }, [status]);

  return (
    <ErrorBoundary>
      <div className="relative w-screen h-screen bg-black overflow-hidden select-none font-sans">
        {status === 'loading' && <LoadingScreen />}

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-50 pointer-events-auto">
          <Link to="/" className="flex items-center gap-2 text-white/30 hover:text-cyan-400 transition-colors text-[10px] font-black uppercase tracking-widest group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Exit Simulation
          </Link>
        </div>

        {/* 3D Scene Layer */}
        <div className="absolute inset-0 z-0">
          <Scene />
        </div>
        
        {/* UI Layer Container */}
        <div className="relative z-10 w-full h-full pointer-events-none">
          <AnimatePresence mode="wait">
            {status === 'menu' && (
              <motion.div 
                key="main-menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-auto w-full h-full"
              >
                <MainMenu />
              </motion.div>
            )}
            {status === 'finished' && (
              <motion.div 
                key="end-menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-auto w-full h-full"
              >
                <EndGameMenu />
              </motion.div>
            )}
          </AnimatePresence>

          {(status === 'playing' || status === 'paused') && (
            <div className="pointer-events-auto w-full h-full">
              <HUD />
            </div>
          )}
        </div>
        
        {/* Post-processing Overlays */}
        <div className="fixed inset-0 pointer-events-none z-20 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
        <div className="fixed inset-0 pointer-events-none z-20 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>
    </ErrorBoundary>
  );
}
