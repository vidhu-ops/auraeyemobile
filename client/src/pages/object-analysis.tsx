import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import { Loader2, Upload, Crown, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/forms/image-upload";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

interface ObjectAnalysisResult {
  objectName: string;
  objectDescription: string;
  objectPurpose: string;
  auraColor: string;
  auraDescription: string;
  energyLevel: number;
  energyQualities: string[];
  historicalSignificance?: string;
  spiritualSignificance?: string;
  detailedAnalysis: string;
}

export default function ObjectAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showPremiumModal } = usePremium();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ObjectAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("Initializing object scanning...");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handlePremiumUpgrade = () => {
    showPremiumModal("general");
  };

  // Function to get CSS filter for aura color overlay
  const getAuraFilter = (auraColor: string): string => {
    const colorFilters: { [key: string]: string } = {
      'red': 'sepia(100%) saturate(200%) hue-rotate(0deg) brightness(1.1)',
      'blue': 'sepia(100%) saturate(200%) hue-rotate(220deg) brightness(1.1)',
      'green': 'sepia(100%) saturate(200%) hue-rotate(90deg) brightness(1.1)',
      'yellow': 'sepia(100%) saturate(200%) hue-rotate(50deg) brightness(1.2)',
      'purple': 'sepia(100%) saturate(200%) hue-rotate(270deg) brightness(1.1)',
      'orange': 'sepia(100%) saturate(200%) hue-rotate(25deg) brightness(1.2)',
      'pink': 'sepia(100%) saturate(150%) hue-rotate(320deg) brightness(1.2)',
      'violet': 'sepia(100%) saturate(200%) hue-rotate(260deg) brightness(1.1)',
      'indigo': 'sepia(100%) saturate(200%) hue-rotate(240deg) brightness(1.0)',
      'gold': 'sepia(90%) saturate(90%) hue-rotate(10deg) brightness(1.2)',
      'silver': 'grayscale(30%) brightness(1.2) contrast(110%)',
      'turquoise': 'sepia(100%) saturate(200%) hue-rotate(180deg) brightness(1.2)',
      'magenta': 'sepia(100%) saturate(200%) hue-rotate(300deg) brightness(1.1)'
    };
    
    return colorFilters[auraColor.toLowerCase()] || 'sepia(20%) saturate(70%) hue-rotate(150deg) brightness(1.3)';
  };

  // Function to get hex color for aura overlay
  const getAuraColorHex = (auraColor: string): string => {
    const colorMap: { [key: string]: string } = {
      'red': '#FF0000', 'blue': '#0000FF', 'green': '#00FF00',
      'yellow': '#FFFF00', 'purple': '#800080', 'orange': '#FFA500',
      'pink': '#FFC0CB', 'violet': '#8A2BE2', 'indigo': '#4B0082',
      'gold': '#FFD700', 'silver': '#C0C0C0', 'white': '#FFFFFF',
      'black': '#000000', 'turquoise': '#40E0D0', 'magenta': '#FF00FF'
    };
    return colorMap[auraColor.toLowerCase()] || '#800080';
  };

  // Function to detect faces in uploaded images
  const detectFaces = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        
        if (imageData) {
          const data = imageData.data;
          let skinPixels = 0;
          let facePatternPixels = 0;
          let totalPixels = data.length / 4;
          
          // More precise face detection focusing on typical face patterns
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Stricter skin tone detection - must meet multiple criteria
            const skinTone1 = r > 120 && g > 80 && b > 60 && r > g && r > b && 
                             Math.abs(r - g) > 20 && Math.abs(r - b) > 30;
            const skinTone2 = r > 240 && g > 220 && b > 180 && r - g < 30 && r - b < 80; // Very light skin
            const skinTone3 = r > 110 && r < 140 && g > 80 && g < 110 && b > 60 && b < 90 && 
                             r > g && r > b; // Medium skin with strict bounds
            
            // Face pattern detection (areas with consistent skin tone clusters)
            if (skinTone1 || skinTone2 || skinTone3) {
              skinPixels++;
              
              // Check for face-like patterns (consecutive skin pixels in rows/columns)
              const pixelIndex = Math.floor(i / 4);
              const x = pixelIndex % canvas.width;
              const y = Math.floor(pixelIndex / canvas.width);
              
              // Check for horizontal and vertical skin tone continuity (face feature pattern)
              let horizontalSkin = 0;
              let verticalSkin = 0;
              
              // Check 5 pixels horizontally
              for (let dx = -2; dx <= 2; dx++) {
                const checkX = x + dx;
                if (checkX >= 0 && checkX < canvas.width) {
                  const checkIndex = (y * canvas.width + checkX) * 4;
                  const checkR = data[checkIndex];
                  const checkG = data[checkIndex + 1];
                  const checkB = data[checkIndex + 2];
                  
                  if ((checkR > 120 && checkG > 80 && checkB > 60 && checkR > checkG && checkR > checkB) ||
                      (checkR > 240 && checkG > 220 && checkB > 180) ||
                      (checkR > 110 && checkR < 140 && checkG > 80 && checkG < 110 && checkB > 60 && checkB < 90)) {
                    horizontalSkin++;
                  }
                }
              }
              
              // Check 5 pixels vertically
              for (let dy = -2; dy <= 2; dy++) {
                const checkY = y + dy;
                if (checkY >= 0 && checkY < canvas.height) {
                  const checkIndex = (checkY * canvas.width + x) * 4;
                  const checkR = data[checkIndex];
                  const checkG = data[checkIndex + 1];
                  const checkB = data[checkIndex + 2];
                  
                  if ((checkR > 120 && checkG > 80 && checkB > 60 && checkR > checkG && checkR > checkB) ||
                      (checkR > 240 && checkG > 220 && checkB > 180) ||
                      (checkR > 110 && checkR < 140 && checkG > 80 && checkG < 110 && checkB > 60 && checkB < 90)) {
                    verticalSkin++;
                  }
                }
              }
              
              // If we have significant skin continuity in both directions, it's likely a face region
              if (horizontalSkin >= 3 && verticalSkin >= 3) {
                facePatternPixels++;
              }
            }
          }
          
          // More restrictive thresholds - require both high skin percentage AND face patterns
          const skinRatio = skinPixels / totalPixels;
          const facePatternRatio = facePatternPixels / totalPixels;
          
          // Only flag as face if we have significant skin area AND face-like patterns
          const hasFace = skinRatio > 0.15 && facePatternRatio > 0.03;
          resolve(hasFace);
        } else {
          resolve(false);
        }
      };
      
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setOriginalImage(null);
    setProcessedImage(null);
    setAnalysisProgress(0);
    setAnalysisStage("Checking image content...");

    try {
      // Check for human faces first
      setAnalysisProgress(10);
      setAnalysisStage("Scanning for human faces...");
      
      const hasFaces = await detectFaces(file);
      
      if (hasFaces) {
        setIsAnalyzing(false);
        toast({
          title: "Human Face Detected",
          description: "Object analysis is designed for inanimate objects only. Please upload an image without human faces.",
          variant: "destructive",
        });
        return;
      }

      setAnalysisProgress(20);
      setAnalysisStage("Initializing object scanning...");

      // Store original image
      const imageUrl = URL.createObjectURL(file);
      setOriginalImage(imageUrl);

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          
          const increment = Math.random() * 10;
          const newProgress = prev + increment > 95 ? 95 : prev + increment;
          
          // Update the analysis stage based on progress
          if (newProgress > 20 && newProgress <= 40) {
            setAnalysisStage("Identifying object characteristics...");
          } else if (newProgress > 40 && newProgress <= 60) {
            setAnalysisStage("Detecting energy patterns...");
          } else if (newProgress > 60 && newProgress <= 80) {
            setAnalysisStage("Analyzing object aura...");
          } else if (newProgress > 80) {
            setAnalysisStage("Finalizing analysis...");
          }
          
          return newProgress;
        });
      }, 800);

      // Create form data for file upload
      const formData = new FormData();
      formData.append("image", file);

      // Send to API
      const response = await fetch("/api/analyze-object", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: ObjectAnalysisResult = await response.json();
      setResult(data);
      setAnalysisProgress(100);
      setActiveTab("basic");

      // Set processed image immediately with aura overlay effect
      setProcessedImage(imageUrl);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed the object: ${data.objectName}`,
      });
    } catch (error) {
      console.error("Error analyzing object:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced color meanings for aura analysis
  const getEnhancedColorMeaning = (color: string): string => {
    const colorMeanings: Record<string, string> = {
      "Purple": "Purple in an object's aura represents profound spiritual transformation, divine wisdom, and connection to higher realms. This color indicates the object carries ancient knowledge, mystical properties, and serves as a bridge between physical and spiritual dimensions. Purple energy suggests the object enhances intuition, meditation practices, and spiritual awakening.",
      "Red": "Red aura energy signifies powerful life force, grounding strength, and physical vitality. Objects with red auras possess intense energy that stimulates action, courage, and survival instincts. This color indicates strong connection to Earth elements and material world manifestation.",
      "Orange": "Orange aura represents creative expression, emotional healing, and personal power. Objects carrying orange energy enhance artistic abilities, emotional balance, and sacred sexuality. This vibration supports creative projects and emotional transformation.",
      "Yellow": "Yellow aura embodies mental clarity, intellectual power, and solar energy. Objects with yellow vibrations enhance learning, memory, communication, and personal confidence. This color indicates connection to solar plexus chakra and mental empowerment.",
      "Green": "Green aura signifies heart healing, natural harmony, and abundance manifestation. Objects with green energy promote emotional healing, nature connection, prosperity, and unconditional love. This vibration supports heart chakra opening and emotional balance.",
      "Blue": "Blue aura represents divine communication, truth expression, and peaceful wisdom. Objects carrying blue energy enhance clear communication, spiritual teaching, and throat chakra activation. This color indicates connection to divine truth and peaceful expression.",
      "Indigo": "Indigo aura embodies psychic abilities, deep intuition, and third eye activation. Objects with indigo energy enhance clairvoyance, spiritual seeing, and intuitive knowledge. This vibration supports mystical experiences and inner knowing.",
      "Pink": "Pink aura signifies unconditional love, emotional healing, and heart chakra opening. Objects with pink energy promote self-love, compassion, and emotional nurturing. This color indicates divine feminine energy and heart healing properties.",
      "White": "White aura represents pure divine energy, spiritual protection, and cosmic consciousness. Objects carrying white energy provide spiritual cleansing, divine connection, and energetic purification. This vibration indicates highest spiritual attunement.",
      "Black": "Black aura signifies protective energy, mystery, and deep transformation. Objects with black energy provide psychic protection, absorb negative energies, and facilitate shadow work. This color indicates powerful grounding and protective properties.",
      "Gold": "Gold aura embodies divine wisdom, spiritual mastery, and enlightened consciousness. Objects with gold energy enhance spiritual teaching, divine connection, and wisdom transmission. This vibration indicates advanced spiritual development.",
      "Silver": "Silver aura represents lunar energy, psychic sensitivity, and emotional intuition. Objects carrying silver energy enhance psychic abilities, dream work, and emotional clarity. This color indicates connection to lunar cycles and feminine wisdom."
    };
    return colorMeanings[color] || colorMeanings["Purple"];
  };

  const getColorPositiveTraits = (color: string): string => {
    const positiveTraits: Record<string, string> = {
      "Purple": "Enhances spiritual awareness, deepens meditation practice, amplifies intuitive abilities, connects to divine guidance, promotes mystical experiences",
      "Red": "Increases physical vitality, strengthens willpower, enhances survival instincts, promotes courage, grounds excess energy",
      "Orange": "Stimulates creativity, balances emotions, enhances personal power, supports artistic expression, promotes emotional healing",
      "Yellow": "Boosts mental clarity, enhances communication, increases confidence, supports learning, amplifies personal power",
      "Green": "Opens heart chakra, promotes healing, attracts abundance, enhances compassion, connects to nature",
      "Blue": "Enhances communication, promotes truth, brings peace, supports teaching, activates throat chakra",
      "Indigo": "Amplifies psychic abilities, enhances intuition, supports spiritual seeing, deepens meditation, activates third eye",
      "Pink": "Promotes self-love, enhances compassion, supports emotional healing, opens heart, brings nurturing energy",
      "White": "Provides spiritual protection, purifies energy, connects to divine, enhances clarity, promotes peace",
      "Black": "Offers psychic protection, absorbs negativity, supports transformation, provides grounding, enhances mystery work",
      "Gold": "Enhances wisdom, promotes enlightenment, connects to divine mind, supports teaching, amplifies spiritual power",
      "Silver": "Enhances psychic sensitivity, supports dream work, amplifies intuition, connects to lunar energy, promotes emotional clarity"
    };
    return positiveTraits[color] || positiveTraits["Purple"];
  };

  const getColorEnergyProperties = (color: string): string => {
    const energyProperties: Record<string, string> = {
      "Purple": "High-frequency spiritual vibration, crown chakra activation, connects to cosmic consciousness, transmutes lower energies, facilitates spiritual awakening",
      "Red": "Root chakra activation, grounding earth energy, physical vitality boost, survival instinct enhancement, material manifestation",
      "Orange": "Sacral chakra activation, creative life force, emotional balance, sexual energy, artistic inspiration",
      "Yellow": "Solar plexus activation, mental energy amplification, confidence building, intellectual power, personal will enhancement",
      "Green": "Heart chakra opening, healing energy transmission, nature connection, abundance attraction, emotional equilibrium",
      "Blue": "Throat chakra activation, communication enhancement, truth vibration, peaceful energy, divine expression",
      "Indigo": "Third eye activation, psychic energy amplification, spiritual sight enhancement, intuitive knowing, mystical connection",
      "Pink": "Heart healing frequency, unconditional love vibration, emotional nurturing, compassion amplification, feminine divine energy",
      "White": "Highest spiritual frequency, divine protection energy, purification vibration, cosmic consciousness connection, spiritual clarity",
      "Black": "Protective energy absorption, grounding earth frequency, shadow integration, mystery exploration, transformative power",
      "Gold": "Divine wisdom frequency, enlightenment energy, spiritual mastery vibration, cosmic intelligence, advanced consciousness",
      "Silver": "Lunar frequency vibration, psychic enhancement energy, emotional intuition, feminine wisdom, dream consciousness"
    };
    return energyProperties[color] || energyProperties["Purple"];
  };

  // Enhanced energy influence functions
  const getEnvironmentalInfluence = (color: string): string => {
    const environmentalEffects: Record<string, string> = {
      "Purple": "Creates a sacred sanctuary atmosphere that elevates spiritual consciousness and transforms ordinary spaces into temples of higher wisdom. The purple energy field generates an electromagnetic frequency that opens portals to divine realms and facilitates deep meditative states.",
      "Red": "Infuses spaces with powerful life force energy that stimulates physical vitality and grounds scattered energies. Red vibrations create an atmosphere of strength, protection, and material manifestation while anchoring spiritual energies into physical reality.",
      "Orange": "Transforms environments into creative sanctuaries that inspire artistic expression and emotional healing. Orange energy fields encourage spontaneous creativity, dissolve emotional blockages, and create warm, nurturing atmospheres that support personal transformation.",
      "Yellow": "Illuminates spaces with solar consciousness that enhances mental clarity and intellectual pursuits. Yellow vibrations create learning environments that stimulate the mind, boost confidence, and facilitate clear communication and decision-making processes.",
      "Green": "Harmonizes environmental energies to create healing sanctuaries that promote heart-centered living. Green fields generate natural balance, emotional stability, and abundance consciousness while connecting spaces to the healing power of nature.",
      "Blue": "Establishes peaceful communication zones that promote truth, wisdom, and spiritual teaching. Blue energy creates calming atmospheres that facilitate honest dialogue, meditative contemplation, and connection to divine guidance.",
      "Indigo": "Opens psychic portals that enhance intuitive abilities and spiritual sight. Indigo vibrations create mystical environments that stimulate third eye activation, facilitate prophetic dreams, and connect spaces to cosmic consciousness.",
      "Pink": "Generates unconditional love fields that heal emotional wounds and open hearts. Pink energy creates nurturing environments that promote self-love, compassion, and emotional healing while dissolving fear-based patterns.",
      "White": "Purifies and sanctifies spaces with divine light that clears negative energies and elevates consciousness. White vibrations create temples of purity that facilitate spiritual cleansing, divine connection, and cosmic awareness.",
      "Black": "Creates protective energy shields that absorb negativity and facilitate shadow work. Black vibrations establish grounding sanctuaries that support deep transformation, mystery exploration, and psychic protection.",
      "Gold": "Establishes divine wisdom temples that facilitate spiritual teaching and enlightenment. Gold energy creates sacred spaces that enhance spiritual mastery, divine connection, and transmission of cosmic knowledge.",
      "Silver": "Generates lunar consciousness fields that enhance psychic abilities and emotional intuition. Silver vibrations create mystical environments that support dream work, psychic development, and feminine wisdom activation."
    };
    return environmentalEffects[color] || environmentalEffects["Purple"];
  };

  const getChakraInfluence = (color: string): string => {
    const chakraEffects: Record<string, string> = {
      "Purple": "Directly activates the crown chakra (Sahasrara) and soul star chakra, creating a powerful vortex of spiritual energy that connects to cosmic consciousness. This activation facilitates enlightenment experiences, divine downloads, and spiritual awakening processes.",
      "Red": "Powerfully stimulates the root chakra (Muladhara) and earth star chakra, creating strong grounding connections that anchor spiritual energies into physical reality. This activation enhances survival instincts, physical vitality, and material manifestation abilities.",
      "Orange": "Activates the sacral chakra (Svadhishthana) and creative centers, generating passionate life force energy that enhances creativity, sexuality, and personal power. This stimulation supports artistic expression and emotional healing processes.",
      "Yellow": "Energizes the solar plexus chakra (Manipura) and mental body centers, boosting personal power, confidence, and intellectual abilities. This activation enhances decision-making capabilities and mental clarity while strengthening personal will.",
      "Green": "Opens and balances the heart chakra (Anahata) and higher heart center, creating powerful healing energy that promotes love, compassion, and emotional balance. This activation facilitates heart-centered living and unconditional love expression.",
      "Blue": "Activates the throat chakra (Vishuddha) and communication centers, enhancing truth expression, clear communication, and spiritual teaching abilities. This stimulation supports authentic self-expression and divine truth transmission.",
      "Indigo": "Stimulates the third eye chakra (Ajna) and psychic centers, opening channels of intuitive knowing and spiritual sight. This activation enhances clairvoyance, prophetic abilities, and connection to cosmic wisdom.",
      "Pink": "Gently opens the heart chakra and higher heart center with divine feminine energy, promoting unconditional love, emotional healing, and compassion. This activation supports self-love development and heart wound healing.",
      "White": "Activates all chakras simultaneously with pure divine light, creating perfect energetic alignment and spiritual purification. This comprehensive activation facilitates cosmic consciousness and divine union experiences.",
      "Black": "Grounds and protects all chakra centers while facilitating deep shadow work and transformational processes. This protective activation supports spiritual evolution through darkness integration.",
      "Gold": "Illuminates the crown chakra and higher spiritual centers with divine wisdom, facilitating spiritual mastery and enlightenment experiences. This golden activation enhances spiritual teaching abilities and cosmic knowledge transmission.",
      "Silver": "Activates the sacral and third eye chakras with lunar feminine energy, enhancing psychic abilities, emotional intuition, and dream consciousness. This lunar activation supports feminine wisdom and psychic development."
    };
    return chakraEffects[color] || chakraEffects["Purple"];
  };

  const getEmotionalInfluence = (color: string): string => {
    const emotionalEffects: Record<string, string> = {
      "Purple": "Induces profound spiritual euphoria and transcendent states that elevate consciousness beyond ordinary emotional patterns. Creates feelings of divine connection, cosmic love, and mystical bliss while dissolving ego-based emotional reactions.",
      "Red": "Generates intense emotional energy that stimulates passion, courage, and vital life force. Enhances emotional strength, survival instincts, and physical confidence while grounding scattered emotional energies into focused action.",
      "Orange": "Promotes emotional healing and creative expression that dissolves blocked feelings and inspires artistic passion. Enhances emotional flexibility, personal power, and sacred sexuality while balancing masculine and feminine energies.",
      "Yellow": "Brightens mental outlook and emotional optimism while enhancing self-confidence and personal power. Stimulates joyful emotions, intellectual curiosity, and clear emotional communication while dissolving fear-based thought patterns.",
      "Green": "Creates emotional balance and heart-centered feelings that promote love, compassion, and healing. Enhances emotional stability, natural harmony, and abundance consciousness while dissolving heart wounds and fear patterns.",
      "Blue": "Induces peaceful emotional states that promote inner calm, truth, and spiritual serenity. Enhances emotional wisdom, clear communication, and peaceful resolution of conflicts while connecting to divine tranquility.",
      "Indigo": "Deepens emotional intuition and psychic sensitivity while enhancing spiritual emotional experiences. Promotes mystical feelings, prophetic emotions, and deep inner knowing while connecting to cosmic emotional wisdom.",
      "Pink": "Generates unconditional love feelings that heal emotional wounds and open hearts to compassion. Enhances self-love, emotional nurturing, and heart-centered living while dissolving fear, anger, and emotional pain.",
      "White": "Purifies emotional body and creates feelings of divine peace, spiritual clarity, and cosmic love. Enhances emotional purity, spiritual serenity, and connection to divine emotional states while clearing negative emotional patterns.",
      "Black": "Facilitates deep emotional transformation and shadow work that integrates suppressed feelings. Enhances emotional protection, mystery exploration, and transformational emotional processes while absorbing negative emotional energies.",
      "Gold": "Elevates emotions to divine wisdom states that transcend ordinary emotional patterns. Enhances feelings of spiritual mastery, divine love, and enlightened emotional expression while connecting to cosmic emotional intelligence.",
      "Silver": "Enhances emotional intuition and psychic emotional sensitivity while connecting to lunar emotional wisdom. Promotes empathic feelings, dream emotions, and feminine emotional knowing while balancing emotional polarities."
    };
    return emotionalEffects[color] || emotionalEffects["Purple"];
  };

  const getSpiritualInfluence = (color: string): string => {
    const spiritualEffects: Record<string, string> = {
      "Purple": "Accelerates spiritual awakening and facilitates direct communication with higher dimensional beings, spirit guides, and ascended masters. Enhances meditation practices, mystical experiences, and connection to divine wisdom while opening portals to cosmic consciousness.",
      "Red": "Grounds spiritual energies into physical reality and enhances manifestation of spiritual goals in material world. Supports earthly spiritual service, sacred activism, and integration of spiritual wisdom into daily life while maintaining strong connection to Earth energies.",
      "Orange": "Enhances spiritual creativity and sacred sexuality while promoting emotional healing on spiritual levels. Supports tantric practices, creative spiritual expression, and healing of spiritual wounds related to personal power and creative expression.",
      "Yellow": "Illuminates spiritual understanding and enhances spiritual communication abilities. Supports spiritual teaching, wisdom sharing, and mental clarity in spiritual studies while connecting to solar spiritual consciousness and divine illumination.",
      "Green": "Facilitates spiritual healing and connection to nature's wisdom while promoting heart-centered spirituality. Supports healing work, environmental spiritual practices, and abundance consciousness while connecting to Earth's spiritual energies.",
      "Blue": "Enhances spiritual communication and connection to divine truth while promoting peaceful spiritual practices. Supports spiritual teaching, truthful spiritual expression, and connection to divine wisdom while facilitating clear spiritual communication.",
      "Indigo": "Opens psychic spiritual abilities and facilitates deep spiritual sight and knowing. Supports mystical experiences, prophetic spiritual abilities, and connection to cosmic spiritual wisdom while enhancing spiritual intuition and inner knowing.",
      "Pink": "Promotes unconditional spiritual love and healing of spiritual heart wounds. Supports compassionate spiritual service, self-love spiritual practices, and healing of spiritual relationship wounds while connecting to divine feminine spiritual energy.",
      "White": "Facilitates direct connection to divine source and cosmic consciousness while promoting spiritual purification. Supports all spiritual practices, divine union experiences, and connection to highest spiritual realms while clearing spiritual blockages.",
      "Black": "Supports deep spiritual transformation and shadow work while providing spiritual protection. Facilitates spiritual evolution through darkness integration, mystery spiritual practices, and protection from negative spiritual influences.",
      "Gold": "Enhances spiritual mastery and connection to divine wisdom while promoting enlightenment experiences. Supports advanced spiritual practices, spiritual teaching abilities, and transmission of cosmic spiritual knowledge while connecting to divine intelligence.",
      "Silver": "Enhances psychic spiritual abilities and connection to lunar spiritual wisdom. Supports dream spiritual work, psychic spiritual development, and feminine spiritual practices while connecting to lunar spiritual consciousness."
    };
    return spiritualEffects[color] || spiritualEffects["Purple"];
  };

  const getOptimalPlacement = (color: string): string[] => {
    const placementTips: Record<string, string[]> = {
      "Purple": [
        "Place in meditation spaces or spiritual practice areas to enhance divine connection",
        "Position near crown chakra level (head height) for maximum spiritual activation",
        "Combine with amethyst or clear quartz to amplify spiritual energy",
        "Use during full moon ceremonies for heightened mystical experiences",
        "Keep in sacred spaces dedicated to spiritual study or contemplation"
      ],
      "Red": [
        "Position at ground level or near root chakra area for maximum grounding effect",
        "Place in areas where physical strength and vitality are needed",
        "Use in protection rituals or spaces requiring energetic boundaries",
        "Combine with black tourmaline or hematite for enhanced grounding",
        "Position in workout areas or spaces dedicated to physical wellness"
      ],
      "Orange": [
        "Place in creative studios or artistic spaces to enhance inspiration",
        "Position at sacral chakra level (lower abdomen height) for creative activation",
        "Use in bedrooms or intimate spaces to enhance sacred sexuality",
        "Combine with carnelian or orange calcite for amplified creative energy",
        "Keep in areas dedicated to emotional healing or artistic expression"
      ],
      "Yellow": [
        "Position in study areas or workspaces to enhance mental clarity",
        "Place at solar plexus level for personal power activation",
        "Use in communication spaces or areas for important conversations",
        "Combine with citrine or golden topaz for enhanced confidence",
        "Keep in areas dedicated to learning or intellectual pursuits"
      ],
      "Green": [
        "Place in healing spaces or areas dedicated to wellness practices",
        "Position at heart level for maximum heart chakra activation",
        "Use in nature-connected spaces or gardens for harmony",
        "Combine with rose quartz or green aventurine for enhanced healing",
        "Keep in spaces dedicated to abundance manifestation or healing work"
      ],
      "Blue": [
        "Position in communication areas or spaces for teaching and learning",
        "Place at throat chakra level for enhanced truthful expression",
        "Use in meditation spaces for peaceful contemplation",
        "Combine with blue lace agate or sodalite for enhanced communication",
        "Keep in areas dedicated to spiritual study or wisdom sharing"
      ]
    };
    return placementTips[color] || placementTips["Purple"];
  };

  // Helper to get CSS color class from aura color
  const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      "Red": "bg-red-500",
      "Orange": "bg-orange-500",
      "Yellow": "bg-yellow-400",
      "Green": "bg-green-500",
      "Blue": "bg-blue-500",
      "Indigo": "bg-indigo-500",
      "Purple": "bg-purple-500",
      "Pink": "bg-pink-500",
      "Brown": "bg-amber-700",
      "White": "bg-gray-100",
      "Black": "bg-gray-900",
      "Silver": "bg-gray-300",
      "Gold": "bg-yellow-600",
      "Bronze": "bg-amber-600",
      "Copper": "bg-amber-500",
      "Turquoise": "bg-teal-400",
      "Violet": "bg-violet-500",
    };

    // Default fallback color or try to match parts of the color name
    if (!colorMap[color]) {
      const colorKeys = Object.keys(colorMap);
      const matchedColor = colorKeys.find(key => 
        color.toLowerCase().includes(key.toLowerCase())
      );
      return matchedColor ? colorMap[matchedColor] : "bg-gray-400";
    }

    return colorMap[color];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-gradient-to-r from-primary-dark to-dark text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-heading font-bold">Object Analysis</h1>
          <p className="opacity-80">Discover the energy and spiritual significance of objects</p>
        </div>
      </div>
      <main className="flex-grow">
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Object Energy Analysis</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Upload a photo of any object to discover its aura, energy patterns, and spiritual significance.
                </p>
              </div>
              
              <div className="mb-12">
                <Card className="overflow-hidden border-none shadow-md">
                  <div className="h-2 bg-gradient-to-r from-primary to-primary-dark"></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <p className="text-center text-muted-foreground">
                        Every object carries its own unique energy signature. Upload a photo of an object 
                        to discover its aura color, energy qualities, and spiritual significance.
                      </p>
                      
                      <div className="flex flex-col items-center justify-center">
                        <ImageUpload 
                          onImageSelect={handleImageSelect}
                          isLoading={isAnalyzing}
                        />
                        
                        {isAnalyzing && (
                          <div className="mt-4 text-center w-full max-w-md">
                            <p className="text-sm text-muted-foreground mb-2">{analysisStage}</p>
                            <Progress value={analysisProgress} className="h-2 mb-1" />
                            <p className="text-xs text-muted-foreground">{Math.round(analysisProgress)}% complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {result && (
                <div className="space-y-8">
                  <Card>
                    <CardContent className="p-6">
                      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                          <TabsTrigger value="basic">Basic Analysis</TabsTrigger>
                          <TabsTrigger value="energy">Energy Profile</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic">
                          <div className="space-y-6">
                            {/* Image Comparison Section */}
                            {originalImage && (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <ImageIcon className="h-5 w-5 text-purple-600" />
                                  Aura Visualization
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Original Image */}
                                  <div className="space-y-3">
                                    <div className="text-center">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Original Image</h5>
                                      <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img 
                                          src={originalImage} 
                                          alt="Original object"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Processed Image with Aura Gradient */}
                                  <div className="space-y-3">
                                    <div className="text-center">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center gap-2">
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                        Aura Enhanced View
                                      </h5>
                                      <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-purple-200">
                                        {processedImage ? (
                                          <div className="relative">
                                            <img 
                                              src={processedImage} 
                                              alt="Object with aura gradient"
                                              className="w-full h-full object-cover"
                                              style={{ 
                                                filter: getAuraFilter(result.auraColor),
                                                transition: 'filter 0.5s ease-in-out'
                                              }}
                                            />
                                            <div 
                                              className="absolute inset-0 pointer-events-none"
                                              style={{
                                                background: `radial-gradient(circle, ${getAuraColorHex(result.auraColor)}40 0%, transparent 30%)`,
                                                opacity: 0.5
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-full h-64 flex items-center justify-center">
                                            <div className="text-center">
                                              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                                              <p className="text-sm text-gray-500">Processing aura visualization...</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Color Legend */}
                                <div className="flex items-center justify-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                                  <span className="text-sm text-gray-600">Aura Color:</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block w-6 h-6 rounded-full border-2 border-white shadow-sm ${getColorClass(result.auraColor)}`}></span>
                                    <span className="font-medium text-gray-800">{result.auraColor}</span>
                                  </div>
                                </div>
                              </div>
                            )}


                            
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Object Purpose</h4>
                              <p className="text-sm">{result.objectPurpose}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Aura Color</h4>
                              <div className="flex items-center">
                                <span className={`inline-block w-4 h-4 rounded-full ${getColorClass(result.auraColor)} mr-2`}></span>
                                <span className="font-medium">{result.auraColor}</span>
                              </div>
                              <p className="text-sm mt-2">{result.auraDescription}</p>
                              
                              {/* Enhanced Color Meaning Section */}
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                <h5 className="text-xs font-medium text-gray-700 mb-2">Aura Color Spiritual Meaning</h5>
                                <p className="text-xs text-gray-600 mb-2">{getEnhancedColorMeaning(result.auraColor)}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                  <div className="p-2 bg-green-50 rounded border border-green-200">
                                    <div className="text-xs font-medium text-green-800 mb-1">✓ Positive Energy</div>
                                    <div className="text-xs text-green-700">{getColorPositiveTraits(result.auraColor)}</div>
                                  </div>
                                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                    <div className="text-xs font-medium text-blue-800 mb-1">⚡ Energy Properties</div>
                                    <div className="text-xs text-blue-700">{getColorEnergyProperties(result.auraColor)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Energy Level</h4>
                              <Progress value={result.energyLevel * 10} className="h-2" />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Low</span>
                                <span>Medium</span>
                                <span>High</span>
                              </div>
                            </div>
                            
                            {/* Spiritual Significance Section */}
                            {result.spiritualSignificance && (
                              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
                                <h4 className="font-medium text-sm mb-2">Spiritual Significance</h4>
                                <p className="text-sm text-gray-700">
                                  {result.spiritualSignificance}
                                </p>
                              </div>
                            )}
                            
                            {/* Historical Significance Section */}
                            {result.historicalSignificance && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                <h4 className="font-medium text-sm mb-2">Historical Significance</h4>
                                <p className="text-sm text-gray-700">
                                  {result.historicalSignificance}
                                </p>
                              </div>
                            )}
                            
                            {/* Energy Recommendations Section */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                              <h4 className="font-medium text-sm mb-3">Usage Recommendations</h4>
                              <p className="text-sm text-gray-700 mb-3">
                                {result.auraColor} consciousness signature activates specific chakra frequencies and enhances spiritual development through authentic color vibration energy fields.
                              </p>
                              
                              <h5 className="font-medium text-xs mb-2">Recommendations for Use:</h5>
                              <ul className="text-xs list-disc list-inside space-y-1 text-gray-700">
                                <li>Sacred placement for {result.auraColor.toLowerCase()} energy activation - position where divine consciousness can flow freely through your spiritual practice space</li>
                                <li>Consider combining with {
                                  result.auraColor.toLowerCase() === 'red' ? 'black tourmaline for grounding excess energy' :
                                  result.auraColor.toLowerCase() === 'blue' ? 'clear quartz to amplify communication properties' :
                                  result.auraColor.toLowerCase() === 'green' ? 'rose quartz to enhance heart-centered healing' :
                                  result.auraColor.toLowerCase() === 'purple' ? 'amethyst to deepen spiritual awareness' :
                                  result.auraColor.toLowerCase() === 'yellow' ? 'citrine to boost positive mental energy' :
                                  `sacred ${result.auraColor.toLowerCase()} frequency crystals to amplify chakra activation and spiritual consciousness`
                                }</li>
                                <li>Sacred activation through {result.auraColor.toLowerCase()} consciousness meditation and daily spiritual practice with divine intention and authentic soul connection</li>
                                <li>Sacred cleansing with {
                                  result.auraColor.toLowerCase().includes('water') || 
                                  result.auraColor.toLowerCase() === 'blue' ? 'moonlight or sound' :
                                  result.auraColor.toLowerCase().includes('fire') || 
                                  result.auraColor.toLowerCase() === 'red' || 
                                  result.auraColor.toLowerCase() === 'orange' ? 'sunlight or smoke' :
                                  `${result.auraColor.toLowerCase()} frequency energy clearing through meditation and spiritual intention`
                                } to maintain divine vibration and spiritual purity</li>
                              </ul>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="energy">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm text-gray-500 mb-2">Energy Qualities</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.energyQualities.map((quality, index) => (
                                  <Badge key={index} variant="outline" className="rounded-full">
                                    {quality}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium mb-2">Energy Profile</h4>
                              <p className="text-sm text-gray-600">{result.detailedAnalysis}</p>
                            </div>
                            
                            {/* Enhanced Energy Influence Section */}
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-100">
                              <h4 className="font-medium text-lg mb-4 flex items-center">
                                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                Detailed Energy Influence Analysis
                              </h4>
                              
                              <div className="space-y-4">
                                <div>
                                  <h5 className="font-medium text-sm mb-2 text-amber-800">Environmental Energy Impact</h5>
                                  <p className="text-sm text-gray-700 mb-2">{getEnvironmentalInfluence(result.auraColor)}</p>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-sm mb-2 text-amber-800">Chakra System Activation</h5>
                                  <p className="text-sm text-gray-700 mb-2">{getChakraInfluence(result.auraColor)}</p>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-sm mb-2 text-amber-800">Emotional & Mental Effects</h5>
                                  <p className="text-sm text-gray-700 mb-2">{getEmotionalInfluence(result.auraColor)}</p>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-sm mb-2 text-amber-800">Spiritual Development Support</h5>
                                  <p className="text-sm text-gray-700 mb-2">{getSpiritualInfluence(result.auraColor)}</p>
                                </div>
                                
                                <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
                                  <h5 className="font-medium text-sm mb-2 text-amber-800">Optimal Placement & Usage</h5>
                                  <ul className="text-sm list-disc list-inside space-y-1 text-gray-700">
                                    {getOptimalPlacement(result.auraColor).map((tip, index) => (
                                      <li key={index}>{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        

                      </Tabs>
                    </CardContent>
                  </Card>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 text-center">
                    <h3 className="font-medium text-lg mb-2">Discover More Object Secrets</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload another photo to explore different objects and their sacred chakra frequencies. 
                      Each object channels divine consciousness through specific color vibrations and spiritual activation.
                    </p>
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={() => setResult(null)}>
                        Analyze Another Object
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}