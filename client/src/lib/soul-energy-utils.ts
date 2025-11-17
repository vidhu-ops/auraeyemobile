export const SOUL_ENERGY_PER_SCAN = 100; // For aura, vibe, numerology, and object scans

export interface EnergyMilestone {
  level: string;
  min: number;
  max: number;
  color: string;
  gradient: string;
}

export const energyMilestones: EnergyMilestone[] = [
  {
    level: "Explorer",
    min: 0,
    max: 2000,
    color: "green",
    gradient: "from-green-400 to-emerald-500"
  },
  {
    level: "Beginner",
    min: 2001,
    max: 4000,
    color: "cyan",
    gradient: "from-cyan-400 to-blue-500"
  },
  {
    level: "Intermediate",
    min: 4001,
    max: 6000,
    color: "purple",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    level: "Advanced",
    min: 6001,
    max: 8000,
    color: "yellow",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    level: "Awakened",
    min: 8001,
    max: Infinity,
    color: "white",
    gradient: "from-white to-cyan-200"
  }
];

export function getSoulEnergyMilestone(soulEnergy: number): EnergyMilestone {
  return energyMilestones.find(m => soulEnergy >= m.min && soulEnergy <= m.max) || energyMilestones[0];
}

export function calculateTreeGrowth(soulEnergy: number): number {
  // 1000 soul energies = 10% growth (proportional/linear)
  return Math.min(100, (soulEnergy / 1000) * 10);
}

export function getProgressToNextMilestone(soulEnergy: number): {
  current: number;
  total: number;
  percentage: number;
} {
  const milestone = getSoulEnergyMilestone(soulEnergy);
  
  if (milestone.max === Infinity) {
    return {
      current: soulEnergy - milestone.min,
      total: 5000, // Show progress in 5000 increments for Awakened
      percentage: 100
    };
  }
  
  const current = soulEnergy - milestone.min;
  const total = milestone.max - milestone.min;
  const percentage = Math.min(100, (current / total) * 100);
  
  return { current, total, percentage };
}
