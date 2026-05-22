import { useMachine } from '@xstate/react';
import { useLocalStorage } from 'usehooks-ts';
import { GameIntro } from './GameIntro';
import { GameOptions } from './GameOptions';
import { GameResults } from './GameResults';
import { GameReview } from './GameReview';
import { GameTimer } from './GameTimer';
import { PuzzleBoard } from './PuzzleBoard';
import {
  DEFAULT_OPTIONS,
  gameMachine,
  type GameOptions as GameOptionsType,
} from './gameMachine';
import { useConfetti } from './useConfetti';

export { COLS } from './gameMachine';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export default function Game() {
  const [storedOptions, setStoredOptions] = useLocalStorage<GameOptionsType>(
    'perceptual-speed-options',
    DEFAULT_OPTIONS,
  );
  const [state, send] = useMachine(gameMachine, { input: storedOptions });
  const {
    rounds,
    answers,
    current,
    correct,
    elapsedMs,
    startedAt,
    mode,
    countTarget,
    timeLimitMs,
    showTimer,
    letterSystem,
  } = state.context;

  /* Mirror option changes from the machine back into localStorage. */
  useEffect(() => {
    setStoredOptions({
      mode,
      countTarget,
      timeLimitMs,
      showTimer,
      letterSystem,
    });
  }, [
    mode,
    countTarget,
    timeLimitMs,
    showTimer,
    letterSystem,
    setStoredOptions,
  ]);
  const canvasRef = useConfetti(
    state.matches('results') && mode === 'count' && correct === countTarget,
  );

  const round = state.matches('playing') ? rounds[current] : null;

  return (
    <div
      className="relative flex max-h-[60rem] w-full max-w-2xl flex-1 flex-col overflow-hidden bg-slate-50 px-4 pt-4"
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
          <GameIntro
            mode={mode}
            countTarget={countTarget}
            timeLimitMs={timeLimitMs}
            onStart={() => send({ type: 'START' })}
            onOpenOptions={() => send({ type: 'OPEN_OPTIONS' })}
          />
        )}

        {state.matches('playing') && round && (
          <PuzzleBoard
            label={
              <span className="flex items-center justify-center gap-2">
                <span>
                  {mode === 'time'
                    ? `Round ${pad2(current + 1)}`
                    : `Round ${pad2(current + 1)} / ${pad2(countTarget)}`}
                </span>
                {showTimer && (
                  <>
                    <span aria-hidden>·</span>
                    <GameTimer startedAt={startedAt} />
                  </>
                )}
              </span>
            }
            top={round.top}
            bottom={round.bottom}
            matches={round.matches}
            onAnswer={(n) => send({ type: 'ANSWER', value: n })}
          />
        )}

        {state.matches('options') && (
          <GameOptions
            mode={mode}
            countTarget={countTarget}
            timeLimitMs={timeLimitMs}
            showTimer={showTimer}
            letterSystem={letterSystem}
            onModeChange={(m) => send({ type: 'SET_MODE', mode: m })}
            onCountTargetChange={(value) =>
              send({ type: 'SET_COUNT_TARGET', value })
            }
            onTimeLimitChange={(value) =>
              send({ type: 'SET_TIME_LIMIT', value })
            }
            onShowTimerChange={(value) =>
              send({ type: 'SET_SHOW_TIMER', value })
            }
            onLetterSystemChange={(value) =>
              send({ type: 'SET_LETTER_SYSTEM', value })
            }
            onBack={() => send({ type: 'BACK_TO_INTRO' })}
          />
        )}

        {state.matches('results') && (
          <GameResults
            correct={correct}
            total={mode === 'time' ? answers.length : countTarget}
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

      {state.matches('playing') && (
        <footer className="flex min-h-15 shrink-0 items-center justify-center gap-2 border-t border-slate-200">
          <Button
            size="lg"
            className="min-w-60"
            variant="destructive"
            onClick={() => send({ type: 'ABORT' })}
          >
            Abort
          </Button>
        </footer>
      )}
    </div>
  );
}
