import {
  highScoreKey,
  isBetter,
  useHighScores,
  type HighScore,
} from '@/features/game/store/high-scores'

const createInput = (
  overrides?: Partial<Omit<HighScore, 'key' | 'achievedAt'>>,
): Omit<HighScore, 'key' | 'achievedAt'> => ({
  mode: 'count',
  countTarget: 5,
  timeLimitMs: 60_000,
  letterSystem: 'english',
  mirrorX: false,
  mirrorY: false,
  correct: 3,
  answered: 5,
  elapsedMs: 12_000,
  ...overrides,
})

beforeEach(() => {
  localStorage.clear()
  useHighScores.setState({ scores: {} })
})

describe('highScoreKey', () => {
  test('encodes a count-mode variant', () => {
    expect(
      highScoreKey({
        mode: 'count',
        countTarget: 10,
        timeLimitMs: 60_000,
        letterSystem: 'english',
        mirrorX: false,
        mirrorY: false,
      }),
    ).toBe('count:10|english|x0|y0')
  })

  test('encodes a time-mode variant', () => {
    expect(
      highScoreKey({
        mode: 'time',
        countTarget: 5,
        timeLimitMs: 30_000,
        letterSystem: 'greek',
        mirrorX: true,
        mirrorY: false,
      }),
    ).toBe('time:30000|greek|x1|y0')
  })

  test('distinguishes variants that differ only by mirror flag', () => {
    const base = {
      mode: 'count' as const,
      countTarget: 5,
      timeLimitMs: 60_000,
      letterSystem: 'english' as const,
      mirrorX: false,
      mirrorY: false,
    }

    expect(highScoreKey(base)).not.toBe(
      highScoreKey({ ...base, mirrorX: true }),
    )
  })
})

describe('isBetter', () => {
  const base: HighScore = {
    ...createInput(),
    key: 'k',
    achievedAt: 0,
  }

  test('returns true when candidate has more correct answers', () => {
    const candidate = { ...base, correct: 4 }
    const current = { ...base, correct: 3 }
    expect(isBetter(candidate, current)).toBe(true)
  })

  test('returns false when candidate has fewer correct answers', () => {
    const candidate = { ...base, correct: 2 }
    const current = { ...base, correct: 3 }
    expect(isBetter(candidate, current)).toBe(false)
  })

  test('in count mode, lower elapsedMs wins on equal correct', () => {
    const candidate = { ...base, mode: 'count' as const, elapsedMs: 8_000 }
    const current = { ...base, mode: 'count' as const, elapsedMs: 12_000 }
    expect(isBetter(candidate, current)).toBe(true)
    expect(isBetter(current, candidate)).toBe(false)
  })

  test('in time mode, fewer answered wins on equal correct', () => {
    const candidate = { ...base, mode: 'time' as const, answered: 7 }
    const current = { ...base, mode: 'time' as const, answered: 9 }
    expect(isBetter(candidate, current)).toBe(true)
    expect(isBetter(current, candidate)).toBe(false)
  })
})

describe('useHighScores - recordScore', () => {
  test('should record a new score as a new record', () => {
    const input = createInput()
    const result = useHighScores.getState().recordScore(input)

    expect(result.isNewRecord).toBe(true)
    const key = highScoreKey(input)
    const stored = useHighScores.getState().scores[key]
    expect(stored).toBeDefined()
    expect(stored.correct).toBe(input.correct)
    expect(stored.key).toBe(key)
  })

  test('should not overwrite a better existing score', () => {
    const first = createInput({ correct: 4, elapsedMs: 8_000 })
    useHighScores.getState().recordScore(first)

    const worse = createInput({ correct: 2, elapsedMs: 10_000 })
    const result = useHighScores.getState().recordScore(worse)

    expect(result.isNewRecord).toBe(false)
    const key = highScoreKey(first)
    expect(useHighScores.getState().scores[key].correct).toBe(4)
  })

  test('should overwrite when the new score is better', () => {
    const initial = createInput({ correct: 3, elapsedMs: 12_000 })
    useHighScores.getState().recordScore(initial)

    const better = createInput({ correct: 5, elapsedMs: 12_000 })
    const result = useHighScores.getState().recordScore(better)

    expect(result.isNewRecord).toBe(true)
    const key = highScoreKey(initial)
    expect(useHighScores.getState().scores[key].correct).toBe(5)
  })

  test('clear empties all scores', () => {
    useHighScores.getState().recordScore(createInput())
    expect(Object.keys(useHighScores.getState().scores)).toHaveLength(1)

    useHighScores.getState().clear()
    expect(useHighScores.getState().scores).toEqual({})
  })
})
