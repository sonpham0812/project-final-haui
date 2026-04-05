// routes/routes.js
import Home from "../pages/user/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminDashboard from "../pages/admin/Dashboard";
import NotFound from "../pages/NotFound";
import CartPage from "../pages/user/cart";
import AddProduct from "../pages/admin/products/AddProduct";
import ProductList from "../pages/admin/products/ProductList";
import ProductDetail from "../pages/admin/products/productDetails";

const routers = [
  { path: "/home", component: Home, layout: "user" },
  { path: "/login", component: Login, layout: "auth" },
  { path: "/register", component: Register, layout: "auth" },
  { path: "/cart", component: CartPage, private: true, layout: "user" },
  {
    path: "/admin",
    component: AdminDashboard,
    private: true,
    role: "ADMIN",
    layout: "admin",
  },
  {
    path: "/add-product",
    component: AddProduct,
    private: true,
    role: "ADMIN",
    layout: "admin"
  },
   {
    path: "/edit-product/:id",
    component: AddProduct,
    private: true,
    role: "ADMIN",
    layout: "admin"
  },
  {
    path: "/product-list",
    component: ProductList,
    private: true,
    role: "ADMIN",
    layout: "admin"
  },
  {
    path: "/product-details/:id",
    component: ProductDetail,
    private: true,
    role: "ADMIN",
    layout: "admin"
  },
  { path: "*", component: NotFound },
];

export default routers;
