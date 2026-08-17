export function getSoulTreeImage(growthPercentage: number): string {
  const growthIndex = Math.floor(growthPercentage / 10);
  
  const treeImages = [
    "/attached_assets/unnamed (14)_1763058572714.jpg",
    "/attached_assets/IMG-20251112-WA0026_1763058572731.jpg",
    "/attached_assets/IMG-20251112-WA0025_1763058572741.jpg",
    "/attached_assets/unnamed (5)_1763058572750.jpg",
    "/attached_assets/unnamed (7)_1763058572765.jpg",
    "/attached_assets/unnamed (9)_1763058572774.jpg",
    "/attached_assets/unnamed (10)_1763058572783.jpg",
    "/attached_assets/unnamed (11)_1763058572793.jpg",
    "/attached_assets/unnamed (12)_1763058572802.jpg",
    "/attached_assets/unnamed (13)_1763058572811.jpg",
  ];
  
  const clampedIndex = Math.min(Math.max(0, growthIndex), treeImages.length - 1);
  
  return treeImages[clampedIndex];
}
