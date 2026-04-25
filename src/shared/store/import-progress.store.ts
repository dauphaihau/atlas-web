import { create } from 'zustand';

export interface ActiveImport {
  id: number
  fileName: string
  fileSize: number
}

interface ImportProgressState {
  activeImport: ActiveImport | null
  setActiveImport: (payload: ActiveImport) => void
  clearActiveImport: () => void
  /** When true, layout should hide ImportProgressCard (e.g. dialog is open and import in progress). */
  hideProgressCardInLayout: boolean
  setHideProgressCardInLayout: (value: boolean) => void
}

export const useImportProgressStore = create<ImportProgressState>((set) => ({
  activeImport: null,
  setActiveImport: (payload) => set({ activeImport: payload }),
  clearActiveImport: () => set({ activeImport: null }),
  hideProgressCardInLayout: false,
  setHideProgressCardInLayout: (value) => set({ hideProgressCardInLayout: value }),
}));
