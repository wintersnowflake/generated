import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';

// Ensure process.env.API_KEY exists for Gemini API initialization
// This is a placeholder to ensure the object path exists.
// The actual API key is expected to be set in the environment.
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
} else if (typeof process.env === 'undefined') {
  process.env = {};
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);