import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Home from './pages/Home';
import Inbox from './pages/Inbox';
import Today from './pages/Today';
import Project from './pages/Project';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'inbox', element: <Inbox /> },
      { path: 'today', element: <Today /> },
      { path: 'project/:projectId', element: <Project /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
