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
    element: <AdminPanel />,
    path: '/admin',
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
