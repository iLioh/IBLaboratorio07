import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Audit } from './pages/Audit';
import { Dashboard } from './pages/Dashboard';
import { Releases } from './pages/Releases';
import { Risk } from './pages/Risk';
import { Services } from './pages/Services';
import { Transactions } from './pages/Transactions';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'risk', element: <Risk /> },
      { path: 'services', element: <Services /> },
      { path: 'releases', element: <Releases /> },
      { path: 'audit', element: <Audit /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
