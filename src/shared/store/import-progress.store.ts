import { create } from "zustand"

export interface ActiveImport {
  id: number
  fileName: string
  fileSize: number
}

interface ImportProgressState {
  activeImport: ActiveImport | null
  setActiveImport: (payload: ActiveImport) => void
  clearActiveImport: () => void
}

export const useImportProgressStore = create<ImportProgressState>((set) => ({
  activeImport: null,
  setActiveImport: (payload) => set({ activeImport: payload }),
  clearActiveImport: () => set({ activeImport: null }),
}))
