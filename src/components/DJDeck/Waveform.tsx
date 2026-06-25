import { useRef, useEffect } from 'react';
import { TRACKS } from '../../data/tracks';

interface Props {
  trackId: string | null;
  position: number; // 0-1
  isPlaying: boolean;
  color?: string;
  analyserData?: Uint8Array;
}

// Generate fake waveform data for a track
function generateWaveform(trackId: string, samples: number): number[] {
  const seed = trackId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const data: number[] = [];
  for (let i = 0; i < samples; i++) {
    const x = i / samples;
    // Simulate musical structure: quiet intro/outro, loud middle
    const envelope = Math.sin(x * Math.PI) * 0.7 + 0.3;
    // Pseudo-random based on seed
    const rand = Math.abs(Math.sin(seed * (i + 1) * 0.1) * Math.cos(seed * (i + 1) * 0.07));
    const beats = Math.abs(Math.sin(x * 100)) > 0.8 ? 1 : 0.4;
    data.push(envelope * (rand * 0.7 + beats * 0.3));
  }
  return data;
}

const waveformCache: Record<string, number[]> = {};

export function Waveform({ trackId, position, isPlaying, color = '#a855f7', analyserData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    if (!trackId) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Load a track', W / 2, H / 2 + 4);
      return;
    }

    if (!waveformCache[trackId]) {
      waveformCache[trackId] = generateWaveform(trackId, 300);
    }
    const waveData = waveformCache[trackId];

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#0d0d1a';
      ctx.fillRect(0, 0, W, H);

      const cursorX = position * W;

      // Draw waveform
      const barW = W / waveData.length;
      for (let i = 0; i < waveData.length; i++) {
        const x = i * barW;
        const h = waveData[i] * (H * 0.85);
        const isPast = x < cursorX;

        // Color segments
        if (isPast) {
          ctx.fillStyle = color;
        } else {
          ctx.fillStyle = color + '44';
        }

        const barH = Math.max(2, h);
        ctx.fillRect(x, (H - barH) / 2, barW - 0.5, barH);
      }

      // Playhead line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // BPM grid (beat markers)
      const track = TRACKS.find(t => t.id === trackId);
      if (track) {
        const bps = track.bpm / 60;
        const pixelsPerBeat = W / (track.duration * bps);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        const beats = Math.ceil(W / pixelsPerBeat);
        for (let i = 0; i <= beats; i++) {
          const x = i * pixelsPerBeat;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
      }

      // Analyser overlay (real-time frequency)
      if (analyserData && analyserData.length > 0 && isPlaying) {
        ctx.fillStyle = color + '33';
        const barCount = Math.min(analyserData.length, W / 3);
        const bw = W / barCount;
        for (let i = 0; i < barCount; i++) {
          const v = analyserData[Math.floor(i * analyserData.length / barCount)] / 255;
          const bh = v * H * 0.5;
          ctx.fillRect(i * bw, H - bh, bw - 1, bh);
        }
      }
    };

    if (isPlaying) {
      const animate = () => {
        draw();
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    } else {
      draw();
    }

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [trackId, position, isPlaying, color, analyserData]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={72}
      className="w-full rounded-lg"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
