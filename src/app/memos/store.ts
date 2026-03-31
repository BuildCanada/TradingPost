import { create } from "zustand";

interface MemosFilterState {
  search: string;
  setSearch: (search: string) => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  visibleCount: number;
  loadMore: () => void;
  reset: () => void;
}

export const useMemosFilter = create<MemosFilterState>((set) => ({
  search: "",
  setSearch: (search) => set({ search }),
  activeCategory: null,
  setActiveCategory: (category) => set({ activeCategory: category }),
  visibleCount: 10,
  loadMore: () =>
    set((state) => ({ visibleCount: state.visibleCount + 10 })),
  reset: () =>
    set({ search: "", activeCategory: null, visibleCount: 10 }),
}));
