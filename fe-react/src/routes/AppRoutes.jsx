// routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import routers from "./routes";

import ProtectedRoute from "./ProtectRoute";
import AdminLayout from "../layouts/admin";
import UserLayout from "../layouts/user";
import AuthLayout from "../layouts/auth";

const getLayout = (layout, children) => {
  if (layout === "admin") return <AdminLayout>{children}</AdminLayout>;
  if (layout === "user") return <UserLayout>{children}</UserLayout>;
  if (layout === "auth") return <AuthLayout>{children}</AuthLayout>;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {routers.map((route, index) => {
        const Element = route.component;

        let element = <Element />;

        // bọc layout
        element = getLayout(route.layout, element);

        // bọc auth
        if (route.private || route.role) {
          element = (
            <ProtectedRoute role={route.role}>
              {element}
            </ProtectedRoute>
          );
        }

        return <Route key={index} path={route.path} element={element} />;
      })}
    </Routes>
  );
};

export default AppRoutes;