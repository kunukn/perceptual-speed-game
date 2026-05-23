import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_OPTIONS,
  type GameMode,
  type GameOptions,
  type LetterSystem,
} from '@/features/game/machine';

type GameOptionsStore = GameOptions & {
  setMode: (mode: GameMode) => void;
  setCountTarget: (value: number) => void;
  setTimeLimit: (value: number) => void;
  setShowTimer: (value: boolean) => void;
  setMirrorX: (value: boolean) => void;
  setMirrorY: (value: boolean) => void;
  setLetterSystem: (value: LetterSystem) => void;
};

export const useGameOptions = create<GameOptionsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_OPTIONS,
      setMode: (mode) => set({ mode }),
      setCountTarget: (countTarget) => set({ countTarget }),
      setTimeLimit: (timeLimitMs) => set({ timeLimitMs }),
      setShowTimer: (showTimer) => set({ showTimer }),
      setMirrorX: (mirrorX) => set({ mirrorX }),
      setMirrorY: (mirrorY) => set({ mirrorY }),
      setLetterSystem: (letterSystem) => set({ letterSystem }),
    }),
    { name: 'game-options' },
  ),
);
