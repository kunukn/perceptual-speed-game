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
        label={`Review ${pad2(index + 1)} / ${pad2(total)}`}
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
        {isCorrect ? 'Correct' : 'Wrong'}
      </p>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={goPrev}>
          Back
        </Button>
        <Button variant="outline" size="lg" onClick={onExit}>
          Exit
        </Button>
        <Button variant="outline" size="lg" onClick={goNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
