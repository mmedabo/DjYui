import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Music, Search, Upload, X, ChevronDown } from 'lucide-react';
import { TRACKS } from '../../data/tracks';

const GENRES = ['All', ...Array.from(new Set(TRACKS.map(t => t.genre)))];

interface Props {
  deck: 'A' | 'B';
  currentTrackId: string | null;
  currentTrackName?: string; // displayed when currentTrackId is a custom upload
  onSelect: (trackId: string) => void;
  onUpload?: (url: string, name: string) => void;
}

export function TrackSelector({ deck, currentTrackId, currentTrackName, onSelect, onUpload }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const fileRef = useRef<HTMLInputElement>(null);
  const deckColor = deck === 'A' ? '#a855f7' : '#06b6d4';

  const currentTrack = TRACKS.find(t => t.id === currentTrackId);
  const displayName = currentTrackName ?? currentTrack?.name;
  const displaySub = currentTrackName
    ? 'Your upload · 128 BPM'
    : currentTrack ? `${currentTrack.artist} · ${currentTrack.bpm} BPM · ${currentTrack.key}` : null;

  const filtered = TRACKS.filter(t => {
    const q = search.toLowerCase();
    return (t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.genre.toLowerCase().includes(q))
      && (genre === 'All' || t.genre === genre);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^.]+$/, '');
    onUpload?.(url, name);
    setOpen(false);
    e.target.value = '';
  };

  const close = () => { setOpen(false); setSearch(''); setGenre('All'); };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-left transition-all active:scale-95"
        style={{
          background: '#13131f',
          border: `1px solid ${currentTrack || currentTrackName ? deckColor + '55' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <Music size={14} style={{ color: deckColor }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          {displayName ? (
            <>
              <div className="text-xs font-semibold text-white truncate">{displayName}</div>
              {displaySub && <div className="text-xs text-white/40 truncate">{displaySub}</div>}
            </>
          ) : (
            <span className="text-xs text-white/30">Load track into Deck {deck}…</span>
          )}
        </div>
        <ChevronDown size={12} className="text-white/40 shrink-0" />
      </button>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />

      {/* Bottom-sheet modal */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={close}
              />

              {/* Sheet */}
              <motion.div
                key="sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 380 }}
                className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
                style={{
                  background: '#0d0d1c',
                  borderTop: `2px solid ${deckColor}55`,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  maxHeight: '88vh',
                }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-black text-white">Load Track</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: deckColor }}>Deck {deck}</div>
                  </div>
                  <button onClick={close} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {/* Upload from device */}
                <div className="px-4 pt-4 pb-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl transition-all active:scale-95"
                    style={{
                      background: `${deckColor}12`,
                      border: `1.5px dashed ${deckColor}60`,
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${deckColor}25` }}>
                      <Upload size={18} style={{ color: deckColor }} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white">Upload from your device</div>
                      <div className="text-xs text-white/40 mt-0.5">MP3, AAC, WAV, M4A, FLAC…</div>
                    </div>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 px-4 py-1">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-white/20 uppercase tracking-widest">or pick a beat</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Search */}
                <div className="px-4 pt-1 pb-2">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
                    <Search size={14} className="text-white/30 shrink-0" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search tracks, artist, genre…"
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder-white/25"
                      autoComplete="off"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="text-white/30 hover:text-white transition-colors">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Genre chips */}
                <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
                  {GENRES.map(g => (
                    <button
                      key={g}
                      onClick={() => setGenre(g)}
                      className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-all font-semibold"
                      style={{
                        background: genre === g ? `${deckColor}30` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${genre === g ? deckColor : 'transparent'}`,
                        color: genre === g ? deckColor : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* Track list */}
                <div className="flex-1 overflow-y-auto pb-8 px-2">
                  {filtered.length === 0 ? (
                    <div className="text-center py-10 text-sm text-white/30">No tracks found</div>
                  ) : filtered.map(track => (
                    <button
                      key={track.id}
                      onClick={() => { onSelect(track.id); close(); }}
                      className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-left transition-all active:bg-white/5 mb-1"
                      style={{
                        background: track.id === currentTrackId ? `${deckColor}15` : 'transparent',
                        border: `1px solid ${track.id === currentTrackId ? deckColor + '40' : 'transparent'}`,
                      }}
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: track.color, boxShadow: `0 0 8px ${track.color}` }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{track.name}</div>
                        <div className="text-xs text-white/40 truncate">{track.artist}</div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-xs font-mono text-white/70">{track.bpm} BPM</span>
                        <span className="text-xs text-white/30">{track.key}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
