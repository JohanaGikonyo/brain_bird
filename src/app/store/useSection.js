import { create } from "zustand";
export const useSelected = create((set) => ({
  selectedItem: "",
  setSelectedItem: (value) => set(() => ({ selectedItem: value })),
  email: null,
  setEmail: (email) => set({ email }),
}));
