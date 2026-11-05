import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { scenarios } from "../challenges/scenarios";
import type { Scenario, Session } from "../challenges/engine/types";
import {
  clearProgress,
  loadProgress,
  mergeProgress,
  saveProgress,
  type Progress,
} from "./storage";
function read(): { progress: Progress; available: boolean } {
  try {
    const storage = window.localStorage;
    storage.getItem("internet-literacy-lab:progress:v1");
    return { progress: loadProgress(storage, scenarios), available: true };
  } catch {
    return { progress: {}, available: false };
  }
}
const Context = createContext<{
  progress: Progress;
  available: boolean;
  record: (s: Scenario, state: Session) => void;
  reset: () => boolean;
} | null>(null);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(read);
  const current = useRef(data.progress);
  const record = useCallback((scenario: Scenario, state: Session) => {
    const progress = mergeProgress(current.current, scenario, state);
    current.current = progress;
    let available = false;
    try {
      available = saveProgress(window.localStorage, progress);
    } catch {
      /* Private browsing may deny access. */
    }
    setData({ progress, available });
  }, []);
  const reset = useCallback(() => {
    let available = false;
    try {
      available = clearProgress(window.localStorage);
    } catch {
      /* Keep this session usable. */
    }
    current.current = {};
    setData({ progress: {}, available });
    return available;
  }, []);
  return (
    <Context.Provider value={{ ...data, record, reset }}>
      {children}
    </Context.Provider>
  );
}
export function useProgress() {
  const context = useContext(Context);
  if (!context) throw new Error("ProgressProvider is required");
  return context;
}
