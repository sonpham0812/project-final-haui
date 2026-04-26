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
import ProductDetailUser from "../pages/user/productDetails";
import CheckoutPage from "../pages/user/checkout";
import SearchPage from "../pages/user/searchProducts";
import ProfilePage from "../pages/user/profile";
import OrderDetailPage from "../pages/user/orderDetail";

const routers = [
  { path: "/home", component: Home, layout: "user" },
  { path: "/login", component: Login, layout: "auth" },
  { path: "/register", component: Register, layout: "auth" },
  { path: "/cart", component: CartPage, private: true, layout: "user" },
  { path: "/checkout", component: CheckoutPage, private: true },
  { path: "/search", component: SearchPage, layout: "user" },
  { path: "/profile", component: ProfilePage, private: true },
  { path: "/order/:id", component: OrderDetailPage, private: true },
  {
    path: "/product-details/:id",
    component: ProductDetailUser,
    layout: "user",
  },
  {
    path: "/admin/dashboard",
    component: AdminDashboard,
    private: true,
    role: "ADMIN",
    layout: "admin",
  },
  {
    path: "/admin/add-product",
    component: AddProduct,
    private: true,
    role: "ADMIN",
    layout: "admin",
  },
  {
    path: "/admin/edit-product/:id",
    component: AddProduct,
    private: true,
    role: "ADMIN",
    layout: "admin",
  },
  {
    path: "/admin/product-list",
    component: ProductList,
    private: true,
    role: "ADMIN",
    layout: "admin",
  },
  {
    path: "/admin/product-details/:id",
    component: ProductDetail,
    private: true,
    role: "ADMIN",
    layout: "admin",
  },
  { path: "*", component: NotFound },
];

export default routers;
