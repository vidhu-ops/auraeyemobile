import { Link } from "wouter";
import { Eye } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-cyan-400" />
          <span className="text-lg font-bold text-white">
            AuraEye<span className="text-cyan-400">™</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-cyan-100 md:flex">
          <Link href="/" className="hover:text-white">
            What&rsquo;s My Vibe
          </Link>
          <Link href="/aura-analysis" className="hover:text-white">
            Aura Analysis
          </Link>
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
        </nav>
      </div>
    </header>
  );
}
