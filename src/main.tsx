import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter, redirect } from 'react-router';
import App from './app';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        loader: () => redirect('upload'),
      },
      {
        path: 'upload',
        lazy: () => import('@/components/pages/upload-page'),
      },
      {
        path: 'connect',
        lazy: () => import('@/components/pages/connect-page'),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
