import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface BadgeNotificationProps {
  title: string;
  description: string;
  icon: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  onClose: () => void;
}

const levelColors = {
  bronze: {
    bg: "from-amber-600 to-orange-700",
    border: "border-amber-400",
    text: "text-amber-100",
    button: "bg-amber-500 hover:bg-amber-600",
  },
  silver: {
    bg: "from-slate-500 to-slate-700",
    border: "border-slate-400",
    text: "text-slate-100",
    button: "bg-slate-400 hover:bg-slate-500",
  },
  gold: {
    bg: "from-yellow-500 to-amber-600",
    border: "border-yellow-300",
    text: "text-yellow-50",
    button: "bg-yellow-400 hover:bg-yellow-500 text-black",
  },
  platinum: {
    bg: "from-cyan-400 to-blue-600",
    border: "border-cyan-300",
    text: "text-cyan-50",
    button: "bg-cyan-300 hover:bg-cyan-400 text-black",
  },
};

export function BadgeNotification() {
  return null;
}
