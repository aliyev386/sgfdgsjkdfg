import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter, createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n";
import { StrictMode } from "react";
import HomePage from "./pages/public/HomePage.jsx";
import CategoryPage from "./pages/public/CategoryPage.jsx";
import CollectionDetailPage from "./pages/public/CollectionDetailPage.jsx";
import CollectionsPage from "./pages/public/CategoryPage.jsx";

const router=createBrowserRouter([{
  element:<HomePage/>,
  path:'/',
  children:[{

  }],
},
{
  element:<CollectionsPage/>,
  path:'/collections',
  children:[{}]
},
{
  element:<CollectionDetailPage/>,
  path:'/detail',
  children:[{}]
}])

ReactDOM.createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);