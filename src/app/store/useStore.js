import create from "zustand";
export const usePost = create((set) => ({
  postContent: "",
  setPostContent: (value) => set(() => ({ postContent: value })),
}));
export const useUser = create((set) => ({
  user: "",
  setUser: (value) => set(() => ({ user: value })),
}));
export const useUserName = create((set) => ({
  userName: "",
  setUserName: (value) => set(() => ({ userName: value })),
}));
export const useUserAvatarUrl = create((set) => ({
  userAvatar: "",
  setUserAvatar: (value) => set(() => ({ userAvatar: value })),
}));
