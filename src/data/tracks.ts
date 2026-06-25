import type { Track } from '../types';

export const TRACKS: Track[] = [
  // Deep House / Melodic
  { id: 'track-1',  name: 'Midnight Groove',    artist: 'Deep Horizon',   bpm: 126, key: '8A',  genre: 'Deep House',       color: '#a855f7', duration: 360 },
  { id: 'track-6',  name: 'Crystal Waves',      artist: 'Aurora',         bpm: 122, key: '3A',  genre: 'Melodic House',    color: '#ec4899', duration: 450 },
  { id: 'track-8',  name: 'Golden Hour',        artist: 'Sundown',        bpm: 120, key: '5A',  genre: 'Afro House',       color: '#f97316', duration: 400 },
  { id: 'track-13', name: 'Velvet Underground', artist: 'Silk Route',     bpm: 124, key: '4B',  genre: 'Deep House',       color: '#db2777', duration: 420 },
  { id: 'track-14', name: 'Ocean Drive',        artist: 'Sunset Club',    bpm: 118, key: '6A',  genre: 'Tropical House',   color: '#0891b2', duration: 380 },

  // Tech House / Progressive
  { id: 'track-2',  name: 'Neon Pulse',         artist: 'Electric Dawn',  bpm: 132, key: '9B',  genre: 'Tech House',       color: '#06b6d4', duration: 420 },
  { id: 'track-4',  name: 'Solar Drift',        artist: 'Cosmic Beat',    bpm: 128, key: '7B',  genre: 'Progressive House',color: '#10b981', duration: 480 },
  { id: 'track-9',  name: 'Circuit Breaker',    artist: 'Grid Master',    bpm: 134, key: '10A', genre: 'Tech House',       color: '#22c55e', duration: 360 },
  { id: 'track-10', name: 'Analog Soul',        artist: 'Warm Signal',    bpm: 130, key: '2B',  genre: 'Progressive House',color: '#84cc16', duration: 440 },

  // Techno / Hard
  { id: 'track-3',  name: 'Urban Frequency',    artist: 'City Lights',    bpm: 140, key: '11A', genre: 'Techno',           color: '#f59e0b', duration: 390 },
  { id: 'track-7',  name: 'Hyperspace',         artist: 'Warp Drive',     bpm: 145, key: '12B', genre: 'Hard Techno',      color: '#8b5cf6', duration: 360 },
  { id: 'track-11', name: 'Iron Machine',       artist: 'Brutalwerk',     bpm: 148, key: '1A',  genre: 'Techno',           color: '#64748b', duration: 400 },
  { id: 'track-16', name: 'Warehouse Protocol', artist: 'Dark Matter',    bpm: 142, key: '7A',  genre: 'Techno',           color: '#475569', duration: 420 },

  // Drum & Bass / Breakbeat
  { id: 'track-5',  name: 'Bass Protocol',      artist: 'Sub Zero',       bpm: 174, key: '6A',  genre: 'Drum & Bass',      color: '#ef4444', duration: 320 },
  { id: 'track-12', name: 'Liquid Chrome',      artist: 'Fluid Dynamics', bpm: 170, key: '8B',  genre: 'Liquid DnB',       color: '#f43f5e', duration: 350 },
  { id: 'track-15', name: 'Pressure Drop',      artist: 'Subculture',     bpm: 176, key: '3B',  genre: 'Neurofunk',        color: '#dc2626', duration: 310 },
];

export const GENRE_LIST = Array.from(new Set(TRACKS.map(t => t.genre))).sort();
