import { create } from "zustand";
import { temporal } from "zundo";

// Exactly as you specified: State shape: { json: string | null }
interface HistoryState {
  json: string | null;
  setJson: (json: string) => void;
}

// Zustand store with zundo - expose temporal for undo(), redo(), canUndo, canRedo
export const useHistoryStore = create<HistoryState>()(
  temporal(
    (set) => ({
      json: null,
      setJson: (json: string) => set({ json }),
    }),
    {
      limit: 50, // ≤ 50 history steps
      equality: (pastState, currentState) => {
        return pastState?.json === currentState?.json;
      },
    }
  )
);
