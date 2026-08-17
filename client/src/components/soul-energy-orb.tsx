import { useSoulEnergy } from "@/hooks/use-soul-energy";

interface SoulEnergyOrbProps {
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  className?: string;
}

export function SoulEnergyOrb({ size = "medium", showLabel = true, className = "" }: SoulEnergyOrbProps) {
  const { soulEnergy, isLoading, error } = useSoulEnergy();

  // Calculate orb intensity based on energy level (max glow at 100 energy)
  const intensity = Math.min(soulEnergy / 100, 1);
  const glowOpacity = 0.3 + (intensity * 0.7); // Opacity between 0.3 and 1.0
  
  // Size configurations
  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20", 
    large: "w-32 h-32"
  };
  
  const textSizes = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-lg"
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`} data-testid="soul-energy-orb">
      {/* Orb Container */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Main Orb */}
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-300 via-pink-300 to-orange-200 shadow-lg transition-all duration-1000 ease-in-out`}
          style={{
            boxShadow: `0 0 ${20 + intensity * 30}px rgba(251, 146, 60, ${glowOpacity}), 
                       0 0 ${40 + intensity * 60}px rgba(249, 115, 22, ${glowOpacity * 0.6}),
                       inset 0 2px 4px rgba(255, 255, 255, 0.3)`
          }}
        >
          {/* Inner Glow */}
          <div 
            className="absolute inset-2 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"
          />
          
          {/* Energy Sparkles */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {soulEnergy > 0 && (
              <>
                <div 
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{ 
                    top: '20%', 
                    left: '30%',
                    opacity: intensity
                  }}
                />
                <div 
                  className="absolute w-0.5 h-0.5 bg-yellow-200 rounded-full"
                  style={{ 
                    top: '60%', 
                    right: '25%',
                    opacity: intensity * 0.8
                  }}
                />
                <div 
                  className="absolute w-0.5 h-0.5 bg-orange-200 rounded-full"
                  style={{ 
                    bottom: '30%', 
                    left: '70%',
                    opacity: intensity * 0.6
                  }}
                />
              </>
            )}
          </div>
          
          {/* Energy Level Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <span className={`font-bold text-white drop-shadow-lg ${textSizes[size]}`} data-testid="soul-energy-count" title={error ? "Unable to load soul energy" : undefined}>
                {error ? "--" : soulEnergy}
              </span>
            )}
          </div>
        </div>
        
        {/* Outer Glow Ring */}
        {soulEnergy > 0 && (
          <div 
            className={`absolute ${sizeClasses[size]} rounded-full border-2 border-orange-300/30`}
            style={{ 
              transform: 'scale(1.2)',
              opacity: intensity * 0.5
            }}
          />
        )}
      </div>
      
      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <p className={`font-medium text-orange-800 dark:text-orange-200 ${textSizes[size]}`} data-testid="soul-energy-label">
            Soul Energy
          </p>
          {soulEnergy === 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
              Scan an aura to gain energy
            </p>
          )}
        </div>
      )}
    </div>
  );
}