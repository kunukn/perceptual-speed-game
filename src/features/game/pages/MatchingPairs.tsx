import { paths } from '@/app/paths';
import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { LETTER_SYSTEMS } from '@/features/game/machine';
import { useGameOptions } from '@/features/game/store/options';

export function MatchingPairs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const letterSystem = useGameOptions((s) => s.letterSystem);
  const mirrorX = useGameOptions((s) => s.mirrorX);
  const mirrorY = useGameOptions((s) => s.mirrorY);

  const pairs = LETTER_SYSTEMS[letterSystem];

  const transform =
    [mirrorX && 'scaleX(-1)', mirrorY && 'scaleY(-1)']
      .filter(Boolean)
      .join(' ') || undefined;
  const glyphStyle = transform
    ? { transform, display: 'inline-block' as const }
    : undefined;

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

        <div className="font-hyperlegible mx-auto flex max-w-md flex-wrap justify-center gap-1 text-2xl">
          {pairs.map(([lower, upper], i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-y-1 rounded-sm border border-emerald-500 py-[0.05em]"
              style={{ width: '1.6em' }}
            >
              <span
                className="text-center text-emerald-600 tabular-nums"
                style={glyphStyle}
              >
                {lower}
              </span>
              <span
                className="text-center text-emerald-600 tabular-nums"
                style={glyphStyle}
              >
                {upper}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
