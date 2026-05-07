/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scene } from './components/game/Scene';
import { HUD } from './components/ui/HUD';
import { MainMenu } from './components/ui/MainMenu';
import { useGameStore } from './store/useGameStore';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const status = useGameStore((state) => state.status);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden select-none">
      <Scene />
      
      <AnimatePresence>
        {status === 'menu' && <MainMenu />}
      </AnimatePresence>

      {(status === 'playing' || status === 'paused') && <HUD />}
      
      {/* Vignette & CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}

