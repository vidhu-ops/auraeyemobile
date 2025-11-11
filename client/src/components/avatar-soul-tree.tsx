import { calculateTreeGrowth, getSoulEnergyMilestone } from "@/lib/soul-energy-utils";
import soulTreeGif from "@assets/77552830537bb0c408e138cf518d6b9d_1762861630726.gif";

interface AvatarSoulTreeProps {
  soulEnergy: number;
}

export default function AvatarSoulTree({ soulEnergy }: AvatarSoulTreeProps) {
  const treeGrowth = calculateTreeGrowth(soulEnergy);
  const milestone = getSoulEnergyMilestone(soulEnergy);
  
  // Calculate the intensity of the glow based on tree growth
  const glowIntensity = Math.min(1, treeGrowth / 100);
  
  return (
    <div className="relative w-full h-[32rem] flex items-center justify-center overflow-hidden rounded-xl bg-black">
      {/* Mystical glowing aura background */}
      <div 
        className="absolute inset-0 blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.7)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.7)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.7)' : 'rgba(255, 255, 255, 0.7)'} 0%, transparent 70%)`,
          transform: `scale(${1 + glowIntensity * 0.6})`,
          animation: 'aura-pulse 6s ease-in-out infinite'
        }}
      />
      
      {/* Animated Soul Tree GIF */}
      <div className="relative z-10">
        <img 
          src={soulTreeGif} 
          alt="Soul Tree" 
          className="w-full h-full object-contain rounded-xl"
          style={{
            maxWidth: '500px',
            maxHeight: '500px',
            filter: `drop-shadow(0 0 ${30 * glowIntensity}px ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.8)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.8)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.8)' : 'rgba(255, 255, 255, 0.8)'})`,
            animation: 'gentle-float 4s ease-in-out infinite'
          }}
        />
      </div>
      
      {/* CSS animations */}
      <style>{`
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
