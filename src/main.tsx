import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { RouterProvider } from 'react-router-dom';

import { router } from './router/index.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <RouterProvider router={router} />
  </ErrorBoundary>
)
