import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useLights } from "@/hooks/use-lights";

export default function LightsActivation() {
  const { turnOnLights } = useLights();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleActivate = () => {
    setIsAnimating(true);
    
    // Add a delay for the animation effect
    setTimeout(() => {
      turnOnLights();
    }, 1500);
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center transition-all duration-2500 ${
        isAnimating 
          ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900' 
          : 'bg-black'
      }`}
      style={{
        animation: isAnimating ? 'lightsOn 1.5s ease-in-out forwards' : 'none'
      }}
    >
      <style>{`
        @keyframes lightsOn {
          0% {
            background: #000000;
          }
          20% {
            background: linear-gradient(to bottom right, #1e1b4b, #312e81, #1e3a8a);
          }
          40% {
            background: linear-gradient(to bottom right, #1e3a8a, #ca8a04, #eab308);
          }
          100% {
            background: linear-gradient(to bottom right, #eab308, #fde68a, #fcd34d);
          }
          
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.6);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .sparkle {
          animation: sparkle 1s ease-in-out infinite;
        }
      `}</style>

      <div className="text-center space-y-8 relative">
        {/* Sparkle effects around the button */}
        {!isAnimating && (
          <>
            <div className="absolute -top-12 -left-12 text-yellow-400 sparkle" style={{ animationDelay: '0s' }}>✨</div>
            <div className="absolute -top-16 -right-8 text-yellow-300 sparkle" style={{ animationDelay: '0.3s' }}>⭐</div>
            <div className="absolute -bottom-8 -left-16 text-yellow-400 sparkle" style={{ animationDelay: '0.6s' }}>💫</div>
            <div className="absolute -bottom-12 -right-12 text-yellow-300 sparkle" style={{ animationDelay: '0.9s' }}>✨</div>
          </>
        )}

        {!isAnimating ? (
          <>
            <div className="mb-6">
              {/* Custom Glowing Orb */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  {/* Outer glow layers */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 blur-2xl opacity-50 animate-pulse"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-purple-500 blur-xl opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  
                  {/* Main orb */}
                  <div 
                    className="absolute inset-4 rounded-full transform"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.6), rgba(99, 102, 241, 0.6), rgba(147, 51, 234, 0.6))',
                      backgroundSize: '200% 200%',
                      animation: 'float 4s ease-in-out infinite, gradient-shift 8s ease infinite',
                      boxShadow: `
                        0 0 40px rgba(168, 85, 247, 0.5),
                        0 0 60px rgba(99, 102, 241, 0.3),
                        inset 0 0 40px rgba(255, 255, 255, 0.2),
                        inset 10px 10px 40px rgba(255, 255, 255, 0.3)
                      `
                    }}
                  >
                    {/* Inner highlight */}
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent 50%)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Welcome to AuraEye</h1>
              <p className="text-purple-300 text-lg">Your spiritual wellness journey awaits</p>
            </div>

            <Button
              onClick={handleActivate}
              size="lg"
              className="pulse-glow bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-xl font-semibold rounded-2xl transform transition-transform hover:scale-105"
              data-testid="button-activate-lights"
            >
              <Zap className="mr-3 h-6 w-6" />
              Turn On The Lights
            </Button>

            <p className="text-purple-400 text-sm mt-4">Click to illuminate your path</p>
          </>
        ) : (
          <div className="text-center">
            {/* Activated Glowing Orb */}
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                {/* Intense outer glows */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-30 animate-ping"></div>
                
                {/* Main activated orb */}
                <div 
                  className="absolute inset-6 rounded-full transform animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(249, 115, 22, 0.95), rgba(234, 179, 8, 0.95))',
                    backgroundSize: '200% 200%',
                    animation: 'float 2s ease-in-out infinite, gradient-shift 4s ease infinite, pulse 1s ease-in-out infinite',
                    boxShadow: `
                      0 0 60px rgba(251, 191, 36, 0.9),
                      0 0 100px rgba(249, 115, 22, 0.7),
                      inset 0 0 50px rgba(255, 255, 255, 0.4),
                      inset 15px 15px 50px rgba(255, 255, 255, 0.5)
                    `
                  }}
                >
                  {/* Bright inner highlight */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), transparent 50%)'
                    }}
                  ></div>
                </div>

                {/* Energy rings */}
                <div 
                  className="absolute inset-8 rounded-full border-2 border-yellow-300/50"
                  style={{ animation: 'spin 3s linear infinite' }}
                ></div>
                <div 
                  className="absolute inset-10 rounded-full border-2 border-orange-400/30"
                  style={{ animation: 'spin 2s linear infinite reverse' }}
                ></div>
              </div>
            </div>
            <p className="text-white text-2xl font-semibold mt-6 animate-pulse">
              Activating your spiritual space...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
