import { createContext, useContext, useState } from "react";

interface LightsContextType {
  lightsOn: boolean;
  turnOnLights: () => void;
}

const LightsContext = createContext<LightsContextType | undefined>(undefined);

export function LightsProvider({ children }: { children: React.ReactNode }) {
  const [lightsOn, setLightsOn] = useState<boolean>(false);

  const turnOnLights = () => {
    setLightsOn(true);
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
