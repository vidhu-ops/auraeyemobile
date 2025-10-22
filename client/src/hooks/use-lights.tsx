import { createContext, useContext, useState, useEffect } from "react";

interface LightsContextType {
  lightsOn: boolean;
  turnOnLights: () => void;
}

const LightsContext = createContext<LightsContextType | undefined>(undefined);

export function LightsProvider({ children }: { children: React.ReactNode }) {
  const [lightsOn, setLightsOn] = useState<boolean>(() => {
    // Check if lights were previously turned on in this session
    const stored = sessionStorage.getItem("lightsOn");
    return stored === "true";
  });

  const turnOnLights = () => {
    setLightsOn(true);
    sessionStorage.setItem("lightsOn", "true");
  };

  return (
    <LightsContext.Provider value={{ lightsOn, turnOnLights }}>
      {children}
    </LightsContext.Provider>
  );
}

export function useLights() {
  const context = useContext(LightsContext);
  if (context === undefined) {
    throw new Error("useLights must be used within a LightsProvider");
  }
  return context;
}
