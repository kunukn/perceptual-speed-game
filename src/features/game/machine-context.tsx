import { useMachine } from '@xstate/react';
import type { ReactNode } from 'react';
import { paths } from '@/app/paths';
import type { ConfettiTier } from './components/useConfetti';
import { gameMachine } from './machine';
import {
  highScoreKey,
  isBetter,
  useHighScores,
  type HighScore,
} from './store/high-scores';

type MachineReturn = ReturnType<typeof useMachine<typeof gameMachine>>;
type GameMachineValue = {
  state: MachineReturn[0];
  send: MachineReturn[1];
  lastResultTier: ConfettiTier;
};

const GameMachineContext = createContext<GameMachineValue | null>(null);

type Props = {
  children: ReactNode;
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

  const [lastResultTier, setLastResultTier] = useState<ConfettiTier>('none');

  /* Persist one record per unique run on entry to `finished`. `startedAt` is unique per run, so this fires exactly once even under StrictMode double-effect. Snapshot the prior score before saving so Results can celebrate a fresh records entry — by the time Results mounts, the store is already updated. */
  const recordedRunRef = useRef(0);
  useEffect(() => {
    if (!state.matches('finished')) return;

    if (startedAt === 0 || recordedRunRef.current === startedAt) return;

    recordedRunRef.current = startedAt;

    const input = {
      mode,
      countTarget,
      timeLimitMs,
      letterSystem,
      mirrorX,
      mirrorY,
      correct,
      answered: answers.length,
      elapsedMs,
    };
    const key = highScoreKey(input);
    const prior = useHighScores.getState().scores[key];
    const candidate: HighScore = { ...input, key, achievedAt: Date.now() };
    const isEntry = !prior || isBetter(candidate, prior);

    setLastResultTier(
      !isEntry
        ? 'none'
        : mode === 'count' && correct === countTarget
          ? 'perfect'
          : 'entry',
    );

    useHighScores.getState().recordScore(input);
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
    () => ({ state, send, lastResultTier }),
    [state, send, lastResultTier],
  );

  return (
    <GameMachineContext.Provider value={value}>
      {children}
    </GameMachineContext.Provider>
  );
}

export function useGameMachine(): GameMachineValue {
  const value = useContext(GameMachineContext);
  if (!value) {
    throw new Error('useGameMachine must be used inside <GameMachineProvider>');
  }

  return value;
}
