import { Link } from "wouter";
import { Zap, Eye, BookOpen, Sparkles } from "lucide-react";

const items = [
  { href: "/", label: "Vibe", icon: Zap },
  { href: "/aura-analysis", label: "Aura", icon: Eye },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/pricing", label: "Upgrade", icon: Sparkles },
];

export default function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white md:hidden">
      <div className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 py-2 text-xs text-slate-600 hover:text-purple-600"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
