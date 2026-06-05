import { GameMachineProvider } from '@/features/game/machine-context'
import { gameRoutes } from '@/features/game/routes'
import { createHashRouter, Outlet } from 'react-router'

/* Pathless Layout Route pattern (React Router): the outer route has no `path`,
 * only an `element` + `children`, so it wraps the tree with shared providers
 * without matching a URL segment. Children render through `<Outlet />`, which
 * keeps providers *inside* the router — so `useNavigate()` works in the
 * provider's state→route effect. Each feature contributes its own route
 * module via the children spread (feature-sliced routes) — one line per
 * feature at scale. */
export const router = createHashRouter([
  {
    element: (
      <GameMachineProvider>
        <Outlet />
      </GameMachineProvider>
    ),
    children: [...gameRoutes],
  },
])
