import api from "../lib/api.js";

export function useUpload() {
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/uploads", formData);
    return data;
  };

  return { uploadFile };
}
