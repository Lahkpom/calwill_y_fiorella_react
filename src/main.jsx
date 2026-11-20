import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { MainDataProvider } from './contexts/MainDataContext.jsx';
import { CartProvider } from './contexts/CartContext';
import router from './router/Router';
import './index.scss';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainDataProvider>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </MainDataProvider>
  </StrictMode>
);