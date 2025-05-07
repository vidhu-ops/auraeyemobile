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
  colors: AuraColor[];
}

export function AuraGlow({ colors }: AuraGlowProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {colors.map((color, index) => (
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
