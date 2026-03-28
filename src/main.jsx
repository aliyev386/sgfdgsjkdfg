import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n";
import { StrictMode } from "react";
import HomePage from "./pages/public/HomePage.jsx";
import AdminPanel from "./pages/admin/AdminPage.jsx";
import './index.css';
import './App.css';
import CategoryPage from "./pages/public/CategoryPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import FurnitureCategoryPage from "./pages/public/FurnitureCategoryPage.jsx";
import CartDrawer from "./components/cart/CartDrawer.jsx";
import ProductDetailPage from "./pages/public/ProductDetailPage.jsx";
import RoomsPage from "./pages/public/RoomsPage.jsx";
import RoomCollectionsPage from "./pages/public/RoomCollectionsPage.jsx";
import CollectionDetailPage from "./pages/public/CollectionDetailPage.jsx";
import AboutPage from "./pages/Common/AboutPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";

const router = createBrowserRouter([
  {
    element: <HomePage />,
    path: '/',
  },
  {
    element: <CategoryPage />,
    path: '/categories',
  },
  {
    element: <CategoryPage />,
    path: '/furnitures',
  },
    {
    element: <AboutPage />,
    path: '/about',
  },
  {
    element: <AdminPanel />,
    path: '/admin',
  },
    {
    element: <ProfilePage />,
    path: '/profile',
  },
  {
    element:<FurnitureCategoryPage/>,
    path:"/category"
  },
  {
    element:<CartDrawer/>,
    path:"/cart"
  },
  {
    element:<RoomsPage/>,
    path:"/collections"
  },
  {
    element:<RoomCollectionsPage/>,
    path:"/room-collections"
  },
  {
    element:<CollectionDetailPage/>,
    path:"/collection-detail"
  },
  {
    element:<ProductDetailPage/>,
    path:"/details"
  },
  // ── Auth Routes ──────────────────────────
  {
    element: <LoginPage />,
    path: '/login',
  },
  {
    element: <RegisterPage />,
    path: '/register',
  },
  {
    element: <ForgotPasswordPage />,
    path: '/forgot-password',
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
