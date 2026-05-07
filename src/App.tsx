/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { GamePage } from './pages/GamePage';
import { DownloadPage } from './pages/DownloadPage';
import { useGameStore } from './store/useGameStore';
import { auth, validateConnection } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const setUser = useGameStore((state) => state.setUser);

  useEffect(() => {
    // Initial connection validation
    validateConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<GamePage />} />
        <Route path="/download" element={<DownloadPage />} />
        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

