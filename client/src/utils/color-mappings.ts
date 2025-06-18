// Consolidated color utilities for aura analysis
export const getAccurateColorCode = (colorName: string): string => {
  const colorCodes: Record<string, string> = {
    'red': '#FF0000', 'Red': '#FF0000',
    'orange': '#FFA500', 'Orange': '#FFA500',
    'yellow': '#FFFF00', 'Yellow': '#FFFF00',
    'green': '#00FF00', 'Green': '#00FF00',
    'blue': '#0000FF', 'Blue': '#0000FF',
    'purple': '#800080', 'Purple': '#800080',
    'pink': '#FFC0CB', 'Pink': '#FFC0CB',
    'white': '#FFFFFF', 'White': '#FFFFFF',
    'black': '#000000', 'Black': '#000000',
    'brown': '#A52A2A', 'Brown': '#A52A2A',
    'gray': '#808080', 'Gray': '#808080', 'grey': '#808080', 'Grey': '#808080',
    'silver': '#C0C0C0', 'Silver': '#C0C0C0',
    'gold': '#FFD700', 'Gold': '#FFD700',
    'turquoise': '#40E0D0', 'Turquoise': '#40E0D0',
    'teal': '#008080', 'Teal': '#008080',
    'peach': '#FFCBA4', 'Peach': '#FFCBA4',
    'lavender': '#E6E6FA', 'Lavender': '#E6E6FA',
    'indigo': '#4B0082', 'Indigo': '#4B0082',
    'violet': '#8A2BE2', 'Violet': '#8A2BE2',
    'crimson': '#DC143C', 'Crimson': '#DC143C',
    'magenta': '#FF00FF', 'Magenta': '#FF00FF',
    'cyan': '#00FFFF', 'Cyan': '#00FFFF',
    'lime': '#00FF00', 'Lime': '#00FF00',
    'maroon': '#800000', 'Maroon': '#800000',
    'navy': '#000080', 'Navy': '#000080',
    'olive': '#808000', 'Olive': '#808000',
    'coral': '#FF7F50', 'Coral': '#FF7F50',
    'mint': '#98FB98', 'Mint': '#98FB98',
    'rose': '#FF69B4', 'Rose': '#FF69B4',
    'amber': '#FFBF00', 'Amber': '#FFBF00',
    'skyblue': '#87CEEB', 'SkyBlue': '#87CEEB', 'Sky Blue': '#87CEEB'
  };
  return colorCodes[colorName] || '#800080';
};

export const getColorChakra = (color: string): string => {
  const chakraMap: Record<string, string> = {
    'Red': 'Root Chakra - Grounding and vitality',
    'Orange': 'Sacral Chakra - Creativity and passion',
    'Yellow': 'Solar Plexus - Personal power and confidence',
    'Green': 'Heart Chakra - Love and healing',
    'Blue': 'Throat Chakra - Communication and truth',
    'Indigo': 'Third Eye - Intuition and wisdom',
    'Violet': 'Crown Chakra - Spiritual connection',
    'Purple': 'Crown Chakra - Higher consciousness',
    'Pink': 'Heart Chakra - Unconditional love',
    'White': 'Soul Star - Divine connection',
    'Gold': 'Higher consciousness - Wisdom',
    'Silver': 'Lunar energy - Intuition'
  };
  return chakraMap[color] || 'Unique energy signature';
};

export const getColorMeaning = (color: string): string => {
  const meanings: Record<string, string> = {
    'Red': 'Passionate life force and dynamic energy',
    'Orange': 'Creative expression and joyful enthusiasm',
    'Yellow': 'Mental clarity and intellectual power',
    'Green': 'Healing love and balanced harmony',
    'Blue': 'Peaceful wisdom and truthful communication',
    'Indigo': 'Psychic intuition and deep insight',
    'Violet': 'Spiritual connection and divine wisdom',
    'Purple': 'Mystical knowledge and magical power',
    'Pink': 'Unconditional love and emotional healing',
    'White': 'Pure light and divine protection',
    'Gold': 'Enlightened wisdom and spiritual mastery',
    'Silver': 'Lunar intuition and reflective wisdom',
    'Turquoise': 'Healing communication and emotional clarity',
    'Black': 'Transformative power and deep wisdom',
    'Brown': 'Grounding stability and earth connection'
  };
  return meanings[color] || 'Unique spiritual frequency';
};

export const getEnergyPattern = (primary: string, secondary: string): string => {
  const patterns: Record<string, string> = {
    'Red-Blue': 'Fire-water balance: passionate action with calm wisdom',
    'Red-Green': 'Fire-earth harmony: vital force through healing energy',
    'Blue-Green': 'Water-earth flow: peaceful wisdom with healing love',
    'Yellow-Purple': 'Mind-spirit connection: intellectual clarity with divine wisdom',
    'Orange-Pink': 'Creative-heart blend: artistic expression with loving compassion'
  };
  
  const key1 = `${primary}-${secondary}`;
  const key2 = `${secondary}-${primary}`;
  
  return patterns[key1] || patterns[key2] || `${primary} and ${secondary} create a unique energetic balance`;
};