import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ChurchDataProvider } from './contexts/ChurchDataContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <ChurchDataProvider>
          <App />
        </ChurchDataProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
