import { HashRouter, Route, Routes } from 'react-router';
import { GameIntro } from '@/components/game/GameIntro';
import { GameLeaderboard } from '@/components/game/GameLeaderboard';
import { GameMachineProvider } from '@/components/game/GameMachineContext';
import { GameOptions } from '@/components/game/GameOptions';
import { GamePlay } from '@/components/game/GamePlay';
import { GameResults } from '@/components/game/GameResults';
import { GameReview } from '@/components/game/GameReview';
import { NotFound } from '@/components/game/NotFound';

export default function App() {
  return (
    <div className="flex h-dvh flex-col items-center md:justify-center">
      <HashRouter>
        <GameMachineProvider>
          <Routes>
            <Route path="/" element={<GameIntro />} />
            <Route path="/options" element={<GameOptions />} />
            <Route path="/leaderboard" element={<GameLeaderboard />} />
            <Route path="/play" element={<GamePlay />} />
            <Route path="/results" element={<GameResults />} />
            <Route path="/review" element={<GameReview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GameMachineProvider>
      </HashRouter>
    </div>
  );
}
