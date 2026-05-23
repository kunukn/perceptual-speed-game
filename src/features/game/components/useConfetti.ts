import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

export function useConfetti(
  active: boolean,
): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const fire = confetti.create(canvas, { resize: true, useWorker: false });
    const end = Date.now() + 3000;

    let rafId: number;
    const frame = () => {
      fire({
        particleCount: 3,
        angle: 60 + Math.random() * 60,
        spread: 50 + Math.random() * 30,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors: ['#ff0', '#f00', '#0f0', '#00f', '#f0f', '#0ff'],
        startVelocity: 20 + Math.random() * 15,
      });
      if (Date.now() < end) {
        rafId = requestAnimationFrame(frame);
      }
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      fire.reset();
    };
  }, [active]);

  return canvasRef;
}
