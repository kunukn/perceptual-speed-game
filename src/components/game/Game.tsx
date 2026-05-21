import confetti from 'canvas-confetti';
import { useEffect, useRef, useState } from 'react';
import { GameIntro } from './GameIntro';
import { GameResults } from './GameResults';
import { GameReview } from './GameReview';
import { PuzzleBoard } from './PuzzleBoard';

export const TOTAL_ROUNDS = 10;
export const COLS = 4;
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

type Phase = 'intro' | 'playing' | 'results' | 'review';

type Round = {
  top: string[];
  bottom: string[];
  answer: number;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function randLetter(exclude?: Set<string>): string {
  while (true) {
    const c = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (!exclude || !exclude.has(c)) return c;
  }
}

function generateRound(): Round {
  const target = Math.floor(Math.random() * (COLS + 1));
  const matchCols = new Set<number>();
  while (matchCols.size < target) {
    matchCols.add(Math.floor(Math.random() * COLS));
  }

  const topUpper = Math.random() < 0.5;
  const top: string[] = [];
  const bottom: string[] = [];
  const used = new Set<string>();

  for (let i = 0; i < COLS; i++) {
    const a = randLetter(used);
    used.add(a);
    let b: string;
    if (matchCols.has(i)) {
      b = a;
    } else {
      b = randLetter(used);
      used.add(b);
    }
    top.push(topUpper ? a.toUpperCase() : a);
    bottom.push(topUpper ? b : b.toUpperCase());
  }

  return { top, bottom, answer: target };
}

export default function Game() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (phase !== 'results' || correct < TOTAL_ROUNDS) return;

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
  }, [phase, correct]);

  function start() {
    const fresh = Array.from({ length: TOTAL_ROUNDS }, generateRound);
    setRounds(fresh);
    setAnswers([]);
    setCurrent(0);
    setCorrect(0);
    setStartedAt(Date.now());
    setElapsedMs(0);
    setPhase('playing');
  }

  function answer(n: number) {
    setAnswers((prev) => [...prev, n]);
    const isCorrect = n === rounds[current].answer;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    const nextIdx = current + 1;
    if (nextIdx >= TOTAL_ROUNDS) {
      setCorrect(nextCorrect);
      setElapsedMs(Date.now() - startedAt);
      setPhase('results');
    } else {
      setCorrect(nextCorrect);
      setCurrent(nextIdx);
    }
  }

  function abort() {
    setPhase('intro');
  }

  function restart() {
    setPhase('intro');
  }

  function review() {
    setPhase('review');
  }

  function exitReview() {
    setPhase('results');
  }

  const round = phase === 'playing' ? rounds[current] : null;

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
        {phase === 'intro' && <GameIntro onStart={start} />}

        {phase === 'playing' && round && (
          <PuzzleBoard
            label={`Round ${pad2(current + 1)} / ${pad2(TOTAL_ROUNDS)}`}
            top={round.top}
            bottom={round.bottom}
            onAnswer={answer}
          />
        )}

        {phase === 'results' && (
          <GameResults
            correct={correct}
            total={TOTAL_ROUNDS}
            elapsedMs={elapsedMs}
            onRestart={restart}
            onReview={review}
          />
        )}

        {phase === 'review' && (
          <GameReview rounds={rounds} answers={answers} onExit={exitReview} />
        )}
      </section>

      <footer className="flex min-h-15 items-center justify-center gap-2 border-t border-slate-200">
        {phase === 'playing' && (
          <Button
            size="lg"
            className="min-w-60"
            variant="destructive"
            onClick={abort}
          >
            Abort
          </Button>
        )}
      </footer>
    </div>
  );
}
