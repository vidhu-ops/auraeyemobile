import { calculateTreeGrowth, getSoulEnergyMilestone } from "@/lib/soul-energy-utils";
import { getSoulTreeImage } from "@/lib/soul-tree-images";
import { Sparkles } from "lucide-react";

interface AvatarSoulTreeProps {
  soulEnergy: number;
}

export default function AvatarSoulTree({ soulEnergy }: AvatarSoulTreeProps) {
  const treeGrowth = calculateTreeGrowth(soulEnergy);
  const milestone = getSoulEnergyMilestone(soulEnergy);
  
  const glowIntensity = Math.min(1, treeGrowth / 100);
  
  const growthStep = Math.floor(treeGrowth / 10);
  const brightness = 0.7 + (growthStep * 0.1);
  
  const soulTreeImage = getSoulTreeImage(treeGrowth);
  
  const getMilestoneColor = () => {
    switch(milestone.color) {
      case 'cyan': return { rgb: '34, 211, 238', name: 'cyan' };
      case 'purple': return { rgb: '168, 85, 247', name: 'purple' };
      case 'yellow': return { rgb: '251, 191, 36', name: 'yellow' };
      default: return { rgb: '255, 255, 255', name: 'white' };
    }
  };
  
  const milestoneColor = getMilestoneColor();
  
  const particleCount = Math.min(20, Math.floor(treeGrowth / 5));
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    isBubble: Math.random() > 0.5
  }));
  
  return (
    <div className="relative w-full h-[32rem] flex items-center justify-center overflow-hidden rounded-xl bg-black">
      <div 
        className="absolute inset-0 blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.7)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.7)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.7)' : 'rgba(255, 255, 255, 0.7)'} 0%, transparent 70%)`,
          transform: `scale(${1 + glowIntensity * 0.6})`,
          animation: 'aura-pulse 6s ease-in-out infinite'
        }}
      />
      
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `float-particle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            opacity: 0.6
          }}
        >
          {particle.isBubble ? (
            <div
              className="rounded-full border-2"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                borderColor: `rgba(${milestoneColor.rgb}, 0.5)`,
                background: `radial-gradient(circle at 30% 30%, rgba(${milestoneColor.rgb}, 0.3), transparent)`,
                boxShadow: `0 0 ${particle.size * 2}px rgba(${milestoneColor.rgb}, 0.4)`,
              }}
            />
          ) : (
            <Sparkles
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                color: `rgba(${milestoneColor.rgb}, 0.8)`,
                filter: `drop-shadow(0 0 ${particle.size}px rgba(${milestoneColor.rgb}, 0.6))`
              }}
            />
          )}
        </div>
      ))}
      
      <div className="relative z-10">
        <img 
          src={soulTreeImage} 
          alt="Soul Tree" 
          className="w-full h-full object-contain rounded-xl"
          data-testid="img-soul-tree"
          style={{
            maxWidth: '500px',
            maxHeight: '500px',
            filter: `brightness(${brightness}) drop-shadow(0 0 ${30 * glowIntensity}px ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.8)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.8)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.8)' : 'rgba(255, 255, 255, 0.8)'})`,
            animation: 'gentle-float 4s ease-in-out infinite'
          }}
        />
      </div>
      
      <style>{`
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-particle {
          0% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-30px) translateX(15px) rotate(180deg);
            opacity: 0.8;
          }
          90% {
            opacity: 0.6;
          }
          100% { 
            transform: translateY(-60px) translateX(0px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
