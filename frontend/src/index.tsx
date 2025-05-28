import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppMain from './AppMain';   // ← updated import

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppMain />                   // ← updated component
  </React.StrictMode>
);

