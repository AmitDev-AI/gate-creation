import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { RouteError } from './RouteError';
import { HomePage } from '../features/home/HomePage';
import { SetupPage } from '../features/setup/SetupPage';
import { SubjectsPage } from '../features/subjects/SubjectsPage';
import { SubjectDetailPage } from '../features/subjects/SubjectDetailPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { NotFoundPage } from '../features/not-found/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'setup', element: <SetupPage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'subjects/:subjectId', element: <SubjectDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
