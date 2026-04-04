import { adminDashboardServices } from "./dashboard";
import { adminProductServices } from "./products";
import { adminCategoryServices } from "./categories";
import { adminOrderServices } from "./orders";
import { adminUserServices } from "./users";

export const adminServices = {
  dashboard: adminDashboardServices,
  products: adminProductServices,
  categories: adminCategoryServices,
  orders: adminOrderServices,
  users: adminUserServices,
};
