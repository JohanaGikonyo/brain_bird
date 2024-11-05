import create from "zustand";
export const usePost = create((set) => ({
  postContent: "",
  setPostContent: (value) => set(() => ({ postContent: value })),
}));
export const useUser = create((set) => ({
  user: "",
  setUser: (value) => set(() => ({ user: value })),
}));
