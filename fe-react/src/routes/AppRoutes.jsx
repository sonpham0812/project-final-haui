// routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import routers from "./routes";

import ProtectedRoute from "./ProtectRoute";
import AdminLayout from "../layouts/admin";
import UserLayout from "../layouts/user";
import UserAccountLayout from "../layouts/userAccount";
import AuthLayout from "../layouts/auth";
import useAuth from "../hooks/useAuth";

const getLayout = (layout, children) => {
  if (layout === "admin") return <AdminLayout>{children}</AdminLayout>;
  if (layout === "user") return <UserLayout>{children}</UserLayout>;
  if (layout === "auth") return <AuthLayout>{children}</AuthLayout>;
  if (layout === "userAccount")
    return (
      <UserLayout>
        <UserAccountLayout>{children}</UserAccountLayout>
      </UserLayout>
    );
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Redirect logic dựa trên authentication và role */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {routers.map((route, index) => {
        const Element = route.component;

        let element = <Element />;

        // bọc layout
        element = getLayout(route.layout, element);

        // bọc auth
        if (route.private || route.role) {
          element = (
            <ProtectedRoute role={route.role}>{element}</ProtectedRoute>
          );
        }

        return <Route key={index} path={route.path} element={element} />;
      })}
    </Routes>
  );
};

export default AppRoutes;
