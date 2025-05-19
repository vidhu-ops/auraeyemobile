import React, { createContext, useContext, useState, ReactNode } from "react";
import { PremiumModal } from "@/components/premium/premium-modal";

type PremiumFeatureType = "aura" | "numerology" | "horoscope" | "general";

interface PremiumContextType {
  isPremium: boolean;
  showPremiumModal: (featureType: PremiumFeatureType) => void;
  closePremiumModal: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium] = useState<boolean>(true); // Set to true to unlock all premium features
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeFeature, setActiveFeature] = useState<PremiumFeatureType>("general");

  const showPremiumModal = (featureType: PremiumFeatureType) => {
    setActiveFeature(featureType);
    setIsModalOpen(true);
  };

  const closePremiumModal = () => {
    setIsModalOpen(false);
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        showPremiumModal,
        closePremiumModal,
      }}
    >
      {children}
      <PremiumModal 
        isOpen={isModalOpen} 
        onClose={closePremiumModal}
        featureType={activeFeature}
      />
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}