import confetti from 'canvas-confetti';
import { useMachine } from '@xstate/react';
import { useEffect, useRef } from 'react';
import { GameIntro } from './GameIntro';
import { GameResults } from './GameResults';
import { GameReview } from './GameReview';
import { PuzzleBoard } from './PuzzleBoard';
import { gameMachine, TOTAL_ROUNDS } from './gameMachine';

export { TOTAL_ROUNDS } from './gameMachine';
export { COLS } from './gameMachine';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export default function Game() {
  const [state, send] = useMachine(gameMachine);
  const { rounds, answers, current, correct, elapsedMs } = state.context;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!state.matches('results') || correct < TOTAL_ROUNDS) return;

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
  }, [state, correct]);

  const round = state.matches('playing') ? rounds[current] : null;

  return (
    <div
      className="relative flex h-[90vh] max-h-215 w-full max-w-2xl flex-col overflow-hidden bg-slate-50 px-4 pt-4"
      data-testid="game-root"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          Perceptual Speed
        </h1>
        <p className="text-center text-sm text-slate-500">Prototype</p>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-4">
        {state.matches('intro') && (
          <GameIntro onStart={() => send({ type: 'START' })} />
        )}

        {state.matches('playing') && round && (
          <PuzzleBoard
            label={`Round ${pad2(current + 1)} / ${pad2(TOTAL_ROUNDS)}`}
            top={round.top}
            bottom={round.bottom}
            onAnswer={(n) => send({ type: 'ANSWER', value: n })}
          />
        )}

        {state.matches('results') && (
          <GameResults
            correct={correct}
            total={TOTAL_ROUNDS}
            elapsedMs={elapsedMs}
            onRestart={() => send({ type: 'RESTART' })}
            onReview={() => send({ type: 'REVIEW' })}
          />
        )}

        {state.matches('review') && (
          <GameReview
            rounds={rounds}
            answers={answers}
            onExit={() => send({ type: 'EXIT_REVIEW' })}
          />
        )}
      </section>

      <footer className="flex min-h-15 items-center justify-center gap-2 border-t border-slate-200">
        {state.matches('playing') && (
          <Button
            size="lg"
            className="min-w-60"
            variant="destructive"
            onClick={() => send({ type: 'ABORT' })}
          >
            Abort
          </Button>
        )}
      </footer>
    </div>
  );
}
