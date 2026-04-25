import ReactDOM from "react-dom/client";
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",background:"#F7F3EE",padding:40}}>
        <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
        <h2 style={{fontSize:22,color:"#1C1C1C",marginBottom:8}}>Xəta baş verdi</h2>
        <p style={{fontSize:14,color:"#6B6B6B",marginBottom:24,textAlign:"center",maxWidth:400}}>{this.state.error?.message || "Gözlənilməz xəta"}</p>
        <button onClick={()=>window.location.href="/"} style={{padding:"12px 28px",background:"#1C1C1C",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontSize:14}}>Ana səhifəyə qayıt</button>
      </div>
    );
    return this.props.children;
  }
}

function RouteError() {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",background:"#F7F3EE",padding:40}}>
      <div style={{fontSize:48,marginBottom:16}}>🛋️</div>
      <h2 style={{fontSize:22,color:"#1C1C1C",marginBottom:8}}>Səhifə tapılmadı</h2>
      <p style={{fontSize:14,color:"#6B6B6B",marginBottom:24}}>Bu səhifə mövcud deyil və ya silinib.</p>
      <button onClick={()=>window.location.href="/"} style={{padding:"12px 28px",background:"#1C1C1C",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontSize:14}}>Ana səhifəyə qayıt</button>
    </div>
  );
}
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

function UserOnly({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (user?.role === "Admin") return <Navigate to="/admin" replace />;
  return children;
}

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteError />,
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
      { path: "/shop", element: <UserOnly><CampaignsPage /></UserOnly> },
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
    <ErrorBoundary>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);