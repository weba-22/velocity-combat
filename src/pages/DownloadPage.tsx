import { motion } from 'motion/react';
import { Download, Shield, HardDrive, Monitor, CheckCircle, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function DownloadPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const startDownload = async (platform: string) => {
    setDownloadStarted(true);
    try {
      await addDoc(collection(db, 'downloads'), {
        platform,
        timestamp: serverTimestamp(),
        // ip tracking handled by server if using Express, but here we just log the event
      });
      // In a real scenario, this would be a link to a signed S3 URL or similar
      // For this demo, we simulate a file download
      const link = document.createElement('a');
      link.href = '#'; // Placeholder
      link.download = `VelocityCombat_NeonRush_${platform.toLowerCase()}.exe`;
      // document.body.appendChild(link); // Not actually downloading a placeholder
      // link.click();
    } catch (e) {
      console.error("Tracking failed", e);
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen font-sans">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-colors text-xs font-black uppercase mb-12 tracking-widest group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Terminal
        </Link>

        <div className="max-w-4xl mx-auto">
          <header className="mb-16">
            <h1 className="text-5xl font-black italic mb-4">DEPLOYMENT HUB</h1>
            <p className="text-zinc-500 max-w-xl">Initialize your local installation of Velocity Combat: Neon Rush. Choose your architecture below.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <DownloadCard 
              platform="Windows" 
              version="v1.4.2" 
              size="4.2 GB" 
              onDownload={() => startDownload('Windows')}
              status="LATEST"
              recommended
            />
            <DownloadCard 
              platform="Linux" 
              version="v1.4.0" 
              size="3.8 GB" 
              onDownload={() => startDownload('Linux')}
              status="STABLE"
            />
            <DownloadCard 
              platform="macOS" 
              version="v1.2.x" 
              size="--" 
              comingSoon
            />
          </div>

          <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-lg mb-20">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-zinc-500">System Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Requirement icon={<Monitor />} label="Operating System" value="Windows 10/11 64-bit" />
              <Requirement icon={<HardDrive />} label="Process Architecture" value="x64-based processor" />
              <Requirement icon={<Shield />} label="DirectX" value="Version 12" />
              <Requirement icon={<CheckCircle />} label="Memory" value="8 GB RAM Minimum" />
            </div>
          </section>

          {downloadStarted && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-cyan-500/10 border border-cyan-500/50 rounded-lg flex items-center gap-6"
            >
              <div className="w-12 h-12 bg-cyan-500 rounded flex items-center justify-center text-black">
                <Download className="animate-bounce" />
              </div>
              <div>
                <h4 className="font-black italic uppercase">Downloading VelocityCombat_v1.4.2_Win.exe</h4>
                <p className="text-xs text-cyan-400 font-mono">Your transfer has been initialized. Tracker ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function DownloadCard({ platform, version, size, onDownload, status, recommended, comingSoon }: any) {
  if (comingSoon) {
    return (
      <div className="p-8 border border-zinc-900 bg-zinc-900/10 grayscale opacity-50 flex flex-col items-center justify-center text-center">
        <Monitor size={32} className="mb-4 text-zinc-700" />
        <h3 className="font-black italic uppercase mb-1">{platform}</h3>
        <p className="text-[10px] font-mono text-zinc-600 uppercase">Coming Soon</p>
      </div>
    );
  }

  return (
    <div className={`p-8 border ${recommended ? 'border-cyan-500 bg-zinc-900/50' : 'border-zinc-800 bg-zinc-900/20'} relative overflow-hidden group`}>
      {recommended && <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-black uppercase px-3 py-1">Recommended</div>}
      
      <div className="mb-6">
        <h3 className="text-2xl font-black italic uppercase mb-1">{platform}</h3>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{version} • {size}</span>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase"><CheckCircle size={12} className="text-cyan-500" /> Standalone EXE</div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase"><CheckCircle size={12} className="text-cyan-500" /> Auto-Updates</div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase"><CheckCircle size={12} className="text-cyan-500" /> Save Sync</div>
      </div>

      <button 
        onClick={onDownload}
        className={`w-full py-3 font-black uppercase flex items-center justify-center gap-2 transition-all ${recommended ? 'bg-cyan-500 text-black hover:bg-white' : 'bg-white text-black hover:bg-cyan-500'}`}
      >
        <Download size={18} />
        Initialize
      </button>

      <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
         <Monitor size={80} />
      </div>
    </div>
  );
}

function Requirement({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-zinc-900 text-cyan-500 border border-zinc-800">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase text-zinc-600 tracking-wider mb-1">{label}</p>
        <p className="text-sm font-bold text-zinc-300">{value}</p>
      </div>
    </div>
  );
}
