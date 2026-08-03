import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { resolveBaseURL } from './config/api';
import { initNative } from './native';
import './index.css';

// Web production is same-origin and dev goes through the Vite proxy, so this
// resolves to '' there. Native builds get an absolute URL.
const baseURL = resolveBaseURL();
if (baseURL) axios.defaults.baseURL = baseURL;

initNative();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
