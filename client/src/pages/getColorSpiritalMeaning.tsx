// Helper functions for enhanced spiritual guidance
const getColorSpiritalMeaning = (color: string): string => {
    const meanings: Record<string, string> = {
        'Red': 'Root chakra energy representing grounding, survival instincts, and life force. This color indicates strong willpower, passion, and connection to earth energy.',
        'Orange': 'Sacral chakra energy embodying creativity, sexuality, and emotional flow. This vibrant frequency enhances artistic expression and emotional healing.',
        'Yellow': 'Solar plexus energy radiating personal power, confidence, and mental clarity. This golden light strengthens willpower and intellectual abilities.',
        'Green': 'Heart chakra energy emanating love, healing, and compassion. This healing frequency promotes emotional balance and natural healing abilities.',
        'Blue': 'Throat chakra energy facilitating communication, truth, and spiritual expression. This calming frequency enhances authentic self-expression.',
        'Indigo': 'Third eye chakra energy opening intuition, psychic abilities, and spiritual insight. This mystical frequency develops inner wisdom and perception.',
        'Violet': 'Crown chakra energy connecting to divine consciousness and spiritual enlightenment. This highest frequency represents spiritual mastery.',
        "_Pink": 'Divine love and emotional healing. This gentle frequency promotes unconditional love and emotional nurturing.',
        get "Pink"() {
            return this["_Pink"];
        },
        set "Pink"(value) {
            this["_Pink"] = value;
        },
        'Gold': 'Divine wisdom and spiritual illumination. This sacred frequency represents enlightened consciousness and spiritual mastery.',
        'White': 'Pure divine light and spiritual protection. This pristine frequency indicates angelic connection and spiritual purity.',
        'Silver': 'Lunar energy and psychic sensitivity. This reflective frequency enhances intuitive abilities and emotional receptivity.',
        'black': 'Shadow work and transformative energy. This deep frequency represents deep spiritual integration and shadow healing.',
        'grey': 'Neutral balance and adaptable wisdom. This balanced frequency indicates wise neutrality and peaceful resolution.',
        'brown': 'Earth connection and grounding stability. This practical frequency represents natural wisdom and earth-based spiritual growth.',
    };
    return meanings[color] || 'This unique aura color carries special spiritual significance and represents your individual soul expression.';
};
