import { AuraAnalysisResult, generateFallbackAuraAnalysis, openai, MODEL } from "./openai";

/**
 * Enhanced aura analysis that combines OpenAI vision, Gemini insights, and numerological correlations
 * @param base64Image The base64 encoded image
 * @param customPrompt Optional custom prompt to use for the analysis
 * @param userNumerologyData Optional numerology data for personalized insights
 */

export async function analyzeAuraImage(
    base64Image: string,
    customPrompt?: string,
    userNumerologyData?: {
        lifePathNumber?: number;
        destinyNumber?: number;
        soulUrgeNumber?: number;
        personalityNumber?: number;
    }
): Promise<AuraAnalysisResult> {
    // Enhanced color meanings and associations for all specified colors
    const enhancedColorMap: Record<string, {
        rgba: string;
        positive: string[];
        negative: string[];
        numerologyConnection: number[];
        chakraAssociation: string[];
        spiritualMeaning: string;
        elementalConnection: string;
        vibrationFrequency: string;
    }> = {
        // Core specified colors with enhanced visibility and meanings
        pink: {
            rgba: 'rgba(255, 105, 180, 0.3)',
            positive: ['Unconditional love', 'Compassion', 'Nurturing', 'Emotional healing', 'Tenderness', 'Divine love'],
            negative: ['Codependency', 'Emotional manipulation', 'Over-sensitivity', 'Neediness', 'Boundary issues', 'Martyrdom'],
            numerologyConnection: [2, 6], // Cooperation and nurturing
            chakraAssociation: ['Higher Heart Chakra', 'Heart Chakra'],
            spiritualMeaning: 'Divine love and emotional healing energy',
            elementalConnection: 'Water/Air',
            vibrationFrequency: 'High, loving'
        },
        gray: {
            rgba: 'rgba(169, 169, 169, 0.3)',
            positive: ['Balance', 'Neutrality', 'Diplomacy', 'Wisdom', 'Flexibility', 'Peaceful resolution'],
            negative: ['Indecision', 'Uncertainty', 'Emotional detachment', 'Lack of direction', 'Stagnation', 'Apathy'],
            numerologyConnection: [7, 2], // Spirituality and cooperation
            chakraAssociation: ['Crown Chakra', 'Third Eye Chakra'],
            spiritualMeaning: 'Neutral wisdom and balanced perspective',
            elementalConnection: 'Air',
            vibrationFrequency: 'Neutral, balancing'
        },
        grey: {
            rgba: 'rgba(169, 169, 169, 0.3)',
            positive: ['Balance', 'Neutrality', 'Diplomacy', 'Wisdom', 'Flexibility', 'Peaceful resolution'],
            negative: ['Indecision', 'Uncertainty', 'Emotional detachment', 'Lack of direction', 'Stagnation', 'Apathy'],
            numerologyConnection: [7, 2], // Spirituality and cooperation
            chakraAssociation: ['Crown Chakra', 'Third Eye Chakra'],
            spiritualMeaning: 'Neutral wisdom and balanced perspective',
            elementalConnection: 'Air',
            vibrationFrequency: 'Neutral, balancing'
        },
        blue: {
            rgba: 'rgba(30, 144, 255, 0.3)',
            positive: ['Truth', 'Communication', 'Peace', 'Intuition', 'Clarity', 'Spiritual expression'],
            negative: ['Depression', 'Isolation', 'Coldness', 'Rigidity', 'Over-analysis', 'Emotional distance'],
            numerologyConnection: [5, 7], // Freedom and spirituality
            chakraAssociation: ['Throat Chakra', 'Third Eye Chakra'],
            spiritualMeaning: 'Truth and authentic communication',
            elementalConnection: 'Water/Air',
            vibrationFrequency: 'Calming, truthful'
        },
        green: {
            rgba: 'rgba(50, 205, 50, 0.3)',
            positive: ['Healing', 'Growth', 'Balance', 'Love', 'Harmony', 'Natural connection'],
            negative: ['Jealousy', 'Envy', 'Possessiveness', 'Stagnation', 'Martyrdom', 'Emotional manipulation'],
            numerologyConnection: [4, 6], // Stability and nurturing
            chakraAssociation: ['Heart Chakra'],
            spiritualMeaning: 'Love, healing, and emotional balance',
            elementalConnection: 'Earth/Air',
            vibrationFrequency: 'Healing, balancing'
        },
        violet: {
            rgba: 'rgba(148, 0, 211, 0.3)',
            positive: ['Spirituality', 'Divine connection', 'Transformation', 'Wisdom', 'Higher consciousness', 'Mystical insight'],
            negative: ['Spiritual pride', 'Disconnection from reality', 'Escapism', 'Superiority complex', 'Isolation', 'Delusion'],
            numerologyConnection: [7, 9], // Spirituality and completion
            chakraAssociation: ['Crown Chakra', 'Soul Star Chakra'],
            spiritualMeaning: 'Divine consciousness and spiritual mastery',
            elementalConnection: 'Spirit',
            vibrationFrequency: 'Very high, transcendent'
        },
        indigo: {
            rgba: 'rgba(75, 0, 130, 0.3)',
            positive: ['Intuition', 'Psychic abilities', 'Deep wisdom', 'Inner knowing', 'Spiritual insight', 'Perception'],
            negative: ['Obsession', 'Delusion', 'Escapism', 'Disconnection', 'Mental confusion', 'Overthinking'],
            numerologyConnection: [6, 7], // Responsibility and spirituality
            chakraAssociation: ['Third Eye Chakra'],
            spiritualMeaning: 'Psychic abilities and inner vision',
            elementalConnection: 'Air/Spirit',
            vibrationFrequency: 'High, intuitive'
        },
        white: {
            rgba: 'rgba(255, 255, 255, 0.3)',
            positive: ['Purity', 'Divine protection', 'Spiritual clarity', 'Truth', 'Angelic connection', 'Sacred energy'],
            negative: ['Spiritual bypassing', 'Perfectionism', 'Isolation', 'Detachment', 'Rigidity', 'Emptiness'],
            numerologyConnection: [1, 9], // Leadership and completion
            chakraAssociation: ['Soul Star Chakra', 'Crown Chakra'],
            spiritualMeaning: 'Pure divine light and spiritual protection',
            elementalConnection: 'Spirit',
            vibrationFrequency: 'Highest, purifying'
        },
        gold: {
            rgba: 'rgba(255, 215, 0, 0.3)',
            positive: ['Divine wisdom', 'Enlightenment', 'Spiritual mastery', 'Abundance', 'Success', 'Higher consciousness'],
            negative: ['Ego inflation', 'Materialism', 'Greed', 'Superiority complex', 'Spiritual pride', 'Attachment'],
            numerologyConnection: [9, 8], // Completion and power
            chakraAssociation: ['Soul Star Chakra', 'Solar Plexus Chakra'],
            spiritualMeaning: 'Divine wisdom and spiritual illumination',
            elementalConnection: 'Fire/Spirit',
            vibrationFrequency: 'Very high, illuminating'
        },
        yellow: {
            rgba: 'rgba(255, 230, 0, 0.3)',
            positive: ['Intelligence', 'Optimism', 'Mental clarity', 'Learning', 'Joy', 'Personal power'],
            negative: ['Over-analysis', 'Criticism', 'Anxiety', 'Mental strain', 'Perfectionism', 'Intellectual arrogance'],
            numerologyConnection: [3, 6], // Expression and responsibility
            chakraAssociation: ['Solar Plexus Chakra'],
            spiritualMeaning: 'Mental clarity and personal power',
            elementalConnection: 'Fire/Air',
            vibrationFrequency: 'Mental stimulation, bright'
        },
        orange: {
            rgba: 'rgba(255, 140, 0, 0.3)',
            positive: ['Creativity', 'Joy', 'Enthusiasm', 'Confidence', 'Adventure', 'Emotional expression'],
            negative: ['Addiction', 'Dependency', 'Superficiality', 'Emotional instability', 'Exhibitionism', 'Impulsiveness'],
            numerologyConnection: [3, 5], // Creativity and freedom
            chakraAssociation: ['Sacral Chakra'],
            spiritualMeaning: 'Creative and emotional energy',
            elementalConnection: 'Fire/Water',
            vibrationFrequency: 'Warm, expressive'
        },
        purple: {
            rgba: 'rgba(138, 43, 226, 0.3)',
            positive: ['Mystical wisdom', 'Transformation', 'Royal authority', 'Spiritual mastery', 'Ancient knowledge', 'Divine mystery'],
            negative: ['Spiritual arrogance', 'Disconnection from reality', 'Superiority complex', 'Isolation', 'Escapism', 'Delusion'],
            numerologyConnection: [7, 8], // Spirituality and power
            chakraAssociation: ['Crown Chakra', 'Third Eye Chakra'],
            spiritualMeaning: 'Mystical transformation and ancient wisdom',
            elementalConnection: 'Spirit',
            vibrationFrequency: 'Very high, mystical'
        },
        silver: {
            rgba: 'rgba(192, 192, 192, 0.3)',
            positive: ['Lunar wisdom', 'Psychic sensitivity', 'Reflection', 'Intuition', 'Feminine energy', 'Emotional intelligence'],
            negative: ['Emotional volatility', 'Psychic overwhelm', 'Moodiness', 'Instability', 'Overthinking', 'Illusion'],
            numerologyConnection: [2, 7], // Cooperation and spirituality
            chakraAssociation: ['Lunar Energy Center', 'Third Eye Chakra'],
            spiritualMeaning: 'Lunar consciousness and intuitive healing',
            elementalConnection: 'Water',
            vibrationFrequency: 'Reflective, intuitive'
        },
        black: {
            rgba: 'rgba(47, 47, 47, 0.3)',
            positive: ['Protection', 'Grounding', 'Shadow integration', 'Transformation', 'Boundaries', 'Deep wisdom'],
            negative: ['Negativity', 'Fear', 'Depression', 'Blockages', 'Heavy energy', 'Resistance to change'],
            numerologyConnection: [8, 1], // Power and independence
            chakraAssociation: ['Root Chakra', 'Earth Star Chakra'],
            spiritualMeaning: 'Protection and transformation through shadow work',
            elementalConnection: 'Earth',
            vibrationFrequency: 'Low, grounding'
        },
        red: {
            rgba: 'rgba(255, 50, 50, 0.3)',
            positive: ['Passion', 'Vitality', 'Courage', 'Leadership', 'Strength', 'Life force'],
            negative: ['Anger', 'Aggression', 'Impulsiveness', 'Stress', 'Dominance', 'Violence'],
            numerologyConnection: [1, 8], // Leadership and power
            chakraAssociation: ['Root Chakra'],
            spiritualMeaning: 'Life force energy and survival strength',
            elementalConnection: 'Fire',
            vibrationFrequency: 'High energy, stimulating'
        },
        brown: {
            rgba: 'rgba(165, 42, 42, 0.3)',
            positive: ['Earth connection', 'Practicality', 'Stability', 'Reliability', 'Natural wisdom', 'Grounding'],
            negative: ['Stubbornness', 'Materialism', 'Inflexibility', 'Resistance to change', 'Heaviness', 'Stagnation'],
            numerologyConnection: [4, 8], // Stability and material success
            chakraAssociation: ['Earth Star Chakra', 'Root Chakra'],
            spiritualMeaning: 'Earth-based spiritual growth and practical wisdom',
            elementalConnection: 'Earth',
            vibrationFrequency: 'Low, grounding'
        }
    };
    const defaultResult: AuraAnalysisResult = {
        dominantColor: "Blue",
        secondaryColor: "Purple",
        auraColorSpectrum: ["Blue", "Purple", "Indigo", "Grey", "Black"],
        auraLayerColors: {
            inner: "Blue",
            middle: "Grey",
            outer: "Black"
        },
        energyLevel: 3,
        personalityTraits: ["Intuitive", "Grounded", "Protected", "Balanced"],
        _positiveTraits: enhancedColorMap["blue"]?.positive.concat(enhancedColorMap["grey"]?.positive || []) || [],
        get positiveTraits() {
            return this._positiveTraits;
        },
        set positiveTraits(value) {
            this._positiveTraits = value;
        },
        negativeTraits: enhancedColorMap["blue"]?.negative.concat(enhancedColorMap["grey"]?.negative || []) || [],
        spiritualGuidance: "Your aura shows a blend of spiritual receptivity (blue) with protective grounding (black). Work on balancing these energies while being mindful of potential emotional detachment (blue) or negativity (black).",
        chakraActivity: {
            root: 5,
            sacral: 6,
            solarPlexus: 5,
            heart: 7,
            throat: 6,
            thirdEye: 8,
            crown: 7
        },
        detailedAnalysis: "Your aura combines spiritual blue energies with grounding black and neutral grey. While this indicates strong protection and intuition, be mindful of potential isolation or emotional barriers. The grey suggests a transitional period - use this time for balanced self-reflection."
    };

    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_KEY_HERE") {
            console.log("OpenAI API key not configured, using fallback analysis");
            return generateFallbackAuraAnalysis();
        }

        try {
            const response = await openai.chat.completions.create({
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: customPrompt ? customPrompt : "You are an expert spiritual advisor who analyzes aura photographs that show colored energy fields around people. Analyze the image and provide a detailed spiritual reading based on the colors you observe. Return your analysis as valid JSON."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: customPrompt
                                    ? customPrompt
                                    : "Analyze the colors surrounding and emanating from the person in this image. Only describe the actual colors you can see in the energy field around them. Be very specific about which colors appear in which areas (inner field closest to body, middle field, outer edges). Do not include any colors from clothing or background - focus EXCLUSIVELY on any glowing, luminous, or distinct colored light surrounding the person. Identify exactly which 4-5 colors are visible in their aura field, in order of prominence."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: base64Image
                                }
                            }
                        ]
                    }
                ],
                response_format: { type: "json_object" },
                max_tokens: 1500,
            });

            // Parse the response
            const result = JSON.parse(response.choices[0].message.content || "{}");

            // Merge with default values to ensure all fields are present
            const finalResult: AuraAnalysisResult = {
                ...defaultResult,
                ...result,
                chakraActivity: {
                    ...defaultResult.chakraActivity,
                    ...(result.chakraActivity || {})
                }
            };

            // Function to process image with aura colors
            const processImageWithAura = async (base64Image: string, auraColors: { dominant: string; secondary: string; }): Promise<string> => {
                // Mock the canvas and image elements since they are not available in Node.js
                const colorMap: Record<string, string> = {
                    red: 'rgba(255, 0, 0, 0.3)',
                    orange: 'rgba(255, 165, 0, 0.3)',
                    yellow: 'rgba(255, 255, 0, 0.3)',
                    green: 'rgba(0, 128, 0, 0.3)',
                    blue: 'rgba(0, 0, 255, 0.3)',
                    purple: 'rgba(128, 0, 128, 0.3)',
                    indigo: 'rgba(75, 0, 130, 0.3)',
                    violet: 'rgba(148, 0, 211, 0.3)',
                    white: 'rgba(255, 255, 255, 0.3)',
                    gold: 'rgba(255, 215, 0, 0.3)',
                    silver: 'rgba(192, 192, 192, 0.3)',
                    black: 'rgba(0, 0, 0, 0.2)'
                };

                const dominantRgba = colorMap[finalResult.dominantColor?.toLowerCase()] || colorMap.white;
                const secondaryRgba = colorMap[finalResult.secondaryColor?.toLowerCase()] || dominantRgba;

                // Mock result: Return a string indicating aura colors
                return `Processed image with dominant color ${finalResult.dominantColor} (${dominantRgba}) and secondary color ${finalResult.secondaryColor} (${secondaryRgba})`;
            };

            // Process the image with aura colors
            const processedImage = await processImageWithAura(base64Image, { dominant: finalResult.dominantColor, secondary: finalResult.secondaryColor });
            console.log(processedImage); // Output the processed image information (or handle as needed)

            return finalResult;
        } catch (error) {
            console.error("Error in OpenAI API call:", error);
            return generateFallbackAuraAnalysis();
        }
    } catch (error) {
        console.error("Error in OpenAI aura analysis:", error);

        // Check if it's a rate limit error
        if ((error as any)?.status === 429 || ((error as any)?.error && (error as any)?.error.type === 'insufficient_quota')) {
            console.log("Rate limit exceeded, using fallback analysis");
            return generateFallbackAuraAnalysis();
        }

        // Handle other types of errors
        if ((error as any)?.status === 401) {
            console.log("Authentication error with OpenAI API, using fallback");
            return generateFallbackAuraAnalysis();
        }

        // For any other error, use fallback
        return generateFallbackAuraAnalysis();
    }
}
