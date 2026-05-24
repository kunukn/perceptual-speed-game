import { RouterProvider } from 'react-router';
import { router } from './router';

export default function App() {
  return (
    <div id="app" className="flex flex-col items-center justify-center-safe">
      <RouterProvider router={router} />
    </div>
  );
}
