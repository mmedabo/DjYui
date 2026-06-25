import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Music, ChevronDown, Search } from 'lucide-react';
import { TRACKS } from '../../data/tracks';

interface Props {
  deck: 'A' | 'B';
  currentTrackId: string | null;
  onSelect: (trackId: string) => void;
}

export function TrackSelector({ deck, currentTrackId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const currentTrack = TRACKS.find(t => t.id === currentTrackId);
  const deckColor = deck === 'A' ? '#a855f7' : '#06b6d4';

  const filtered = TRACKS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase()) ||
    t.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left transition-all"
        style={{
          background: '#1a1a2e',
          border: `1px solid ${open ? deckColor : 'rgba(255,255,255,0.1)'}`,
          boxShadow: open ? `0 0 10px ${deckColor}40` : 'none',
        }}
      >
        <Music size={14} style={{ color: deckColor }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          {currentTrack ? (
            <div>
              <div className="text-xs font-semibold text-white truncate">{currentTrack.name}</div>
              <div className="text-xs text-white/40 truncate">{currentTrack.artist} • {currentTrack.bpm} BPM</div>
            </div>
          ) : (
            <span className="text-xs text-white/30">Select track for Deck {deck}</span>
          )}
        </div>
        <ChevronDown size={12} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden"
            style={{ background: '#111122', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
          >
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
              <Search size={12} className="text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tracks..."
                className="bg-transparent text-xs text-white outline-none flex-1 placeholder-white/20"
                autoFocus
              />
            </div>

            {/* Track list */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.map(track => (
                <button
                  key={track.id}
                  onClick={() => { onSelect(track.id); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                  style={{ borderLeft: track.id === currentTrackId ? `3px solid ${track.color}` : '3px solid transparent' }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: track.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{track.name}</div>
                    <div className="text-xs text-white/40 truncate">{track.artist}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono text-white/60">{track.bpm}</div>
                    <div className="text-xs text-white/30">{track.key}</div>
                  </div>
                  <div className="text-xs px-1.5 py-0.5 rounded text-white/50" style={{ background: '#1a1a2e', fontSize: 9 }}>
                    {track.genre}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
