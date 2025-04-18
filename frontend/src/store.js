import { create } from 'zustand';

const useStore = create((set) => ({
  // UI State
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  // Event State
  currentEvent: null,
  setCurrentEvent: (event) => set({ currentEvent: event }),

  // Network State
  currentNetwork: null,
  setCurrentNetwork: (network) => set({ currentNetwork: network }),

  // Undo/Redo State
  history: [],
  historyIndex: -1,
  addToHistory: (state) => set((store) => ({
    history: [...store.history.slice(0, store.historyIndex + 1), state],
    historyIndex: store.historyIndex + 1,
  })),
  undo: () => set((store) => {
    if (store.historyIndex > 0) {
      return {
        historyIndex: store.historyIndex - 1,
        currentEvent: store.history[store.historyIndex - 1],
      };
    }
    return {};
  }),
  redo: () => set((store) => {
    if (store.historyIndex < store.history.length - 1) {
      return {
        historyIndex: store.historyIndex + 1,
        currentEvent: store.history[store.historyIndex + 1],
      };
    }
    return {};
  }),

  // WebSocket State
  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));

export default useStore;