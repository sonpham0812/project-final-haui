import AddProduct from "../pages/Products/AddProduct";
import ProductDetails from "../pages/Products/ProductDetails";
import ProductList from "../pages/Products/ProductList";

const routers = [
  { path: "/add-product", component: AddProduct },
  { path: "/product-list", component: ProductList },
  { path: "/product-details/:id", component: ProductDetails },
  { path: "/edit-product/:id", component: AddProduct },
];
export default routers;
