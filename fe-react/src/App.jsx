import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthProvider";
import CartProvider from "./context/CartProvider";
import "./App.scss";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
