import { createContext, useContext, useState, ReactNode } from "react";

interface MascotContextType {
  shouldGlow: boolean;
  triggerGlow: () => void;
  position: MascotPosition;
  setPosition: (position: MascotPosition) => void;
  summonMascot: () => void;
}

export type MascotPosition = 
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "middle-right"
  | "middle-left";

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export function MascotProvider({ children }: { children: ReactNode }) {
  const [shouldGlow, setShouldGlow] = useState(false);
  const [position, setPosition] = useState<MascotPosition>("bottom-right");

  const triggerGlow = () => {
    setShouldGlow(true);
    setTimeout(() => setShouldGlow(false), 2000);
  };

  const summonMascot = () => {
    // Clear the permanently clicked state to allow mascot to reappear
    localStorage.removeItem("mascotClicked");
    // Trigger glow effect
    setShouldGlow(true);
    setTimeout(() => setShouldGlow(false), 2000);
    // Force a page reload event to trigger mascot reappearance
    window.dispatchEvent(new Event('summon-mascot'));
  };

  return (
    <MascotContext.Provider value={{ shouldGlow, triggerGlow, position, setPosition, summonMascot }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const context = useContext(MascotContext);
  if (context === undefined) {
    throw new Error("useMascot must be used within a MascotProvider");
  }
  return context;
}
