export const SOUL_ENERGY_PER_SCAN = 100;

export interface EnergyMilestone {
  level: string;
  min: number;
  max: number;
  color: string;
  gradient: string;
}

export const energyMilestones: EnergyMilestone[] = [
  {
    level: "Awakening",
    min: 0,
    max: 1000,
    color: "cyan",
    gradient: "from-cyan-400 to-blue-500"
  },
  {
    level: "Balancer",
    min: 1001,
    max: 5000,
    color: "purple",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    level: "Radiant",
    min: 5001,
    max: 10000,
    color: "yellow",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    level: "Ascended",
    min: 10001,
    max: Infinity,
    color: "white",
    gradient: "from-white to-cyan-200"
  }
];

export function getSoulEnergyMilestone(soulEnergy: number): EnergyMilestone {
  return energyMilestones.find(m => soulEnergy >= m.min && soulEnergy <= m.max) || energyMilestones[0];
}

export function calculateTreeGrowth(soulEnergy: number): number {
  // 100 soul energies = 10% growth (proportional/linear)
  return Math.min(100, (soulEnergy / 100) * 10);
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
      total: 5000, // Show progress in 5000 increments for Ascended
      percentage: 100
    };
  }
  
  const current = soulEnergy - milestone.min;
  const total = milestone.max - milestone.min;
  const percentage = Math.min(100, (current / total) * 100);
  
  return { current, total, percentage };
}
