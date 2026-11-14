import { ViteReactSSG } from 'vite-react-ssg'
import './index.css'
import { routes } from './routes'

// The site is served under a base path, so the router shares that basename.
// Vite's BASE_URL is the value vite-react-ssg expects.
export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL })
