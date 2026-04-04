import { publicAuthServices } from "./auth";
import { publicCategoryServices } from "./categories";
import { publicProductServices } from "./products";

export const publicServices = {
  auth: publicAuthServices,
  categories: publicCategoryServices,
  products: publicProductServices,
};
