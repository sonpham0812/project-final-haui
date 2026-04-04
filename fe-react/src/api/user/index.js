import { userCartServices } from "./cart";
import { userOrderServices } from "./orders";
import { userUploadServices } from "../admin/upload";

export const userServices = {
  cart: userCartServices,
  orders: userOrderServices,
  upload: userUploadServices,
};
