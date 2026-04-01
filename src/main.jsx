import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import "./i18n";
import "./index.css";
import "./App.css";
import HomePage            from "./pages/public/HomePage.jsx";
import CategoryPage        from "./pages/public/CategoryPage.jsx";
import FurnitureCategoryPage from "./pages/public/FurnitureCategoryPage.jsx";
import ProductDetailPage   from "./pages/public/ProductDetailPage.jsx";
import RoomsPage           from "./pages/public/RoomsPage.jsx";
import RoomCollectionsPage from "./pages/public/RoomCollectionsPage.jsx";
import CollectionDetailPage from "./pages/public/CollectionDetailPage.jsx";
import LoginPage          from "./pages/auth/LoginPage.jsx";
import RegisterPage       from "./pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import AdminPanel  from "./pages/admin/AdminPage.jsx";
import AboutPage from "./pages/common/About.jsx";
import ContactPage from "./pages/common/Contact.jsx";
import NotFoundPage from "./pages/common/NotFound.jsx";
import { store } from "./store/store"; 
import { Provider } from "react-redux";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/categories",
    element: <CategoryPage />,
  },
  {
    path: "/furnitures",
    element: <CategoryPage />,
  },
  {
    path: "/category/:slug",
    element: <FurnitureCategoryPage />,
  },
  {
    // legacy – no slug version still works
    path: "/category",
    element: <FurnitureCategoryPage />,
  },
  {
    path: "/product/:id",
    element: <ProductDetailPage />,
  },
  {
    // legacy – query-param based detail page
    path: "/details",
    element: <ProductDetailPage />,
  },
  {
    path: "/collections",
    element: <RoomsPage />,
  },
  {
    path: "/collections/:slug",
    element: <RoomCollectionsPage />,
  },
  {
    // legacy
    path: "/room-collections",
    element: <RoomCollectionsPage />,
  },
  {
    path: "/collection/:id",
    element: <CollectionDetailPage />,
  },
  {
    // legacy
    path: "/collection-detail",
    element: <CollectionDetailPage />,
  },

  // ── Common ───────────────────────────────────────────
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },

  // ── Auth ─────────────────────────────────────────────
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },

  // ── Protected ────────────────────────────────────────
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/admin",
    element: <AdminPanel />,
  },

  // ── 404 Fallback ─────────────────────────────────────
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
