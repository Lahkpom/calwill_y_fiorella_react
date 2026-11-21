import { createBrowserRouter } from 'react-router-dom';

import Layout from '../components/layout/Layout.jsx';

import Home from '../pages/Home.jsx';
import ProductsContainer from '../pages/ProductsContainer.jsx';
import ProductDetails from '../pages/ProductDetails';
import ContactContainer from '../pages/ContactContainer.jsx';
import Payment_Shipping from '../pages/Payment_Shipping.jsx';

import Login from '../pages/login/Login';
import Signup from '../pages/login/Signup';

import Error404 from '../pages/errors/Error404.jsx';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../components/admin/AdminLayout';
import AdminHome from '../pages/admin/AdminHome';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminVariants from '../pages/admin/AdminVariants';
import AdminColors from '../pages/admin/AdminColors';

import Cart from '../pages/user/Cart';
import Checkout from '../pages/Checkout';
import MyAccountPage from '../pages/user/MyAccount.jsx';
import MyOrdersPage from '../pages/user/MyOrdersPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <Error404 />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'productos',
        element: <ProductsContainer />,
      },
      {
        path: 'productos/:id_product',
        element: <ProductDetails />,
      },
      {
        path: 'pagos_envios',
        element: <Payment_Shipping />,
      },
      {
        path: 'contacto',
        element: <ContactContainer />,
      },
      {
        path: 'iniciar_sesion',
        element: <Login />,
      },
      {
        path: 'registrarse',
        element: <Signup />,
      },
      {
        path: 'carrito',
        element: <Cart />,
      },
      {
        path: 'checkout',
        element: <Checkout />,
      },
      {
        path: 'mi_cuenta',
        element: <ProtectedRoute><MyAccountPage /></ProtectedRoute>,
      },
      {
        path: 'mis_pedidos',
        element: <ProtectedRoute><MyOrdersPage /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute roles={['ADMIN', 'OPERATOR']}><AdminLayout /></ProtectedRoute>,
    errorElement: <Error404 />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: 'productos', element: <AdminProducts /> },
      { path: 'variantes', element: <AdminVariants /> },
      { path: 'colores', element: <AdminColors /> },
    ],
  },
]);

export default router;
