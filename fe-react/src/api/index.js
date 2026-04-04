// Public APIs (no auth required)
export { publicServices } from "./public";
export { publicAuthServices } from "./public/auth";
export { publicCategoryServices } from "./public/categories";
export { publicProductServices } from "./public/products";

// User APIs (need auth - USER role)
export { userServices } from "./user";
export { userCartServices } from "./user/cart";
export { userOrderServices } from "./user/orders";
export { userUploadServices } from "./admin/upload";

// Admin APIs (need auth - ADMIN role)
export { adminServices } from "./admin";
export { adminDashboardServices } from "./admin/dashboard";
export { adminProductServices } from "./admin/products";
export { adminCategoryServices } from "./admin/categories";
export { adminOrderServices } from "./admin/orders";
export { adminUserServices } from "./admin/users";
