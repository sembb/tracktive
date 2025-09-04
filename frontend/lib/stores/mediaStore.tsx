import { create } from "zustand";

interface MediaState {
  liked: boolean;
  setLiked: (liked: boolean) => void;
  consumed: boolean;
  setConsumed: (consumed: boolean) => void;
  wishlist: boolean;
  setWishlist: (wishlist: boolean) => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  liked: false,
  setLiked: (liked) => set({ liked }),
  consumed: false,
  setConsumed: (consumed) => set({ consumed }),
  wishlist: false,
  setWishlist: (wishlist) => set({ wishlist }),
}));

// Optionally, set initial values dynamically
export const initializeMediaStore = (initial: Partial<MediaState>) => {
  const store = useMediaStore.getState();
  if (initial.liked !== undefined) store.setLiked(initial.liked);
  if (initial.consumed !== undefined) store.setConsumed(initial.consumed);
  if (initial.wishlist !== undefined) store.setWishlist(initial.wishlist);
};