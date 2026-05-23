import { Layout } from '@/components/layout/Layout';
import { PuzzleBoard } from './PuzzleBoard';

type Round = {
  top: string[];
  bottom: string[];
  answer: number;
};

type Props = {
  rounds: Round[];
  answers: number[];
  mirrorX: boolean;
  mirrorY: boolean;
  onExit: () => void;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function GameReview({
  rounds,
  answers,
  mirrorX,
  mirrorY,
  onExit,
}: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const total = answers.length;
  const round = rounds[index];
  const userAnswer = answers[index];
  const isCorrect = userAnswer === round.answer;

  function goNext() {
    setIndex((i) => (i + 1) % total);
  }

  function goPrev() {
    setIndex((i) => (i - 1 + total) % total);
  }

  return (
    <Layout
      header={
        <p className="text-center text-sm text-slate-500 tabular-nums">
          {t('review.label', {
            current: pad2(index + 1),
            total: pad2(total),
          })}
        </p>
      }
      footer={
        <div className="mx-auto flex w-auto min-w-62.5 gap-2">
          <Button
            className="flex-1"
            variant="outline"
            size="lg"
            onClick={goPrev}
          >
            {t('common.back')}
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            size="lg"
            onClick={onExit}
          >
            {t('review.exit')}
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            size="lg"
            onClick={goNext}
          >
            {t('review.next')}
          </Button>
        </div>
      }
    >
      <div className="flex w-full flex-col items-center gap-6">
        <PuzzleBoard
          top={round.top}
          bottom={round.bottom}
          mirrorX={mirrorX}
          mirrorY={mirrorY}
          showMatches
          highlightIdx={round.answer}
          wrongIdx={isCorrect ? undefined : userAnswer}
        />

        <p
          className={
            isCorrect
              ? 'text-lg font-semibold text-emerald-700'
              : 'text-lg font-semibold text-red-700'
          }
        >
          {isCorrect ? t('review.correct') : t('review.wrong')}
        </p>
      </div>
    </Layout>
  );
}
