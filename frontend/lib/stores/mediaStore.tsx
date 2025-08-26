import { create } from "zustand";

interface MediaState {
  liked: boolean;
  setLiked: (liked: boolean) => void;
  consumed: boolean;
  setConsumed: (consumed: boolean) => void;
  watchlist: boolean;
  setWatchlist: (watchlist: boolean) => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  liked: false,
  setLiked: (liked) => set({ liked }),
  consumed: false,
  setConsumed: (consumed) => set({ consumed }),
  watchlist: false,
  setWatchlist: (watchlist) => set({ watchlist }),
}));

// Optionally, set initial values dynamically
export const initializeMediaStore = (initial: Partial<MediaState>) => {
  const store = useMediaStore.getState();
  if (initial.liked !== undefined) store.setLiked(initial.liked);
  if (initial.consumed !== undefined) store.setConsumed(initial.consumed);
  if (initial.watchlist !== undefined) store.setWatchlist(initial.watchlist);
};