import { PuzzleBoard } from './PuzzleBoard';

type Round = {
  top: string[];
  bottom: string[];
  answer: number;
};

type Props = {
  rounds: Round[];
  answers: number[];
  onExit: () => void;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function GameReview({ rounds, answers, onExit }: Props) {
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
    <div className="flex w-full flex-col items-center gap-6">
      <PuzzleBoard
        label={t('review.label', {
          current: pad2(index + 1),
          total: pad2(total),
        })}
        top={round.top}
        bottom={round.bottom}
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

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={goPrev}>
          {t('common.back')}
        </Button>
        <Button variant="outline" size="lg" onClick={onExit}>
          {t('review.exit')}
        </Button>
        <Button variant="outline" size="lg" onClick={goNext}>
          {t('review.next')}
        </Button>
      </div>
    </div>
  );
}
