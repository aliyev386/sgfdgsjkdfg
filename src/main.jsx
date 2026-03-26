import ReactDOM from "react-dom/client";
import {  createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n";
import { StrictMode } from "react";
import HomePage from "./pages/public/HomePage.jsx";
import AdminPanel from "./pages/admin/AdminPage.jsx";
import './index.css'
import './App.css'
import CategoryPage from "./pages/public/CategoryPage.jsx";
import CategoriesPage from "./pages/public/CategoryPage.jsx";

const router=createBrowserRouter([{
  element:<HomePage/>,
  path:'/',
  children:[{

  }],
},
{
  element:<CategoriesPage/>,
  path:'/categories',
  children:[{}]
},
// {
//   element:<CollectionDetailPage/>,
//   path:'/detail',
//   children:[{}]
// },
{
  element:<CategoryPage/>,
  path:'/furnitures',
  children:[{}]
},
// {
//   element:<ProductDetailPage/>,
//   path: "/products/:slug",
//   children:[{}]
// },
{
  element:<AdminPanel/>,
  path: "/admin",
  children:[{}]
},
])


ReactDOM.createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);