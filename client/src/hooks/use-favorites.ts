import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertFavorite } from "@shared/schema";

export function useFavorites() {
  return useQuery({
    queryKey: [api.favorites.list.path],
    queryFn: async () => {
      const res = await fetch(api.favorites.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return api.favorites.list.responses[200].parse(await res.json());
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertFavorite) => {
      const res = await fetch(api.favorites.create.path, {
        method: api.favorites.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.favorites.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to add favorite");
      }
      return api.favorites.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] }),
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.favorites.delete.path, { id });
      const res = await fetch(url, {
        method: api.favorites.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove favorite");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] }),
  });
}
