import axiosClient from "../../axiosClient";

export const adminUploadServices = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return axiosClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
