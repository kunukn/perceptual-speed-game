import { useMachine } from '@xstate/react';
import { GameIntro } from './GameIntro';
import { GameOptions } from './GameOptions';
import { GameResults } from './GameResults';
import { GameReview } from './GameReview';
import { PuzzleBoard } from './PuzzleBoard';
import { gameMachine, TOTAL_ROUNDS } from './gameMachine';
import { useConfetti } from './useConfetti';

export { COLS, TOTAL_ROUNDS } from './gameMachine';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export default function Game() {
  const [state, send] = useMachine(gameMachine);
  const { rounds, answers, current, correct, elapsedMs, mode } = state.context;
  const canvasRef = useConfetti(
    state.matches('results') && correct === TOTAL_ROUNDS,
  );

  const round = state.matches('playing') ? rounds[current] : null;

  return (
    <div
      className="relative flex w-full max-w-2xl flex-1 flex-col overflow-hidden bg-slate-50 px-4 pt-4"
      data-testid="game-root"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <header className="shrink-0 border-b border-slate-200 pb-4">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          Perceptual Speed
        </h1>
        <p className="text-center text-sm text-slate-500">Prototype</p>
      </header>

      <section className="flex min-h-0 flex-1 flex-col items-center justify-center-safe overflow-y-auto py-4">
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

        {state.matches('options') && (
          <GameOptions
            mode={mode}
            onModeChange={(m) => send({ type: 'SET_MODE', mode: m })}
            onBack={() => send({ type: 'BACK_TO_INTRO' })}
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

      <footer className="flex min-h-15 shrink-0 items-center justify-center gap-2 border-t border-slate-200">
        {state.matches('intro') && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => send({ type: 'OPEN_OPTIONS' })}
          >
            Options
          </Button>
        )}
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
