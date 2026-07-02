import { useQuery } from "@tanstack/react-query";
import api from "../lib/api.js";

export function useLetters() {
  return useQuery({
    queryKey: ["letters"],
    queryFn: async () => {
      const { data } = await api.get("/letters");
      return data;
    }
  });
}
