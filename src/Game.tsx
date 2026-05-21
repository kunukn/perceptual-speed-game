import { css, keyframes } from '@emotion/react';
import { useState } from 'react';
import { Button } from './components/ui/button';
import { LetterGrid } from './LetterGrid';

const buttonClick = keyframes`
  0%   { transform: scale(1);    background-color: transparent; }
  40%  { transform: scale(0.92); background-color: oklch(0.205 0 0 / 0.12); }
  100% { transform: scale(1);    background-color: transparent; }
`;

const buttonClickStyle = css`
  &[data-clicked='true'] {
    animation: ${buttonClick} 180ms ease-out;
  }
`;

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
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);

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

  function handleAnswer(n: number) {
    setClickedIdx(n);
    answer(n);
  }

  function abort() {
    setPhase('intro');
  }

  function restart() {
    setPhase('intro');
  }

  const round = phase === 'playing' ? rounds[current] : null;

  return (
    <div className="mx-auto flex h-full min-h-screen w-full max-w-2xl flex-col bg-slate-50 px-4 pt-8">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          Perceptual Speed
        </h1>
        <p className="text-center text-sm text-slate-500">Prototype</p>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-10">
        {phase === 'intro' && (
          <div className="max-w-md space-y-4 text-slate-700">
            <h2 className="text-center text-lg font-semibold text-slate-900">
              How to play
            </h2>
            <p>
              You'll see two rows of {COLS} letters. One row is uppercase, the
              other lowercase. Count how many vertical pairs are the{' '}
              <em>same letter</em> (ignoring case), then press the button
              matching that count.
            </p>
            <p>
              {TOTAL_ROUNDS} rounds. We track your time and how many you got
              right.
            </p>
            <div className="flex items-end gap-3 rounded bg-slate-100 p-3">
              <LetterGrid
                top={['a', 'b', 'c', 'd']}
                bottom={['A', 'B', 'C', 'E']}
                showMatches
                className="font-mono text-xl"
              />
              <span className="flex items-center gap-1 pb-0.5 text-sm text-slate-500">
                <span className="font-mono text-lg">→</span>
                <span> answer: 3</span>
              </span>
            </div>
            <div className="flex">
              <Button
                className="mx-auto w-60 max-w-full"
                size="lg"
                onClick={start}
              >
                Start
              </Button>
            </div>
          </div>
        )}

        {phase === 'playing' && round && (
          <div className="flex w-full flex-col items-center gap-8">
            <div className="text-sm text-slate-500 tabular-nums">
              Round {pad2(current + 1)} / {pad2(TOTAL_ROUNDS)}
            </div>

            <hr className="w-full border-slate-200" />

            <LetterGrid
              top={round.top}
              bottom={round.bottom}
              className="font-mono text-4xl"
            />

            <hr className="w-full border-slate-200" />

            <p className="leading-none">Answer:</p>

            <div className="flex w-full max-w-md justify-around gap-1">
              {[0, 1, 2, 3, 4].map((n) => (
                <Button
                  key={n}
                  variant="outline"
                  size="xl"
                  onClick={() => handleAnswer(n)}
                  css={buttonClickStyle}
                  data-clicked={clickedIdx === n ? 'true' : undefined}
                  onAnimationEnd={() =>
                    setClickedIdx((c) => (c === n ? null : c))
                  }
                  className="w-12"
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
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
