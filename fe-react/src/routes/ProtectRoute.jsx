// routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children, role, roles }) => {
  const { isAuthenticated, hasRole } = useAuth();

  // Nếu chưa đăng nhập, chuyển hướng đến login
  if (!isAuthenticated) return <Navigate to="/login" />;

  // Kiểm tra role (hỗ trợ cả role đơn lẻ và mảng roles)
  const requiredRoles = roles || (role ? [role] : null);
  
  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;