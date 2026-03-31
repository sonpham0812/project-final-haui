// hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const useAuth = () => {
  const { user } = useContext(AuthContext);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
  };
};

export default useAuth;