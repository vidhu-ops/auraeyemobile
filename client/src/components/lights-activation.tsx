import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Zap } from "lucide-react";
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
      className={`fixed inset-0 flex items-center justify-center transition-all duration-1500 ${
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
          50% {
            background: linear-gradient(to bottom right, #1e1b4b, #1e3a8a, #1e40af);
          }
          100% {
            background: linear-gradient(to bottom right, #ffffff, #f0f9ff, #e0f2fe);
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
              <Lightbulb className="h-24 w-24 text-purple-400 mx-auto mb-4 opacity-50" />
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
            <div className="relative">
              <Lightbulb className="h-32 w-32 text-yellow-400 mx-auto animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 bg-yellow-400 rounded-full opacity-20 animate-ping"></div>
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
