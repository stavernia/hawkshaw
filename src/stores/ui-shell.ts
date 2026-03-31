import { create } from "zustand";

type UiShellStore = {
  activeArea: "marketing" | "player" | "host";
  setActiveArea: (area: UiShellStore["activeArea"]) => void;
};

export const useUiShellStore = create<UiShellStore>((set) => ({
  activeArea: "marketing",
  setActiveArea: (activeArea) => set({ activeArea }),
}));

