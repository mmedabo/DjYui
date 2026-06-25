import { useEffect, useRef } from 'react';

interface Props {
  getAnalyserData: () => Uint8Array;
  color: string;
  height?: number;
  style?: 'bars' | 'mirror';
  isPlaying: boolean;
}

export function AudioVisualizer({ getAnalyserData, color, height = 48, style = 'bars', isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | undefined>(undefined);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      const analyserData = getAnalyserData();
      ctx.clearRect(0, 0, W, H);

      if (!isPlaying || analyserData.length === 0) {
        // Idle flat line
        ctx.strokeStyle = color + '30';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        return;
      }

      phaseRef.current += 0.04;

      if (style === 'bars') {
        const barCount = 32;
        const barW = W / barCount - 1;
        const step = Math.floor(analyserData.length / barCount);

        for (let i = 0; i < barCount; i++) {
          // Average a small range for smoother bars
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += analyserData[i * step + j] || 0;
          }
          const avg = sum / step;
          const v = avg / 255;
          const barH = Math.max(2, v * H * 0.9);
          const x = i * (barW + 1);
          const y = (H - barH) / 2;

          // Gradient fill
          const grad = ctx.createLinearGradient(x, y, x, y + barH);
          grad.addColorStop(0, color + 'ff');
          grad.addColorStop(0.5, color + 'cc');
          grad.addColorStop(1, color + '44');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, barH, 2);
          ctx.fill();

          // Glow on tall bars
          if (v > 0.6) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.fillRect(x, y, barW, barH);
            ctx.shadowBlur = 0;
          }
        }
      } else {
        // Mirror waveform
        const barCount = 48;
        const barW = W / barCount - 0.5;
        const step = Math.floor(analyserData.length / barCount);

        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += analyserData[i * step + j] || 0;
          const v = (sum / step) / 255;
          const barH = Math.max(1, v * (H / 2) * 0.95);
          const x = i * (barW + 0.5);
          const centerY = H / 2;

          ctx.fillStyle = color + 'aa';
          ctx.fillRect(x, centerY - barH, barW, barH);
          ctx.fillStyle = color + '55';
          ctx.fillRect(x, centerY, barW, barH);
        }
      }
    };

    if (isPlaying) {
      const loop = () => {
        draw();
        animRef.current = requestAnimationFrame(loop);
      };
      animRef.current = requestAnimationFrame(loop);
    } else {
      draw();
    }

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [getAnalyserData, color, height, style, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={height}
      className="w-full rounded-lg"
      style={{ imageRendering: 'auto' }}
    />
  );
}
