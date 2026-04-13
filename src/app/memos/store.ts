import { create } from "zustand";

interface MemosFilterState {
  search: string;
  setSearch: (search: string) => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  reset: () => void;
}

export const useMemosFilter = create<MemosFilterState>((set) => ({
  search: "",
  setSearch: (search) => set({ search }),
  activeCategory: null,
  setActiveCategory: (category) => set({ activeCategory: category }),
  reset: () =>
    set({ search: "", activeCategory: null }),
}));
