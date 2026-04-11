import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./i18n";
import { StrictMode } from "react";
import App from "./App.jsx";
import HomePage from "./pages/public/HomePage.jsx";
import AdminPanel from "./pages/admin/AdminPage.jsx";
import "./index.css";
import "./App.css";
import CategoryPage from "./pages/public/CategoryPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import FurnitureCategoryPage from "./pages/public/FurnitureCategoryPage.jsx";
import CartPage from "./pages/public/CartPage.jsx";
import ProductDetailPage from "./pages/public/ProductDetailPage.jsx";
import RoomsPage from "./pages/public/RoomsPage.jsx";
import RoomCollectionsPage from "./pages/public/RoomCollectionsPage.jsx";
import CollectionDetailPage from "./pages/public/CollectionDetailPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import CheckoutPage from "./pages/order/CheckoutPage.jsx";
import ProtectedRoute from "./components/common/ProdtectedRoute.jsx";
import ResetPasswordPage from "./pages/auth/RePasswordPage.jsx";
import CampaignsPage from "./pages/public/CampaignsPage.jsx";
import ContactPage from "./pages/common/Contact.jsx";
import NotFoundPage from "./pages/common/NotFound.jsx";
import AboutPage from "./pages/common/About.jsx";
const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/",element: <HomePage /> },
      { path: "/categories",element: <CategoryPage /> },
      { path: "/collections",element: <RoomsPage /> },
      { path: "/category",element: <FurnitureCategoryPage /> },
      { path: "/category/:id",element: <FurnitureCategoryPage /> },
      { path: "/cart",element: <CartPage /> },
      { path: "/room-collections",element: <RoomCollectionsPage /> },
      { path: "/room-collections/:categoryId", element: <RoomCollectionsPage /> },
      { path: "/collection-detail",element: <CollectionDetailPage /> },
      { path: "/collection-detail/:id",element: <CollectionDetailPage /> },
      { path: "/details",element: <ProductDetailPage /> },
      { path: "/details/:id",element: <ProductDetailPage /> },
      { path: "/campaigns",element: <CampaignsPage /> },
      { path: "/login",element: <LoginPage /> },
      { path: "/register",element: <RegisterPage /> },
      { path: "/forgot-password",element: <ForgotPasswordPage /> },
      { path: "/reset-password",element: <ResetPasswordPage /> },
      { path: "/about",element: <AboutPage /> },
      { path: "/contact",element: <ContactPage /> },
      { path: "/*",element:<NotFoundPage />},
      {
        path: "/profile",
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: "/checkout",
        element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>,
      },

      {
        path: "/admin",
        element: <ProtectedRoute requiredRole="Admin"><AdminPanel /></ProtectedRoute>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);