import { paths } from '@/app/paths';
import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { LetterGrid } from '@/features/game/components/LetterGrid';
import { LETTER_SYSTEMS } from '@/features/game/machine';
import { useGameOptions } from '@/features/game/store/options';

const PAIRS_PER_ROW = 10;

export function MatchingPairs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const letterSystem = useGameOptions((s) => s.letterSystem);
  const mirrorX = useGameOptions((s) => s.mirrorX);
  const mirrorY = useGameOptions((s) => s.mirrorY);

  /* Stable reference — chunked list only changes when the letter system changes. */
  const groups = useMemo(() => {
    const pairs = LETTER_SYSTEMS[letterSystem];
    const out: { top: string[]; bottom: string[] }[] = [];
    for (let i = 0; i < pairs.length; i += PAIRS_PER_ROW) {
      const slice = pairs.slice(i, i + PAIRS_PER_ROW);
      out.push({
        top: slice.map(([lower]) => lower),
        bottom: slice.map(([, upper]) => upper),
      });
    }
    return out;
  }, [letterSystem]);

  return (
    <Layout
      header={<AppHeader />}
      footer={
        <Button
          className="min-w-40"
          size="lg"
          variant="outline"
          onClick={() => navigate(paths.options)}
        >
          {t('common.back')}
        </Button>
      }
    >
      <div className="w-auto max-w-3xl space-y-6 text-slate-700">
        <h2 className="text-center text-lg font-semibold text-slate-900">
          {t('matchingPairs.title')}
        </h2>

        <div className="flex flex-col items-center gap-4">
          {groups.map((group, i) => (
            <LetterGrid
              key={i}
              top={group.top}
              bottom={group.bottom}
              matches={group.top.map(() => true)}
              showMatches
              showColumnOutlines
              mirrorX={mirrorX}
              mirrorY={mirrorY}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
