import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CafeStatusProvider } from './context/CafeStatusContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CafeStatusProvider>
      <App />
    </CafeStatusProvider>
  </StrictMode>,
);
