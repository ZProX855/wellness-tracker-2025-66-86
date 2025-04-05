
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set initial zoom level to 75%
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.zoom = '75%';
});

createRoot(document.getElementById("root")!).render(<App />);
