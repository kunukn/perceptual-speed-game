import { formatElapsed } from '@/features/game/machine';

type Props = { startedAt: number };

export function Timer({ startedAt }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);

    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-slate-500 tabular-nums">
      {formatElapsed(now - startedAt)}
    </span>
  );
}
