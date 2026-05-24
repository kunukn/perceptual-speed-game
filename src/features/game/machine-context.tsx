import { paths } from '@/app/paths';
import { useMachine } from '@xstate/react';
import type { ConfettiTier } from './components/useConfetti';
import { gameMachine } from './machine';
import { useHighScores } from './store/high-scores';

type MachineReturn = ReturnType<typeof useMachine<typeof gameMachine>>;
type GameMachineValue = {
  state: MachineReturn[0];
  send: MachineReturn[1];
  lastResultTier: ConfettiTier;
  consumeConfetti: () => void;
};

type PendingConfetti = { tier: ConfettiTier; runId: number };

const GameMachineContext = createContext<GameMachineValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function GameMachineProvider({ children }: Props) {
  const [state, send] = useMachine(gameMachine);
  const navigate = useNavigate();

  const {
    answers,
    correct,
    elapsedMs,
    startedAt,
    mode,
    countTarget,
    timeLimitMs,
    letterSystem,
    mirrorX,
    mirrorY,
  } = state.context;

  /* Single atomic state: what to celebrate, for which run. `null` means
   * nothing pending (initial, after consume, or after RESTART). */
  const [pending, setPending] = useState<PendingConfetti | null>(null);

  /* Stable callback — referenced from consumer hooks; recompute only when
   * the current runId changes, so a stale call from a prior run is a no-op. */
  const consumeConfetti = useCallback(() => {
    setPending((p) => (p && p.runId === startedAt ? null : p));
  }, [startedAt]);

  /* Persist one record per unique run on entry to `finished`. `startedAt` is
   * unique per run, so this fires exactly once even under StrictMode
   * double-effect. */
  const recordedRef = useRef(0);
  useEffect(() => {
    if (!state.matches('finished')) return;

    if (startedAt === 0 || recordedRef.current === startedAt) return;

    recordedRef.current = startedAt;

    const { isEntry, isPerfect } = useHighScores.getState().recordScore({
      mode,
      countTarget,
      timeLimitMs,
      letterSystem,
      mirrorX,
      mirrorY,
      correct,
      answered: answers.length,
      elapsedMs,
    });
    const tier: ConfettiTier = isPerfect
      ? 'perfect'
      : isEntry
        ? 'entry'
        : 'none';

    setPending({ tier, runId: startedAt });
  }, [
    state,
    startedAt,
    mode,
    countTarget,
    timeLimitMs,
    letterSystem,
    mirrorX,
    mirrorY,
    correct,
    answers.length,
    elapsedMs,
  ]);

  /* When the machine transitions to `finished` (count-mode last answer or time-mode expiry), route the user to /results regardless of the current route. */
  useEffect(() => {
    if (state.matches('finished')) {
      navigate(paths.results, { replace: true });
    }
  }, [state, navigate]);

  /* Stable context value — prevents consumers from re-rendering on every provider render when machine state is unchanged. */
  const value = useMemo<GameMachineValue>(
    () => ({
      state,
      send,
      lastResultTier: pending?.tier ?? 'none',
      consumeConfetti,
    }),
    [state, send, pending, consumeConfetti],
  );

  return <GameMachineContext value={value}>{children}</GameMachineContext>;
}

export function useGameMachine(): GameMachineValue {
  const value = useContext(GameMachineContext);
  if (!value) {
    throw new Error('useGameMachine must be used inside <GameMachineProvider>');
  }

  return value;
}
