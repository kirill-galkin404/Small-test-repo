import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/style.css';
import App from './App';
import { API_URL } from './config';

// Expose the configured backend URL (also keeps the build-time value in the bundle).
document.documentElement.dataset.apiUrl = API_URL;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
