import create from "zustand";
export const usePost = create((set) => ({
  postContent: "",
  setPostContent: (value) => set(() => ({ postContent: value })),
}));
export const useUser = create((set) => ({
  user: "",
  setUser: (value) => set(() => ({ user: value })),
}));
export const useSearch = create((set) => ({
  search: "",
  setSearch: (value) => set(() => ({ search: value })),
}));
