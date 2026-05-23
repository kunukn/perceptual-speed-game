import { createHashRouter, Outlet } from 'react-router';
import { GameMachineProvider } from '@/features/game/machine-context';
import { gameRoutes } from '@/features/game/routes';

/* Root layout route hosts cross-cutting providers (machine today; future: auth,
 * theme, telemetry). It renders inside the router so `useNavigate()` works in
 * the provider's state→route effect. Each feature contributes routes via the
 * children spread — one line per feature at scale. */
export const router = createHashRouter([
  {
    element: (
      <GameMachineProvider>
        <Outlet />
      </GameMachineProvider>
    ),
    children: [...gameRoutes],
  },
]);
