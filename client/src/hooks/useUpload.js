import { useMutation } from "@tanstack/react-query";
import api from "../lib/api.js";

/**
 * Uploads a single file (photo / voice note / attachment) and returns the
 * created Attachment doc. Reports progress via the optional onProgress arg.
 */
export function useUpload() {
  return useMutation({
    mutationFn: async ({ file, onProgress }) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      return data.attachment;
    }
  });
}
