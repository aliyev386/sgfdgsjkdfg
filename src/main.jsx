import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
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
import { useSelector } from "react-redux";
import { selectUser } from "./store/slices/authSlice";

// Admin isə /admin-ə yönləndir, deyilsə normal render et
function UserOnly({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (user?.role === "Admin") return <Navigate to="/admin" replace />;
  return children;
}

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <UserOnly><HomePage /></UserOnly> },
      { path: "/categories", element: <UserOnly><CategoryPage /></UserOnly> },
      { path: "/collections", element: <UserOnly><RoomsPage /></UserOnly> },
      { path: "/category", element: <UserOnly><FurnitureCategoryPage /></UserOnly> },
      { path: "/category/:id", element: <UserOnly><FurnitureCategoryPage /></UserOnly> },
      { path: "/cart", element: <UserOnly><CartPage /></UserOnly> },
      { path: "/room-collections", element: <UserOnly><RoomCollectionsPage /></UserOnly> },
      { path: "/room-collections/:categoryId", element: <UserOnly><RoomCollectionsPage /></UserOnly> },
      { path: "/collection-detail", element: <UserOnly><CollectionDetailPage /></UserOnly> },
      { path: "/collection-detail/:id", element: <UserOnly><CollectionDetailPage /></UserOnly> },
      { path: "/details/:id", element: <UserOnly><ProductDetailPage /></UserOnly> },
      { path: "/campaigns", element: <UserOnly><CampaignsPage /></UserOnly> },
      { path: "/login", element: <UserOnly><LoginPage /></UserOnly> },
      { path: "/register", element: <UserOnly><RegisterPage /></UserOnly> },
      { path: "/forgot-password", element: <UserOnly><ForgotPasswordPage /></UserOnly> },
      { path: "/reset-password", element: <UserOnly><ResetPasswordPage /></UserOnly> },
      { path: "/about", element: <UserOnly><AboutPage /></UserOnly> },
      { path: "/contact", element: <UserOnly><ContactPage /></UserOnly> },
      { path: "/*", element: <NotFoundPage /> },
      {
        path: "/profile",
        element: <UserOnly><ProtectedRoute><ProfilePage /></ProtectedRoute></UserOnly>,
      },
      {
        path: "/checkout",
        element: <UserOnly><ProtectedRoute><CheckoutPage /></ProtectedRoute></UserOnly>,
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
