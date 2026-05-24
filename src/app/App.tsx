import { RouterProvider } from 'react-router';
import { router } from './router';

export default function App() {
  return (
    <div
      id="app"
      className="flex flex-1 flex-col items-center md:justify-center-safe"
    >
      <RouterProvider router={router} />
    </div>
  );
}
