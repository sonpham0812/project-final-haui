// Public APIs (no auth required)
export { publicAuthServices } from "./public/auth";
export { publicCategoryServices } from "./public/categories";
export { publicProductServices } from "./public/products";

// User APIs (need auth - USER role)
export { userCartServices } from "./user/cart";
export { userOrderServices } from "./user/orders";

// Admin APIs (need auth - ADMIN role)
export { adminDashboardServices } from "./admin/dashboard";
export { adminProductServices } from "./admin/products";
export { adminCategoryServices } from "./admin/categories";
export { adminOrderServices } from "./admin/orders";
export { adminUserServices } from "./admin/users";
export { adminUploadServices } from "./admin/upload";
