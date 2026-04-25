import { create } from 'zustand';

interface AppState {
  /** Global loading overlay (e.g. for auth checks). */
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
