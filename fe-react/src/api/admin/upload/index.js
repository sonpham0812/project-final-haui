import axiosClient from "../../axiosClient";

const upload = (file, endpoint) => {
  const formData = new FormData();
  formData.append("image", file);
  return axiosClient.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const adminUploadServices = {
  uploadImage:         (file) => upload(file, "/upload/image"),
  uploadProductImage:  (file) => upload(file, "/upload/product"),
  uploadCategoryImage: (file) => upload(file, "/upload/category"),
  uploadAvatar:        (file) => upload(file, "/upload/avatar"),
};
