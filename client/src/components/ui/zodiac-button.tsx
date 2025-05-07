import { ReactNode } from "react";

interface ZodiacButtonProps {
  sign: string;
  icon: ReactNode;
  isSelected?: boolean;
  onClick: () => void;
}

export default function ZodiacButton({ sign, icon, isSelected = false, onClick }: ZodiacButtonProps) {
  return (
    <button 
      className={`aspect-square bg-white rounded-lg border-2 ${
        isSelected ? 'border-primary' : 'border-gray-200'
      } flex flex-col items-center justify-center p-2 hover:bg-primary/5 transition-colors`}
      onClick={onClick}
    >
      <div className={`text-xl mb-1 ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className="text-xs font-medium">{sign}</span>
    </button>
  );
}
