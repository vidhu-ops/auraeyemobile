import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Lock, ArrowRight, Sparkles } from "lucide-react";

interface ServiceUpgradeProps {
  serviceName: string;
  serviceDescription: string;
  upgradeMessage: string;
  icon?: React.ReactNode;
}

export default function ServiceUpgrade({
  serviceName,
  serviceDescription,
  upgradeMessage,
  icon,
}: ServiceUpgradeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 border-purple-500/50 bg-slate-800/50 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-slate-900 rounded-full p-6 flex items-center justify-center">
                {icon ? (
                  <div className="text-5xl">{icon}</div>
                ) : (
                  <Lock className="w-12 h-12 text-purple-400" />
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl md:text-4xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {serviceName}
            </CardTitle>
            <CardDescription className="text-base md:text-lg text-slate-300">
              {serviceDescription}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upgrade message */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-200 text-center text-lg font-medium">
              ✨ {upgradeMessage}
            </p>
          </div>

          {/* Features info for full healers */}
          <div className="space-y-3">
            <p className="text-slate-300 font-semibold">What you'll get with premium access:</p>
            <ul className="space-y-2">
              {serviceName === "Aura Analysis" ? (
                <>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span>Detailed multi-dimensional aura readings</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span>Chakra analysis and insights</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span>Spiritual guidance based on your unique energy</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span>PDF reports and detailed visualizations</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span>Analyze the spiritual energy of any object</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span>Discover hidden meanings and spiritual significance</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span>Enhanced aura visualization technology</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span>Professional-grade spiritual insights</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-purple-500/50 hover:bg-purple-500/10 text-purple-300"
              >
                Back to Home
              </Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold flex items-center justify-center gap-2"
              >
                Contact for Upgrade
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Info message */}
          <p className="text-center text-sm text-slate-400 border-t border-slate-700/50 pt-4">
            This premium service is reserved for select healers. Contact our team to discuss your upgrade path.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
