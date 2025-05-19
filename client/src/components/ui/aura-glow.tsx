interface AuraColor {
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: string;
  delay: string;
}

interface AuraGlowProps {
  colors?: AuraColor[];
}

export function AuraGlow({ colors }: AuraGlowProps) {
  // Default colors if none provided
  const defaultColors: AuraColor[] = [
    { 
      color: "bg-purple-500/30", 
      top: "top-1/4", 
      left: "left-1/3", 
      size: "w-32 h-32", 
      delay: "0s" 
    },
    { 
      color: "bg-indigo-500/20", 
      bottom: "bottom-1/3", 
      right: "right-1/4", 
      size: "w-40 h-40", 
      delay: "0.5s" 
    },
    { 
      color: "bg-blue-400/25", 
      top: "top-1/2", 
      right: "right-1/3", 
      size: "w-28 h-28", 
      delay: "0.3s" 
    },
    { 
      color: "bg-violet-500/20", 
      bottom: "bottom-1/4", 
      left: "left-1/4", 
      size: "w-36 h-36", 
      delay: "0.7s" 
    },
  ];

  const glowColors = colors || defaultColors;
  
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-lg bg-gray-50/50">
      {glowColors.map((color, index) => (
        <div 
          key={index}
          className={`
            animate-pulse absolute rounded-full ${color.color} 
            ${color.size} 
            ${color.top || ''} 
            ${color.bottom || ''} 
            ${color.left || ''} 
            ${color.right || ''} 
            blur-xl
          `} 
          style={{ animationDelay: color.delay }}
        ></div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-gray-500">Analyzing energy patterns...</span>
      </div>
    </div>
  );
}
