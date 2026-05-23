import { RouterProvider } from 'react-router';
import { router } from './router';

export default function App() {
  return (
    <div className="flex h-dvh flex-col items-center md:justify-center">
      <RouterProvider router={router} />
    </div>
  );
}
