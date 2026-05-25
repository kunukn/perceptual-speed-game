import { DEFAULT_OPTIONS } from '@/features/game/machine';
import { useGameOptions } from '@/features/game/store/options';

beforeEach(() => {
  localStorage.clear();
  useGameOptions.setState(DEFAULT_OPTIONS);
});

describe('useGameOptions - defaults', () => {
  test('should expose DEFAULT_OPTIONS as the initial state', () => {
    const state = useGameOptions.getState();
    expect(state.mode).toBe(DEFAULT_OPTIONS.mode);
    expect(state.countTarget).toBe(DEFAULT_OPTIONS.countTarget);
    expect(state.timeLimitMs).toBe(DEFAULT_OPTIONS.timeLimitMs);
    expect(state.showTimer).toBe(DEFAULT_OPTIONS.showTimer);
    expect(state.mirrorX).toBe(DEFAULT_OPTIONS.mirrorX);
    expect(state.mirrorY).toBe(DEFAULT_OPTIONS.mirrorY);
    expect(state.letterSystem).toBe(DEFAULT_OPTIONS.letterSystem);
  });
});

describe('useGameOptions - setters', () => {
  test('setMode updates the mode', () => {
    useGameOptions.getState().setMode('time');
    expect(useGameOptions.getState().mode).toBe('time');
  });

  test('setCountTarget updates the count target', () => {
    useGameOptions.getState().setCountTarget(20);
    expect(useGameOptions.getState().countTarget).toBe(20);
  });

  test('setTimeLimit updates the time limit', () => {
    useGameOptions.getState().setTimeLimit(30_000);
    expect(useGameOptions.getState().timeLimitMs).toBe(30_000);
  });

  test('setShowTimer toggles the timer flag', () => {
    useGameOptions.getState().setShowTimer(true);
    expect(useGameOptions.getState().showTimer).toBe(true);
  });

  test('setMirrorX toggles horizontal mirror', () => {
    useGameOptions.getState().setMirrorX(true);
    expect(useGameOptions.getState().mirrorX).toBe(true);
  });

  test('setMirrorY toggles vertical mirror', () => {
    useGameOptions.getState().setMirrorY(true);
    expect(useGameOptions.getState().mirrorY).toBe(true);
  });

  test('setLetterSystem changes the letter system', () => {
    useGameOptions.getState().setLetterSystem('kana');
    expect(useGameOptions.getState().letterSystem).toBe('kana');
  });
});

describe('useGameOptions - persistence', () => {
  test('should write changes to localStorage under the game-options key', () => {
    useGameOptions.getState().setLetterSystem('greek');

    const raw = localStorage.getItem('game-options');
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw as string);
    expect(parsed.state.letterSystem).toBe('greek');
  });
});
