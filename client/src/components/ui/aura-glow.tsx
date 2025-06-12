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
  className?: string;
}

export function AuraGlow({ colors, className }: AuraGlowProps) {
  const defaultColors: AuraColor[] = [
    { color: "bg-purple-500/20", size: "w-64 h-64", top: "top-0", left: "left-0", delay: "0s" },
    { color: "bg-blue-500/20", size: "w-48 h-48", top: "top-1/4", right: "right-0", delay: "1s" },
    { color: "bg-indigo-500/20", size: "w-56 h-56", bottom: "bottom-0", left: "left-1/4", delay: "2s" }
  ];
  const activeColors = colors || defaultColors;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className || ''}`}>
      {activeColors.map((color, index) => (
        <div 
          key={index}
          className={`
            aura-glow absolute rounded-full ${color.color} 
            ${color.size} 
            ${color.top || ''} 
            ${color.bottom || ''} 
            ${color.left || ''} 
            ${color.right || ''} 
            aura-animate
          `} 
          style={{ animationDelay: color.delay }}
        ></div>
      ))}
    </div>
  );
}
