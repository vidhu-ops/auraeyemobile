import { Sparkles } from "lucide-react";
import { calculateTreeGrowth, getSoulEnergyMilestone } from "@/lib/soul-energy-utils";

interface AvatarSoulTreeProps {
  soulEnergy: number;
}

export default function AvatarSoulTree({ soulEnergy }: AvatarSoulTreeProps) {
  const treeGrowth = calculateTreeGrowth(soulEnergy);
  const milestone = getSoulEnergyMilestone(soulEnergy);
  
  // Calculate the intensity of the glow based on tree growth
  const glowIntensity = Math.min(1, treeGrowth / 100);
  
  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden rounded-xl">
      {/* Mystical background with gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 120%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(167, 139, 250, 0.2) 0%, transparent 40%)
          `
        }}
      />
      
      {/* Floating particles/sparkles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-300 rounded-full animate-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            opacity: 0.3 + Math.random() * 0.7
          }}
        />
      ))}
      
      {/* Main tree container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glowing aura around tree */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl opacity-40"
          style={{
            background: `radial-gradient(circle, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.6)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.6)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(255, 255, 255, 0.6)'} 0%, transparent 70%)`,
            transform: `scale(${1 + glowIntensity * 0.5})`
          }}
        />
        
        {/* Tree crown - willow-like cascading branches */}
        <div className="relative w-64 h-48 mb-4">
          {/* Central glowing core */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full"
            style={{
              background: `radial-gradient(circle, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.9)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.9)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)'} 0%, transparent 70%)`,
              boxShadow: `0 0 ${30 * glowIntensity}px ${milestone.color === 'cyan' ? '#22d3ee' : milestone.color === 'purple' ? '#a855f7' : milestone.color === 'yellow' ? '#fbbf24' : '#ffffff'}`,
              animation: 'pulse 3s ease-in-out infinite'
            }}
          />
          
          {/* Cascading willow branches based on growth */}
          {treeGrowth >= 10 && (
            <>
              <div 
                className="absolute top-12 left-1/2 w-32 h-40 -ml-16"
                style={{
                  background: `linear-gradient(180deg, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.7)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.7)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.7)' : 'rgba(255, 255, 255, 0.7)'} 0%, transparent 100%)`,
                  clipPath: 'polygon(40% 0, 60% 0, 70% 100%, 30% 100%)',
                  filter: 'blur(2px)',
                  opacity: 0.6,
                  animation: 'sway 4s ease-in-out infinite'
                }}
              />
              <div 
                className="absolute top-16 left-1/4 w-24 h-32"
                style={{
                  background: `linear-gradient(180deg, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.6)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.6)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(255, 255, 255, 0.6)'} 0%, transparent 100%)`,
                  clipPath: 'polygon(45% 0, 55% 0, 75% 100%, 25% 100%)',
                  filter: 'blur(2px)',
                  opacity: 0.5,
                  animation: 'sway 5s ease-in-out infinite',
                  animationDelay: '0.5s'
                }}
              />
              <div 
                className="absolute top-16 right-1/4 w-24 h-32"
                style={{
                  background: `linear-gradient(180deg, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.6)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.6)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(255, 255, 255, 0.6)'} 0%, transparent 100%)`,
                  clipPath: 'polygon(45% 0, 55% 0, 75% 100%, 25% 100%)',
                  filter: 'blur(2px)',
                  opacity: 0.5,
                  animation: 'sway 5s ease-in-out infinite',
                  animationDelay: '1s'
                }}
              />
            </>
          )}
          
          {treeGrowth >= 30 && (
            <>
              <div 
                className="absolute top-20 left-12 w-20 h-28"
                style={{
                  background: `linear-gradient(180deg, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.5)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.5)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255, 255, 255, 0.5)'} 0%, transparent 100%)`,
                  clipPath: 'polygon(47% 0, 53% 0, 80% 100%, 20% 100%)',
                  filter: 'blur(3px)',
                  opacity: 0.4,
                  animation: 'sway 6s ease-in-out infinite',
                  animationDelay: '1.5s'
                }}
              />
              <div 
                className="absolute top-20 right-12 w-20 h-28"
                style={{
                  background: `linear-gradient(180deg, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.5)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.5)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255, 255, 255, 0.5)'} 0%, transparent 100%)`,
                  clipPath: 'polygon(47% 0, 53% 0, 80% 100%, 20% 100%)',
                  filter: 'blur(3px)',
                  opacity: 0.4,
                  animation: 'sway 6s ease-in-out infinite',
                  animationDelay: '2s'
                }}
              />
            </>
          )}
          
          {treeGrowth >= 60 && (
            <>
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-16 h-24"
                  style={{
                    top: `${60 + i * 5}px`,
                    left: `${20 + i * 50}px`,
                    background: `linear-gradient(180deg, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.4)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.4)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.4)'} 0%, transparent 100%)`,
                    clipPath: 'polygon(48% 0, 52% 0, 85% 100%, 15% 100%)',
                    filter: 'blur(4px)',
                    opacity: 0.3,
                    animation: 'sway 7s ease-in-out infinite',
                    animationDelay: `${2.5 + i * 0.3}s`
                  }}
                />
              ))}
            </>
          )}
          
          {/* Sparkles around the tree */}
          <Sparkles className="absolute top-2 left-8 w-4 h-4 text-yellow-300 animate-pulse" style={{ animationDelay: '0s' }} />
          <Sparkles className="absolute top-8 right-12 w-3 h-3 text-cyan-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute top-6 right-4 w-5 h-5 text-purple-300 animate-pulse" style={{ animationDelay: '1s' }} />
          <Sparkles className="absolute top-14 left-4 w-3 h-3 text-white animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
        {/* Tree trunk - mystical glowing pillar */}
        <div className="relative w-16 h-32">
          <div 
            className="absolute inset-0 bg-gradient-to-b opacity-60"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.4)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.4)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.4)'}, rgba(71, 85, 105, 0.8))`,
              boxShadow: `inset 0 0 20px ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.5)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.5)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255, 255, 255, 0.5)'}`,
              borderRadius: '8px 8px 0 0'
            }}
          />
        </div>
        
        {/* Roots - mystical ground connection */}
        <div className="relative w-48 h-8 -mt-2">
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(ellipse at center, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.4)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.4)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.4)'} 0%, transparent 70%)`,
            }}
          />
        </div>
      </div>
      
      {/* CSS animations */}
      <style>{`
        @keyframes sway {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          50% { transform: translateX(4px) rotate(2deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
