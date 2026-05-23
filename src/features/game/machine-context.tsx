import { useMachine } from '@xstate/react';
import type { ReactNode } from 'react';
import { paths } from '@/app/paths';
import { gameMachine } from './machine';
import { useHighScores } from './store/high-scores';

type MachineReturn = ReturnType<typeof useMachine<typeof gameMachine>>;
type GameMachineValue = {
  state: MachineReturn[0];
  send: MachineReturn[1];
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

  /* Persist one record per unique run on entry to `finished`. `startedAt` is unique per run, so this fires exactly once even under StrictMode double-effect. */
  const recordedRunRef = useRef(0);
  useEffect(() => {
    if (!state.matches('finished')) return;

    if (startedAt === 0 || recordedRunRef.current === startedAt) return;

    recordedRunRef.current = startedAt;
    useHighScores.getState().recordScore({
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
    () => ({ state, send }),
    [state, send],
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
