import { useMemo, useId } from "react";
import { Sparkles } from "lucide-react";
import { calculateTreeGrowth, getSoulEnergyMilestone } from "@/lib/soul-energy-utils";
import mascotSparkImage from "@assets/WhatsApp Image 2025-11-05 at 5.52.21 PM_1762780573653.jpeg";

interface AvatarSoulTreeProps {
  soulEnergy: number;
}

export default function AvatarSoulTree({ soulEnergy }: AvatarSoulTreeProps) {
  const treeGrowth = calculateTreeGrowth(soulEnergy);
  const milestone = getSoulEnergyMilestone(soulEnergy);
  const uniqueId = useId();
  
  // Calculate the intensity of the glow based on tree growth
  const glowIntensity = Math.min(1, treeGrowth / 100);
  
  // Memoize particle positions to prevent flicker on re-renders
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: i % 3 === 0 ? 'w-2 h-2' : i % 3 === 1 ? 'w-1.5 h-1.5' : 'w-1 h-1',
      color: i % 4 === 0 ? 'rgba(34, 211, 238, 0.9)' : i % 4 === 1 ? 'rgba(168, 85, 247, 0.9)' : i % 4 === 2 ? 'rgba(251, 191, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      boxShadow: 4 + (i % 3) * 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 5 + Math.random() * 10,
      opacity: 0.4 + Math.random() * 0.6
    }));
  }, []);
  
  // Memoize glowing circle orbs arranged in tree layers
  const treeCircles = useMemo(() => {
    const configs = [
      // Top layer - smallest
      { growth: 0, top: 8, left: 50, size: 24, delay: 0, layer: 1 },
      
      // Second layer - 3 circles
      { growth: 10, top: 18, left: 40, size: 28, delay: 0.3, layer: 2 },
      { growth: 10, top: 18, left: 50, size: 32, delay: 0.5, layer: 2 },
      { growth: 10, top: 18, left: 60, size: 28, delay: 0.7, layer: 2 },
      
      // Third layer - 5 circles
      { growth: 20, top: 30, left: 30, size: 32, delay: 0.9, layer: 3 },
      { growth: 20, top: 30, left: 40, size: 36, delay: 1.1, layer: 3 },
      { growth: 20, top: 30, left: 50, size: 40, delay: 1.3, layer: 3 },
      { growth: 20, top: 30, left: 60, size: 36, delay: 1.5, layer: 3 },
      { growth: 20, top: 30, left: 70, size: 32, delay: 1.7, layer: 3 },
      
      // Fourth layer - 7 circles
      { growth: 40, top: 44, left: 25, size: 36, delay: 1.9, layer: 4 },
      { growth: 40, top: 44, left: 33, size: 40, delay: 2.1, layer: 4 },
      { growth: 40, top: 44, left: 42, size: 44, delay: 2.3, layer: 4 },
      { growth: 40, top: 44, left: 50, size: 48, delay: 2.5, layer: 4 },
      { growth: 40, top: 44, left: 58, size: 44, delay: 2.7, layer: 4 },
      { growth: 40, top: 44, left: 67, size: 40, delay: 2.9, layer: 4 },
      { growth: 40, top: 44, left: 75, size: 36, delay: 3.1, layer: 4 },
      
      // Fifth layer - 9 circles (bottom/widest)
      { growth: 60, top: 58, left: 20, size: 40, delay: 3.3, layer: 5 },
      { growth: 60, top: 58, left: 28, size: 44, delay: 3.5, layer: 5 },
      { growth: 60, top: 58, left: 36, size: 48, delay: 3.7, layer: 5 },
      { growth: 60, top: 58, left: 44, size: 52, delay: 3.9, layer: 5 },
      { growth: 60, top: 58, left: 50, size: 56, delay: 4.1, layer: 5 },
      { growth: 60, top: 58, left: 56, size: 52, delay: 4.3, layer: 5 },
      { growth: 60, top: 58, left: 64, size: 48, delay: 4.5, layer: 5 },
      { growth: 60, top: 58, left: 72, size: 44, delay: 4.7, layer: 5 },
      { growth: 60, top: 58, left: 80, size: 40, delay: 4.9, layer: 5 },
    ];
    return configs.filter(circle => treeGrowth >= circle.growth);
  }, [treeGrowth]);
  
  // Memoize tendrils (energy strands flowing down)
  const tendrils = useMemo(() => {
    const tendrilConfigs = [
      { growth: 15, left: 48, delay: 0, duration: 4 },
      { growth: 25, left: 38, delay: 1, duration: 5 },
      { growth: 25, left: 62, delay: 0.5, duration: 4.5 },
      { growth: 45, left: 30, delay: 1.5, duration: 5.5 },
      { growth: 45, left: 70, delay: 2, duration: 5 },
      { growth: 70, left: 52, delay: 2.5, duration: 6 },
    ];
    return tendrilConfigs.filter(tendril => treeGrowth >= tendril.growth);
  }, [treeGrowth]);
  
  return (
    <div className="relative w-full h-[32rem] flex items-center justify-center overflow-hidden rounded-xl bg-black">
      {/* Cosmic background with nebula effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 120%, rgba(139, 92, 246, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(167, 139, 250, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 70% 40%, rgba(34, 211, 238, 0.2) 0%, transparent 45%)
          `
        }}
      />
      
      {/* Sacred geometry - subtle hexagonal patterns */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id={`hexagons-${uniqueId}`} x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <path d="M30 0 L50 13 L50 39 L30 52 L10 39 L10 13 Z" 
                    fill="none" 
                    stroke="rgba(139, 92, 246, 0.3)" 
                    strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#hexagons-${uniqueId})`} />
        </svg>
      </div>
      
      {/* Ethereal light rays emanating from center */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`ray-${i}`}
          className="absolute w-1 h-full top-0 left-1/2"
          style={{
            background: `linear-gradient(to bottom, transparent 40%, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.15)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.15)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.15)'} 50%, transparent 60%)`,
            transform: `rotate(${i * 45}deg)`,
            transformOrigin: 'top center',
            opacity: glowIntensity * 0.5,
            animation: 'aura-pulse 4s ease-in-out infinite',
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}
      
      {/* Enhanced floating particles with varied sizes */}
      {particles.map((particle) => (
        <div
          key={`particle-${particle.id}`}
          className={`absolute ${particle.size} rounded-full animate-float`}
          style={{
            background: particle.color,
            boxShadow: `0 0 ${particle.boxShadow}px currentColor`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`,
            opacity: particle.opacity
          }}
        />
      ))}
      
      {/* Main tree container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Multi-layered glowing aura around tree */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl opacity-40"
          style={{
            background: `radial-gradient(circle, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.7)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.7)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.7)' : 'rgba(255, 255, 255, 0.7)'} 0%, transparent 70%)`,
            transform: `scale(${1 + glowIntensity * 0.6})`,
            animation: 'aura-pulse 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{
            background: `radial-gradient(circle, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.5)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.5)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255, 255, 255, 0.5)'} 0%, transparent 60%)`,
            transform: `scale(${1.2 + glowIntensity * 0.4})`,
            animation: 'aura-pulse 4s ease-in-out infinite',
            animationDelay: '1s'
          }}
        />
        
        {/* Tree crown - glowing circle layers arranged in tree shape */}
        <div className="relative w-[32rem] h-[24rem] mb-4">
          {/* Tree circles arranged in layers (pyramid/tree shape) */}
          {treeCircles.map((circle, i) => (
            <div
              key={`tree-circle-${i}`}
              className="absolute rounded-full animate-circle-glow"
              style={{
                top: `${circle.top}%`,
                left: `${circle.left}%`,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                background: `radial-gradient(circle, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.9)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.9)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)'} 0%, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.5)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.5)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255, 255, 255, 0.5)'} 60%, transparent 100%)`,
                boxShadow: `
                  0 0 ${circle.size * 1.5}px ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.8)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.8)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.8)' : 'rgba(255, 255, 255, 0.8)'},
                  0 0 ${circle.size * 0.8}px ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.6)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.6)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(255, 255, 255, 0.6)'}
                `,
                animationDelay: `${circle.delay}s`,
                transform: 'translate(-50%, -50%)',
                filter: 'blur(0.5px)'
              }}
            />
          ))}
          
          {/* Sparkles around the tree */}
          <Sparkles className="absolute top-2 left-1/4 w-4 h-4 text-yellow-300 animate-pulse" style={{ animationDelay: '0s' }} />
          <Sparkles className="absolute top-8 right-1/4 w-3 h-3 text-cyan-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute top-6 right-1/3 w-5 h-5 text-purple-300 animate-pulse" style={{ animationDelay: '1s' }} />
          <Sparkles className="absolute top-14 left-1/3 w-3 h-3 text-white animate-pulse" style={{ animationDelay: '1.5s' }} />
          <Sparkles className="absolute top-24 left-1/2 w-4 h-4 text-yellow-200 animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Tendrils flowing down from tree */}
          {tendrils.map((tendril, i) => (
            <div
              key={`tendril-${i}`}
              className="absolute animate-tendril-flow"
              style={{
                top: '50%',
                left: `${tendril.left}%`,
                width: '2px',
                height: '50%',
                background: `linear-gradient(to bottom, ${milestone.color === 'cyan' ? 'rgba(34, 211, 238, 0.5)' : milestone.color === 'purple' ? 'rgba(168, 85, 247, 0.5)' : milestone.color === 'yellow' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255, 255, 255, 0.5)'} 0%, transparent 100%)`,
                filter: 'blur(1px)',
                animationDelay: `${tendril.delay}s`,
                animationDuration: `${tendril.duration}s`,
                transformOrigin: 'top center'
              }}
            />
          ))}
        </div>
        
        {/* Tree trunk - mystical glowing pillar */}
        <div className="relative w-24 h-48">
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
        
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes expandFade {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        
        @keyframes circle-glow {
          0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }
        
        @keyframes tendril-flow {
          0% { opacity: 0; transform: translateY(-20px) scaleY(0.5); }
          50% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(20px) scaleY(1); }
        }
      `}</style>
    </div>
  );
}
