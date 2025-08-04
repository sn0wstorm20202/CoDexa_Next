'use client'

import { create } from 'zustand';

interface UIState {
  isChatOpen: boolean;
  selectedPlan: string | null;
  isScrolled: boolean;
  setChatOpen: (open: boolean) => void;
  setSelectedPlan: (plan: string | null) => void;
  setScrolled: (scrolled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isChatOpen: false,
  selectedPlan: null,
  isScrolled: false,
  setChatOpen: (open) => set({ isChatOpen: open }),
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setScrolled: (scrolled) => set({ isScrolled: scrolled }),
}));