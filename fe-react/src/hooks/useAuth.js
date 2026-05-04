// hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  hasRole,
  isAdmin,
  isRegularUser,
  getUserId,
  getUserEmail,
  getUserRole,
} from "../utils";

const useAuth = () => {
  const { user, logout, login } = useContext(AuthContext);

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    isRegularUser: isRegularUser(),
    userRole: getUserRole(),
    userId: getUserId(),
    userEmail: getUserEmail(),
    // Hàm kiểm tra role động
    hasRole: (role) => hasRole(role),
  };
};

export default useAuth;
