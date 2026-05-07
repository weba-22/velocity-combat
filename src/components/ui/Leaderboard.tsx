import { useState, useEffect } from 'react';
import { getLeaderboard } from '../../lib/firebase';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

export function Leaderboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getLeaderboard();
      setEntries(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-md p-6 border border-white/10 w-full max-w-md">
      <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/30 pb-2">
        <Trophy className="text-yellow-500" size={20} />
        <h2 className="text-white font-black italic uppercase tracking-tighter">Global Champions</h2>
      </div>
      
      {loading ? (
        <div className="text-gray-500 text-xs animate-pulse">Syncing satellite data...</div>
      ) : (
        <div className="space-y-2">
          {entries.length === 0 && <div className="text-gray-600 text-[10px]">No records found. Be the first!</div>}
          {entries.map((entry, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex justify-between items-center bg-white/5 p-2 rounded"
            >
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold w-4 ${i === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {i + 1}
                </span>
                <span className="text-sm text-gray-200 uppercase font-bold tracking-tight">
                  {entry.userName}
                </span>
              </div>
              <span className="text-cyan-400 font-mono font-bold">
                {entry.score.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
