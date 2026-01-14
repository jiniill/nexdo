import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Home from './pages/Home';
import Inbox from './pages/Inbox';
import Today from './pages/Today';
import Project from './pages/Project';
import Urgent from './pages/Urgent';
import Assigned from './pages/Assigned';
import Overdue from './pages/Overdue';
import Trash from './pages/Trash';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'inbox', element: <Inbox /> },
      { path: 'today', element: <Today /> },
      { path: 'urgent', element: <Urgent /> },
      { path: 'assigned', element: <Assigned /> },
      { path: 'overdue', element: <Overdue /> },
      { path: 'trash', element: <Trash /> },
      { path: 'reports', element: <Reports /> },
      { path: 'project/:projectId', element: <Project /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
