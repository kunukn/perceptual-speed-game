import { useState } from 'react';
import { Button } from './components/ui/button';
import { PuzzleBoard } from './PuzzleBoard';

export const TOTAL_ROUNDS = 10;
const COLS = 4;
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

type Phase = 'intro' | 'playing' | 'results';

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
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  function start() {
    const fresh = Array.from({ length: TOTAL_ROUNDS }, generateRound);
    setRounds(fresh);
    setCurrent(0);
    setCorrect(0);
    setStartedAt(Date.now());
    setElapsedMs(0);
    setPhase('playing');
  }

  function answer(n: number) {
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

  const round = phase === 'playing' ? rounds[current] : null;

  return (
    <div
      className="flex h-[90vh] max-h-215 w-full max-w-2xl flex-col bg-slate-50 px-4 pt-4"
      data-testid="game-root"
    >
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          Perceptual Speed
        </h1>
        <p className="text-center text-sm text-slate-500">Prototype</p>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-4">
        {phase === 'intro' && (
          <div className="max-w-md space-y-4 text-slate-700">
            <h2 className="text-center text-lg font-semibold text-slate-900">
              How to play
            </h2>
            <p className="text-sm md:text-center md:text-base">
              Two rows of {COLS} chars. One row is uppercase, the other
              lowercase. Count matching vertical letter pairs
              (case-insensitive). Press the button matching that count.
            </p>

            <PuzzleBoard
              label="Example"
              top={['a', 'b', 'c', 'd']}
              bottom={['A', 'B', 'C', 'E']}
              showMatches
              showColumnArrows
              highlightIdx={3}
              caption="3 pairs match — the correct answer is 3"
            />
            <div className="flex">
              <Button
                className="mx-auto w-60 max-w-full"
                size="lg"
                onClick={start}
              >
                Start
              </Button>
            </div>
            <p>
              {TOTAL_ROUNDS} rounds. We track your time and how many you got
              right.
            </p>
          </div>
        )}

        {phase === 'playing' && round && (
          <PuzzleBoard
            label={`Round ${pad2(current + 1)} / ${pad2(TOTAL_ROUNDS)}`}
            top={round.top}
            bottom={round.bottom}
            onAnswer={answer}
          />
        )}

        {phase === 'results' && (
          <div className="space-y-3 text-center text-slate-800">
            <h2 className="text-xl font-semibold">Results</h2>
            <p className="text-3xl font-bold">
              {correct} / {TOTAL_ROUNDS}
            </p>
            <p className="mb-6 text-slate-500">
              Time: {(elapsedMs / 1000).toFixed(1)}s
            </p>
            <Button size="lg" className="w-60 max-w-full" onClick={restart}>
              Restart
            </Button>
          </div>
        )}
      </section>

      <footer className="flex min-h-[60px] items-center justify-center gap-2 border-t border-slate-200">
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
