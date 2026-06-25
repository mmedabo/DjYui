import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Music, ChevronDown, Search } from 'lucide-react';
import { TRACKS } from '../../data/tracks';

const GENRES = ['All', ...Array.from(new Set(TRACKS.map(t => t.genre)))];

interface Props {
  deck: 'A' | 'B';
  currentTrackId: string | null;
  onSelect: (trackId: string) => void;
}

export function TrackSelector({ deck, currentTrackId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentTrack = TRACKS.find(t => t.id === currentTrackId);
  const deckColor = deck === 'A' ? '#a855f7' : '#06b6d4';

  const filtered = TRACKS.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase()) ||
      t.genre.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genreFilter === 'All' || t.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const updateDropdownPos = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 280;
    const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
    setDropdownPos({
      top: openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  const handleOpen = () => {
    updateDropdownPos();
    setOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handle);
    window.addEventListener('scroll', () => setOpen(false), { passive: true });
    return () => window.removeEventListener('mousedown', handle);
  }, [open]);

  const dropdown = open && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'fixed',
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: Math.max(dropdownPos.width, 300),
          zIndex: 9999,
          background: '#0e0e1a',
          border: `1px solid ${deckColor}44`,
          borderRadius: 14,
          boxShadow: `0 24px 64px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)`,
          overflow: 'hidden',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
          <Search size={12} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tracks, artist, genre..."
            className="bg-transparent text-xs text-white outline-none flex-1 placeholder-white/20"
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-white/30 hover:text-white text-xs">✕</button>
          )}
        </div>

        {/* Genre filter chips */}
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-white/5">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setGenreFilter(g)}
              className="shrink-0 text-xs px-2.5 py-1 rounded-full transition-all"
              style={{
                background: genreFilter === g ? deckColor + '33' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${genreFilter === g ? deckColor : 'transparent'}`,
                color: genreFilter === g ? deckColor : 'rgba(255,255,255,0.5)',
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Track list */}
        <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-xs text-white/30">No tracks found</div>
          ) : filtered.map(track => (
            <button
              key={track.id}
              onClick={() => { onSelect(track.id); setOpen(false); setSearch(''); setGenreFilter('All'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
              style={{ borderLeft: `3px solid ${track.id === currentTrackId ? track.color : 'transparent'}` }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: track.color, boxShadow: `0 0 6px ${track.color}` }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{track.name}</div>
                <div className="text-xs text-white/40 truncate">{track.artist}</div>
              </div>
              <div className="flex flex-col items-end shrink-0 gap-0.5">
                <span className="text-xs font-mono text-white/70">{track.bpm} BPM</span>
                <span className="text-xs text-white/30">{track.key}</span>
              </div>
              <span
                className="text-xs px-1.5 py-0.5 rounded shrink-0"
                style={{ background: `${track.color}15`, color: track.color, fontSize: 9 }}
              >
                {track.genre}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-white/20">{filtered.length} of {TRACKS.length} tracks</span>
          <button onClick={() => setOpen(false)} className="text-xs text-white/30 hover:text-white/60">Close</button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={open ? () => setOpen(false) : handleOpen}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left transition-all"
        style={{
          background: '#1a1a2e',
          border: `1px solid ${open ? deckColor : 'rgba(255,255,255,0.1)'}`,
          boxShadow: open ? `0 0 12px ${deckColor}30` : 'none',
        }}
      >
        <Music size={14} style={{ color: deckColor }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          {currentTrack ? (
            <div>
              <div className="text-xs font-semibold text-white truncate">{currentTrack.name}</div>
              <div className="text-xs text-white/40 truncate">{currentTrack.artist} · {currentTrack.bpm} BPM · {currentTrack.key}</div>
            </div>
          ) : (
            <span className="text-xs text-white/30">Load track into Deck {deck}…</span>
          )}
        </div>
        <ChevronDown
          size={12}
          className={`text-white/40 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {dropdown}
    </div>
  );
}
