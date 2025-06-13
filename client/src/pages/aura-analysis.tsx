import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/use-premium";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuraGlow } from "@/components/ui/aura-glow";
import ImageUpload from "@/components/forms/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PremiumFeature } from "@/components/premium/premium-feature";
import { analyzeAuraImage, AuraAnalysisResult, calculateNumerology, NumerologyResult } from "@/lib/openai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Crown, Sparkles, Zap, Download, Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AuraAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showPremiumModal } = usePremium();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("analysis");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("Initializing aura scanning...");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedAuraImage, setProcessedAuraImage] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [enhancedAuraImage, setEnhancedAuraImage] = useState<string | null>(null);
  
  // Image hash storage for consistent results
  const [imageCache, setImageCache] = useState<Map<string, AuraAnalysisResult>>(new Map());

  const getColorHarmonyAnalysis = (dominant: string, secondary: string | null, spectrum: string[] | undefined): string => {
    const chakraConnections: Record<string, string> = {
      'Red': 'Root Chakra (Muladhara)',
      'Orange': 'Sacral Chakra (Svadhisthana)', 
      'Yellow': 'Solar Plexus Chakra (Manipura)',
      'Green': 'Heart Chakra (Anahata)',
      'Blue': 'Throat Chakra (Vishuddha)',
      'Indigo': 'Third Eye Chakra (Ajna)',
      'Violet': 'Crown Chakra (Sahasrara)',
      'Purple': 'Higher Crown Chakra',
      'Pink': 'Higher Heart Chakra',
      'Gold': 'Soul Star Chakra',
      'Silver': 'Lunar Energy Center',
      'Turquoise': 'Higher Throat Chakra',
      'White': 'Divine Light Center',
      'Lime': 'Heart Healing Chakra',
      'Teal': 'Heart-Throat Bridge',
      'Maroon': 'Earth Star Chakra',
      'Navy': 'Deep Wisdom Center',
      'Coral': 'Creative Heart Center',
      'Mint': 'Renewal Energy Center',
      'Peach': 'Nurturing Heart Center'
    };



    const totalColors = spectrum ? spectrum.length : 2;
    const dominantChakra = chakraConnections[dominant] || `${dominant} Energy Center`;
    const secondaryChakra = secondary ? chakraConnections[secondary] || `${secondary} Energy Center` : '';

    let analysis = `Your ${totalColors}-color aura spectrum reveals ${dominantChakra} dominance`;
    
    if (secondary) {
      analysis += ` harmonizing with ${secondaryChakra}`;
    }

    if (spectrum && spectrum.length > 2) {
      const supportingColors = spectrum.slice(2, 4);
      const supportingChakras = supportingColors.map(color => 
        chakraConnections[color] || `${color} Center`
      ).join(' and ');
      analysis += `. Supporting energy from ${supportingChakras} creates multi-dimensional chakra activation`;
    }

    analysis += '. This chakra combination indicates advanced spiritual development with balanced energy flow across multiple dimensional frequencies.';
    
    return analysis;
  };

  // Enhanced hash function for consistent image results
  const generateImageHash = (base64Image: string): string => {
    // Use multiple sections of the image for better uniqueness
    const sections = [
      base64Image.substring(0, 500),
      base64Image.substring(Math.floor(base64Image.length * 0.25), Math.floor(base64Image.length * 0.25) + 500),
      base64Image.substring(Math.floor(base64Image.length * 0.5), Math.floor(base64Image.length * 0.5) + 500),
      base64Image.substring(Math.floor(base64Image.length * 0.75), Math.floor(base64Image.length * 0.75) + 500),
      base64Image.substring(base64Image.length - 500)
    ];
    
    let combinedHash = '';
    sections.forEach((section, index) => {
      let hash = 0;
      for (let i = 0; i < section.length; i++) {
        const char = section.charCodeAt(i);
        hash = ((hash << 5) - hash) + char + index;
        hash = hash & hash; // Convert to 32-bit integer
      }
      combinedHash += Math.abs(hash).toString(36);
    });
    
    return combinedHash;
  };

  // Enhanced image similarity detection for consistent results
  const findSimilarImage = (newHash: string, base64Image: string): AuraAnalysisResult | null => {
    // Check for exact match first
    if (imageCache.has(newHash)) {
      console.log('Returning cached result for identical image');
      return imageCache.get(newHash) || null;
    }
    
    // For identical images with slight compression differences, check content similarity
    const entries = Array.from(imageCache.entries());
    for (let i = 0; i < entries.length; i++) {
      const [cachedHash, cachedResult] = entries[i];
      
      // Compare hash similarity - identical images should have very similar hashes
      const similarity = calculateHashSimilarity(newHash, cachedHash);
      if (similarity > 0.85) { // 85% similarity threshold for same image
        console.log('Returning cached result for similar image (similarity:', similarity, ')');
        return cachedResult;
      }
    }
    return null;
  };

  // Calculate similarity between two hash strings
  const calculateHashSimilarity = (hash1: string, hash2: string): number => {
    if (hash1 === hash2) return 1.0;
    
    const maxLength = Math.max(hash1.length, hash2.length);
    const minLength = Math.min(hash1.length, hash2.length);
    
    // If lengths are very different, it's likely a different image
    if (maxLength - minLength > maxLength * 0.2) return 0;
    
    let matches = 0;
    for (let i = 0; i < minLength; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }
    
    return matches / maxLength;
  };



  // Submit review for aura analysis
  const submitReview = async () => {
    if (!currentAnalysisId || rating === 0) return;

    setIsSubmittingReview(true);
    try {
      await fetch(`/api/aura-readings/${currentAnalysisId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, reviewText })
      });

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setReviewSubmitted(true);
      setRating(0);
      setReviewText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  // Numerology states
  const [numerologyName, setNumerologyName] = useState("");
  const [numerologyBirthDate, setNumerologyBirthDate] = useState("");
  const [numerologyResult, setNumerologyResult] = useState<NumerologyResult | null>(null);
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);
  
  const handlePremiumUpgrade = () => {
    showPremiumModal("aura");
  };

  // Function to download complete aura and numerology analysis as PDF
  const downloadAuraPDF = async () => {
    if (!result) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your spiritual analysis report...",
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 200; // Slightly smaller for margins
      const pageHeight = 280; // Leave room for margins
      
      // Add title page
      pdf.setFontSize(20);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Spiritual Analysis Report', 105, 50, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text('Aura Reading & Numerology Analysis', 105, 70, { align: 'center' });
      
      pdf.setFontSize(10);
      const date = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${date}`, 105, 90, { align: 'center' });

      // Get the main analysis container
      const analysisContainer = document.querySelector('#aura-reading-section');
      if (analysisContainer) {
        // Temporarily make all tabs visible for capture
        const allTabs = analysisContainer.querySelectorAll('[role="tabpanel"]');
        const originalStyles: Array<{element: HTMLElement, display: string}> = [];
        
        allTabs.forEach(tab => {
          const tabElement = tab as HTMLElement;
          originalStyles.push({
            element: tabElement,
            display: tabElement.style.display
          });
          tabElement.style.display = 'block';
        });

        // Wait for all content to render
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Capture the entire analysis container
        const canvas = await html2canvas(analysisContainer as HTMLElement, {
          scale: 1,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: false,
          width: (analysisContainer as HTMLElement).scrollWidth,
          height: (analysisContainer as HTMLElement).scrollHeight
        });

        // Restore original tab visibility
        originalStyles.forEach(({element, display}) => {
          element.style.display = display;
        });

        // Add the captured image to PDF
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text('Aura Analysis Results', 20, 25);

        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image, splitting across pages if needed
        let yPosition = 35;
        let sourceY = 0;
        let remainingHeight = imgHeight;

        while (remainingHeight > 0) {
          const pageSpace = pageHeight - yPosition;
          const printHeight = Math.min(remainingHeight, pageSpace);
          
          if (printHeight > 0) {
            const sourceHeight = (printHeight / imgWidth) * canvas.width;
            
            // Create a cropped version of the canvas
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = sourceHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
              tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
              const tempData = tempCanvas.toDataURL('image/png');
              pdf.addImage(tempData, 'PNG', 5, yPosition, imgWidth, printHeight);
            }
            
            remainingHeight -= printHeight;
            sourceY += sourceHeight;
            
            if (remainingHeight > 0) {
              pdf.addPage();
              yPosition = 20;
            }
          } else {
            break;
          }
        }
      }

      // Add numerology summary if available
      if (numerologyResult) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text('Numerology Analysis', 20, 25);
        
        pdf.setFontSize(10);
        let yPos = 40;
        
        pdf.text(`Life Path Number: ${numerologyResult.lifePathNumber}`, 20, yPos);
        yPos += 7;
        pdf.text(`Destiny Number: ${numerologyResult.destinyNumber}`, 20, yPos);
        yPos += 7;
        pdf.text(`Soul Urge Number: ${numerologyResult.soulUrgeNumber}`, 20, yPos);
        yPos += 7;
        pdf.text(`Personality Number: ${numerologyResult.personalityNumber}`, 20, yPos);
        yPos += 15;
        
        if (numerologyResult.interpretation) {
          pdf.text('Interpretation:', 20, yPos);
          yPos += 7;
          const lines = pdf.splitTextToSize(numerologyResult.interpretation, 170);
          pdf.text(lines, 20, yPos);
        }
      }

      // Add metadata
      pdf.setProperties({
        title: 'Spiritual Analysis Report',
        subject: 'Aura and Numerology Analysis',
        author: 'Spiritual Wellness Dashboard'
      });

      // Download
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`spiritual-analysis-${timestamp}.pdf`);

      toast({
        title: "PDF Downloaded Successfully",
        description: "Your spiritual analysis report has been saved",
      });

    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to get accurate color hex values
  const getAccurateColorCode = (colorName: string): string => {
    // Enhanced color map with proper spiritual aura colors
    const colorMap: Record<string, string> = {
      'Red': '#FF4444',
      'Orange': '#FF8533', 
      'Yellow': '#FFD700',
      'Green': '#32CD32',
      'Blue': '#4169E1',
      'Indigo': '#4B0082',
      'Violet': '#8A2BE2',
      'Purple': '#9932CC',
      'Pink': '#FF69B4',
      'Gold': '#FFD700',
      'Silver': '#C0C0C0',
      'Turquoise': '#40E0D0',
      'White': '#F8F8FF',
      'Lavender': '#E6E6FA',
      'Coral': '#FF7F50',
      'Mint': '#98FB98',
      'Peach': '#FFDAB9',
      'Sky Blue': '#87CEEB',
      'Rose': '#FF66CC',
      'Amber': '#FFBF00',
      'Gray': '#808080',
      'Black': '#2C2C2C',
      'Crimson': '#DC143C',
      'Magenta': '#FF00FF',
      'Brown': '#A52A2A',
      'Beige': '#F5F5DC',
      'Cyan': '#00FFFF',
      'Lime': '#32CD32',
      'Maroon': '#800000',
      'Navy': '#000080',
      'Olive': '#808000',
      'Teal': '#008080',
      'Bronze': '#CD7F32',
      'Cobalt': '#0047AB',
      'Emerald': '#50C878',
      'Jade': '#00A36C',
      'Sapphire': '#0F52BA',
      'Topaz': '#FFC87C'
    };
    
    // Normalize color name (handle case variations)
    const normalizedName = colorName.trim();
    const exactMatch = colorMap[normalizedName];
    if (exactMatch) return exactMatch;
    
    // Try case-insensitive match
    const lowerName = normalizedName.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
    
    return '#9932CC'; // Default purple if no match
  };



  const getColorPositiveMeaning = (colorName: string): string => {
    const redMeaning = {
      color: 'Red',
      chakra: 'Root Chakra',
      number: '1',
      meaning: 'Root chakra kundalini activation flowing with primal life force energy that empowers your physical vitality and natural leadership magnetism. This fundamental frequency channels courageous action and manifestation power through your earthly presence.'
    };
    
    const orangeMeaning = {
      color: 'Orange', 
      chakra: 'Sacral Chakra',
      number: '2',
      meaning: 'Sacral chakra harmonization creating perfect balance for creative manifestation and sacred sexual vitality. This dynamic frequency liberates emotional expression while awakening your inner artistic genius and creative soul purpose.'
    };
    
    const yellowMeaning = {
      color: 'Yellow',
      chakra: 'Solar Plexus Chakra', 
      number: '3',
      meaning: 'Solar plexus power center radiating brilliant mental clarity and digestive harmony while strengthening your personal will and intellectual mastery. This golden frequency illuminates your path to confident self-expression and mental sovereignty.'
    };
    
    const greenMeaning = {
      color: 'Green',
      chakra: 'Heart Chakra',
      number: '4', 
      meaning: 'Heart chakra opening into unconditional love consciousness with natural healing abilities flowing through your emotional center. This healing frequency creates perfect emotional balance while manifesting prosperity consciousness through heart-centered living.'
    };
    
    const blueMeaning = {
      color: 'Blue',
      chakra: 'Throat Chakra',
      number: '5',
      meaning: 'Throat chakra clarity channeling divine truth expression through psychic communication abilities and spiritual teaching gifts. This truth frequency establishes peaceful authority while enabling authentic voice expression and sacred communication.'
    };
    
    const indigoMeaning = {
      color: 'Indigo', 
      chakra: 'Third Eye Chakra',
      number: '6',
      meaning: 'Third eye awakening with clairvoyant sight activation bringing profound spiritual wisdom and intuitive knowing. This mystical frequency opens doorways to higher understanding and psychic perception through divine inner sight.'
    };
    
    const violetMeaning = {
      color: 'Violet',
      chakra: 'Crown Chakra',
      number: '7',
      meaning: 'Crown chakra activation establishing direct divine connection for spiritual mastery and cosmic consciousness expansion. This enlightened frequency brings awakened awareness and connection to universal wisdom and divine guidance.'
    };
    
    const purpleMeaning = {
      color: 'Purple',
      chakra: 'Crown Chakra Higher Octave',
      number: '7',
      meaning: 'Royal spiritual power emanating divine nobility with magical abilities and access to higher wisdom realms. This regal frequency channels mystical authority and connection to ancient spiritual knowledge and cosmic sovereignty.'
    };
    
    const pinkMeaning = {
      color: 'Pink', 
      chakra: 'Heart Chakra Higher Octave',
      number: '4',
      meaning: 'Divine feminine love frequency expressing emotional healing mastery through nurturing power and compassionate leadership. This heart wisdom frequency creates healing through unconditional love and gentle strength expression.'
    };
    
    const goldMeaning = {
      color: 'Gold',
      chakra: 'Solar Plexus Higher Octave', 
      number: '3',
      meaning: 'Christ consciousness frequency radiating divine wisdom and spiritual wealth through enlightened mastery. This golden frequency provides cosmic protection while channeling divine authority and spiritual abundance through sacred service.'
    };
    
    const silverMeaning = {
      color: 'Silver',
      chakra: 'Third Eye Higher Octave',
      number: '6',
      meaning: 'Lunar intuition activation providing psychic protection through feminine wisdom and emotional intelligence mastery. This reflective frequency enhances intuitive abilities and creates energetic boundaries through divine feminine power.'
    };
    
    const turquoiseMeaning = {
      color: 'Turquoise',
      chakra: 'Heart-Throat Bridge Chakra',
      number: '4.5',
      meaning: 'Advanced heart-throat communication bridging emotional healing with spiritual teaching through higher truth expression. This therapeutic frequency combines wisdom with compassion for powerful healing communication and authentic guidance.'
    };
    
    const whiteMeaning = {
      color: 'White',
      chakra: 'Crown Chakra Pure Light',
      number: '7',
      meaning: 'Pure divine light emanation providing angelic protection and spiritual clarity through cosmic consciousness connection. This pristine frequency channels divine guidance and universal wisdom through clear spiritual perception and enlightened awareness.'
    };
    
    const limeMeaning = {
      color: 'Lime',
      chakra: 'Heart Chakra Renewal',
      number: '4',
      meaning: 'Heart healing chakra activation bringing powerful renewal energy that stimulates fresh emotional growth and deep spiritual cleansing. This vibrant frequency accelerates vitality restoration while catalyzing transformative new beginnings in your spiritual journey.'
    };
    
    const navyMeaning = {
      color: 'Navy',
      chakra: 'Third Eye Deep Wisdom',
      number: '6',
      meaning: 'Deep wisdom chakra activation accessing profound spiritual knowledge and cosmic intelligence stored in your soul memory. This mystical frequency brings divine authority through connection to ancient wisdom and universal understanding.'
    };
    
    const colorMeanings: Record<string, string> = {
      'Red': redMeaning.meaning,
      'Orange': orangeMeaning.meaning,
      'Yellow': yellowMeaning.meaning, 
      'Green': greenMeaning.meaning,
      'Blue': blueMeaning.meaning,
      'Indigo': indigoMeaning.meaning,
      'Violet': violetMeaning.meaning,
      'Purple': purpleMeaning.meaning,
      'Pink': pinkMeaning.meaning,
      'Gold': goldMeaning.meaning,
      'Silver': silverMeaning.meaning,
      'Turquoise': turquoiseMeaning.meaning,
      'White': whiteMeaning.meaning,
      'Lime': limeMeaning.meaning,
      'Navy': navyMeaning.meaning
    };
    
    return colorMeanings[colorName] || `${colorName} individual chakra mastery expressing unique spiritual gifts through authentic divine consciousness activation.`;
  }

  const getColorNegativeMeaning = (colorName: string): string => {
    const redShadow = {
      color: 'Red',
      chakra: 'Root Chakra Imbalance',
      number: '1',
      meaning: 'Root chakra imbalance manifesting through survival fears and aggressive tendencies that create blood pressure issues and adrenal exhaustion. This overactive frequency can lead to destructive anger patterns and inability to ground spiritual energy properly.'
    };
    
    const orangeShadow = {
      color: 'Orange',
      chakra: 'Sacral Chakra Blockage',
      number: '2',
      meaning: 'Sacral chakra blockage creating creative stagnation and sexual dysfunction while causing reproductive system imbalances and emotional instability. This restricted frequency prevents authentic creative expression and healthy emotional flow.'
    };
    
    const yellowShadow = {
      color: 'Yellow',
      chakra: 'Solar Plexus Weakness',
      number: '3',
      meaning: 'Solar plexus weakness generating digestive problems and low self-esteem that manifests as anxiety disorders and constant power struggles. This diminished frequency creates mental confusion and inability to maintain personal boundaries.'
    };
    
    const greenShadow = {
      color: 'Green',
      chakra: 'Heart Chakra Closure',
      number: '4',
      meaning: 'Heart chakra closure building emotional walls that create relationship difficulties and immune system weakness while manifesting lung problems. This protected frequency prevents authentic love expression and emotional vulnerability.'
    };
    
    const blueShadow = {
      color: 'Blue',
      chakra: 'Throat Chakra Blockage',
      number: '5',
      meaning: 'Throat chakra blockage causing communication fears and thyroid imbalances that create neck tension and truth suppression. This constricted frequency prevents authentic voice expression and honest spiritual communication.'
    };
    
    const indigoShadow = {
      color: 'Indigo',
      chakra: 'Third Eye Cloudiness',
      number: '6',
      meaning: 'Third eye cloudiness creating intuitive blocks and chronic headaches while causing vision problems and spiritual confusion. This clouded frequency prevents psychic development and clear spiritual perception.'
    };
    
    const violetShadow = {
      color: 'Violet',
      chakra: 'Crown Chakra Disconnection',
      number: '7',
      meaning: 'Crown chakra disconnection triggering spiritual crisis and depression while causing neurological issues and complete isolation from divine connection. This severed frequency creates existential emptiness and spiritual despair.'
    };
    
    const purpleShadow = {
      color: 'Purple',
      chakra: 'Spiritual Bypassing',
      number: '7',
      meaning: 'Spiritual bypassing tendencies creating ego inflation and mental health struggles while causing dangerous disconnection from physical reality. This distorted frequency prevents authentic spiritual growth through shadow integration.'
    };
    
    const pinkShadow = {
      color: 'Pink',
      chakra: 'Heart Wounds',
      number: '4',
      meaning: 'Heart wounds creating codependency patterns and boundary dissolution that leads to emotional manipulation and excessive self-sacrifice. This wounded frequency attracts unhealthy relationship dynamics and emotional exploitation.'
    };
    
    const goldShadow = {
      color: 'Gold',
      chakra: 'Spiritual Materialism',
      number: '3',
      meaning: 'Spiritual materialism creating ego attachment and fear of divine responsibility while manifesting perfectionism and disconnection from authentic spiritual service. This corrupted frequency prevents humble spiritual development.'
    };
    
    const silverShadow = {
      color: 'Silver',
      chakra: 'Emotional Volatility',
      number: '6',
      meaning: 'Emotional volatility causing psychic overwhelm and hormonal imbalances that create mood disorders and excessive lunar sensitivity. This unstable frequency prevents emotional regulation and psychic protection.'
    };
    
    const turquoiseShadow = {
      color: 'Turquoise',
      chakra: 'Communication Breakdown',
      number: '4.5',
      meaning: 'Communication breakdown causing emotional flooding and healer burnout while creating severe throat chakra strain. This overwhelmed frequency prevents sustainable healing work and authentic guidance expression.'
    };
    
    const whiteShadow = {
      color: 'White',
      chakra: 'Spiritual Bypassing',
      number: '7',
      meaning: 'Spiritual bypassing creating avoidance of necessary shadow work while manifesting perfectionism and complete disconnection from earthly matters. This dissociated frequency prevents grounded spiritual integration.'
    };
    
    const limeShadow = {
      color: 'Lime',
      chakra: 'Heart Impatience',
      number: '4',
      meaning: 'Impatience with natural healing processes creating forced spiritual growth that leads to emotional instability and restless energy patterns. This overstimulated frequency can cause spiritual burnout when growth is rushed without proper integration time.'
    };
    
    const navyShadow = {
      color: 'Navy',
      chakra: 'Mental Rigidity',
      number: '6',
      meaning: 'Mental rigidity creating spiritual arrogance and intellectual superiority while hoarding wisdom for personal power. This closed frequency prevents humble learning and authentic spiritual authority through knowledge accumulation.'
    };
    
    const negativeMeanings: Record<string, string> = {
      'Red': redShadow.meaning,
      'Orange': orangeShadow.meaning,
      'Yellow': yellowShadow.meaning,
      'Green': greenShadow.meaning,
      'Blue': blueShadow.meaning,
      'Indigo': indigoShadow.meaning,
      'Violet': violetShadow.meaning,
      'Purple': purpleShadow.meaning,
      'Pink': pinkShadow.meaning,
      'Gold': goldShadow.meaning,
      'Silver': silverShadow.meaning,
      'Turquoise': turquoiseShadow.meaning,
      'White': whiteShadow.meaning,
      'Lime': limeShadow.meaning,
      'Navy': navyShadow.meaning
    };
    const additionalNegativeMeanings: Record<string, string> = {
      'Crimson': 'Destructive anger patterns manifesting through violent tendencies and overwhelming emotional intensity that creates uncontrolled passion and dangerous impulse expression. This explosive frequency can lead to physical aggression and complete loss of spiritual self-control.',
      'Magenta': 'Emotional overwhelm creating unrealistic spiritual expectations and delusional thinking while fostering excessive attachment to outcomes. This ungrounded frequency prevents authentic spiritual development through fantasy and spiritual materialism.',
      'Aqua': 'Communication confusion creating spiritual bypassing tendencies and emotional detachment while distorting truth for personal agenda. This disconnected frequency prevents authentic spiritual teaching and genuine emotional expression.',
      'Navy': 'Mental rigidity creating spiritual arrogance and intellectual superiority while hoarding wisdom for personal power. This closed frequency prevents humble learning and authentic spiritual authority through knowledge accumulation.',
      'Lime': 'Impatience with natural healing processes creating forced spiritual growth that leads to emotional instability and restless energy patterns. This overstimulated frequency can cause spiritual burnout when growth is rushed without proper integration time.',
      'Maroon': 'Stubborn resistance creating earthly attachment and paralyzing fear of necessary change while fostering spiritual stagnation. This rigid frequency prevents growth through excessive attachment to material security and comfort zones.',
      'Chocolate': 'Material obsession creating earthly heaviness and complete resistance to higher spiritual wisdom while imposing practical limitations on soul expansion. This dense frequency prevents spiritual transcendence through material fixation.',
      'Beige': 'Spiritual apathy creating energy depletion and complete lack of life passion while fostering disconnection from soul purpose. This lifeless frequency prevents authentic spiritual engagement through emotional numbness and spiritual laziness.',
      'Tan': 'Bland existence patterns creating avoidance of spiritual growth and fear of emotional intensity while accepting mediocrity as life standard. This dull frequency prevents authentic living through comfort zone addiction and spiritual complacency.',
      'Coral': 'Overwhelming emotional expression creating codependent creativity patterns and exhausting social energy that leads to complete burnout from excessive giving. This depleted frequency prevents sustainable creative expression and healthy boundaries.',
      'Mint': 'Superficial healing approaches creating avoidance of necessary deep inner work while fostering spiritual impatience that bypasses essential integration processes. This rushed frequency prevents authentic transformation through spiritual shortcuts.',
      'Peach': 'Emotional dependency patterns creating excessive nurturing that leads to self-neglect through compulsive caring and complete boundary dissolution. This codependent frequency prevents healthy relationships through martyrdom and emotional manipulation.',
      'Sky Blue': 'Communication overwhelm creating truth expression without wisdom while fostering scattered mental expression and emotional instability. This chaotic frequency prevents clear spiritual communication through mental hyperactivity and lack of focus.',
      'Rose': 'Romantic delusion creating love addiction patterns and unrealistic idealistic expectations while enabling heart manipulation and emotional fantasy. This deluded frequency prevents authentic love through projection and emotional dependency.',
      'Amber': 'Living trapped in past patterns creating resistance to necessary change while fostering spiritual stagnation and overwhelming ancestral burden. This stuck frequency prevents forward progress through historical attachment and fear of the unknown.',
      'Gray': 'Emotional numbness creating spiritual detachment and complete avoidance of life engagement while fostering depression tendencies. This void frequency prevents authentic feeling and spiritual connection through emotional disconnection.',
      'Black': 'Shadow obsession creating negative energy absorption and depression depths while fostering complete isolation patterns from others. This dark frequency prevents healthy shadow integration through darkness addiction and social withdrawal.',
      'Brown': 'Material attachment creating earthly limitation and spiritual heaviness while fostering excessive grounding that prevents transcendence. This heavy frequency prevents spiritual elevation through material world fixation.',
      'Cyan': 'Emotional coldness creating communication detachment and truth expression without heart connection while fostering analytical overwhelm. This cold frequency prevents authentic emotional expression through mental rigidity and heart disconnection.'
    };
    
    // First check both arrays for the color
    const specificMeaning = negativeMeanings[colorName] || additionalNegativeMeanings[colorName] || 
                           negativeMeanings[colorName.toLowerCase()] || additionalNegativeMeanings[colorName.toLowerCase()];
    
    if (specificMeaning) {
      return specificMeaning;
    }
    
    // If no specific meaning found, provide authentic color-based shadow meanings
    const shadowMeanings: Record<string, string> = {
      'Orange': 'Creative stagnation creating emotional instability and sexual energy imbalances while fostering compulsive behaviors and artistic blocks.',
      'Yellow': 'Mental overwhelm creating digestive issues and confidence crises while fostering anxiety patterns and personal power struggles.',
      'Violet': 'Spiritual disconnection creating depression and crown chakra closure while fostering isolation from divine guidance and cosmic consciousness.',
      'White': 'Spiritual bypassing creating perfectionism and shadow avoidance while fostering disconnection from earthly reality and human emotions.',
      'Pink': 'Codependent love creating boundary issues and emotional manipulation while fostering self-sacrifice patterns and heart wounds.',
      'Gold': 'Ego inflation creating spiritual materialism and divine disconnection while fostering perfectionism and fear of authentic service.',
      'Silver': 'Psychic overwhelm creating emotional volatility and lunar sensitivity while fostering mood instability and energetic absorption.',
      'Turquoise': 'Communication breakdown creating healer burnout and throat chakra strain while fostering emotional flooding and teaching exhaustion.',
      'Purple': 'Spiritual bypassing creating reality disconnection and ego inflation while fostering mystical delusion and mental health struggles.',
      'Indigo': 'Psychic confusion creating intuitive blocks and third eye cloudiness while fostering spiritual overwhelm and vision problems.',
      'Teal': 'Emotional suppression creating authentic voice loss and heart-throat disconnection while fostering communication fears and feeling blockages.'
    };
    
    return shadowMeanings[colorName] || shadowMeanings[colorName.toLowerCase()] || 
           `${colorName} shadow integration creating specific energetic imbalances that require conscious healing work to transform blocked spiritual frequencies into authentic power expression.`;
  }

  // Chakra healing remedies for weaker chakras
  const getChakraRemedies = (chakraName: string, activityLevel: number): string => {
    if (activityLevel >= 70) return '';
    
    const remedies: Record<string, string> = {
      'Root': 'Ground yourself daily: walk barefoot on earth, use red jasper crystal, practice warrior poses, eat root vegetables, visualize red light at tailbone, chant LAM mantra',
      'Sacral': 'Enhance creativity: orange carnelian crystal, hip circles, swimming, creative arts, tantric breathing, visualize orange light below navel, chant VAM mantra',
      'Solar Plexus': 'Build confidence: citrine crystal, core strengthening, yellow foods, sun gazing meditation, power breathing, visualize yellow light at stomach, chant RAM mantra',
      'Heart': 'Open to love: rose quartz crystal, heart opening yoga, green leafy foods, loving-kindness meditation, pranayama breathing, visualize green light at chest, chant YAM mantra',
      'Throat': 'Express truth: blue lace agate crystal, neck stretches, singing, journaling, truthful communication, visualize blue light at throat, chant HAM mantra',
      'Third Eye': 'Enhance intuition: amethyst crystal, forward folds, meditation, purple foods, third eye massage, visualize indigo light between brows, chant OM mantra',
      'Crown': 'Connect to divine: clear quartz crystal, headstand, fasting, prayer, silence meditation, visualize violet light above head, chant SILENCE mantra'
    };
    
    return remedies[chakraName] || 'Balance through meditation, crystals, yoga, proper nutrition, and energy healing practices';
  }

  // Helper functions for the 4-zone aura visualization
  const getReceivingEnergyColor = (auraData: AuraAnalysisResult): string => {
    // Left side - How person receives energy from environment
    // This is dynamic and changes based on environmental interactions
    const receivingEnergyMap: Record<string, string> = {
      'Red': 'Blue',        // Fire receives from water/air elements
      'Orange': 'Green',    // Creative energy receives from nature
      'Yellow': 'Purple',   // Mental energy receives from spiritual realm
      'Green': 'Pink',      // Heart energy receives through love
      'Blue': 'Gold',       // Communication receives divine guidance
      'Indigo': 'Silver',   // Intuition receives cosmic wisdom
      'Violet': 'White',    // Spiritual crown receives pure light
      'Purple': 'Turquoise', // Mystic energy receives through clarity
      'Pink': 'Green',      // Love receives through healing
      'Gold': 'Blue',       // Divine wisdom receives through truth
      'Silver': 'Indigo',   // Soul connection receives through intuition
      'White': 'Violet',    // Pure energy receives through spirituality
      'Turquoise': 'Rose',  // Healing communication receives through compassion
      'Magenta': 'Yellow'   // Transformative energy receives through mental clarity
    };
    return receivingEnergyMap[auraData.dominantColor] || auraData.secondaryColor || 'Blue';
  }

  const getGivingEnergyColor = (auraData: AuraAnalysisResult): string => {
    // Right side - How person gives energy and creates life patterns
    // This is dynamic and shows their active contribution to the world
    const givingEnergyMap: Record<string, string> = {
      'Red': 'Orange',      // Passionate energy gives through creativity
      'Orange': 'Yellow',   // Creative energy gives through mental stimulation
      'Yellow': 'Green',    // Mental energy gives through healing wisdom
      'Green': 'Pink',      // Healing energy gives through unconditional love
      'Blue': 'Turquoise',  // Truth gives through clear communication
      'Indigo': 'Purple',   // Intuition gives through spiritual insight
      'Violet': 'Gold',     // Spiritual energy gives through divine wisdom
      'Purple': 'Magenta',  // Mystic energy gives through transformation
      'Pink': 'Rose',       // Love gives through deeper emotional connection
      'Gold': 'Amber',      // Divine wisdom gives through grounded spirituality
      'Silver': 'White',    // Soul energy gives through pure light
      'White': 'Silver',    // Pure light gives through soul connection
      'Turquoise': 'Cyan',  // Clear communication gives through emotional clarity
      'Magenta': 'Crimson'  // Transformation gives through passionate intensity
    };
    return givingEnergyMap[auraData.dominantColor] || auraData.dominantColor;
  }

  const getPersonalityColor = (auraData: AuraAnalysisResult): string => {
    // Overall static background - Core personality and why things happen to them
    // This represents their fundamental nature and karmic patterns
    const personalityMap: Record<string, string> = {
      'Red': 'Maroon',      // Deep passionate nature, attracts intense experiences
      'Orange': 'Coral',    // Warm creative soul, attracts artistic opportunities
      'Yellow': 'Gold',     // Wise mental nature, attracts learning experiences
      'Green': 'Emerald',   // Pure healing heart, attracts those needing healing
      'Blue': 'Navy',       // Deep truth seeker, attracts authentic connections
      'Indigo': 'Midnight', // Profound intuitive nature, attracts mystical experiences
      'Violet': 'Lavender', // Gentle spiritual essence, attracts peaceful environments
      'Purple': 'Plum',     // Rich mystic soul, attracts transformational events
      'Pink': 'Rose',       // Loving compassionate heart, attracts relationships
      'Gold': 'Bronze',     // Ancient wisdom keeper, attracts teaching opportunities
      'Silver': 'Platinum', // Refined soul energy, attracts elevated circumstances
      'White': 'Pearl',     // Pure light being, attracts clarity and truth
      'Turquoise': 'Teal',  // Balanced healer-communicator, attracts harmony
      'Magenta': 'Fuchsia'  // Dynamic transformer, attracts change and growth
    };
    return personalityMap[auraData.dominantColor] || auraData.dominantColor;
  };

  // Helper functions for Energy Reading tab

  const calculateGivingEnergy = (aura: AuraAnalysisResult): number => {
    const givingEnergyMap: Record<string, number> = {
      'Red': 78, 'Orange': 82, 'Yellow': 75, 'Green': 71,
      'Blue': 68, 'Indigo': 64, 'Violet': 61, 'Purple': 67,
      'Pink': 74, 'White': 85, 'Gold': 88, 'Silver': 66, 'Turquoise': 73, 'Cyan': 69, 'Emerald': 76, 'Sapphire': 80, 'Topaz': 77, 'Jade': 72, 'Bronze': 70
    };
    const base = givingEnergyMap[aura.dominantColor] || 72;
    const variation = Math.sin(aura.energyLevel * 0.1) * 8; // Creates natural variation
    const calculated = base + variation + (aura.energyLevel - 50) * 0.3;
    return Math.max(25, Math.min(88, Math.round(calculated)));
  };

  const calculateReceivingEnergy = (aura: AuraAnalysisResult): number => {
    const receivingEnergyMap: Record<string, number> = {
      'Red': 42, 'Orange': 58, 'Yellow': 54, 'Green': 83,
      'Blue': 79, 'Indigo': 86, 'Violet': 88, 'Purple': 81,
      'Pink': 77, 'White': 85, 'Gold': 65, 'Silver': 87, 'Turquoise': 71, 'Cyan': 73, 'Emerald': 78, 'Sapphire': 82, 'Topaz': 68, 'Jade': 74, 'Bronze': 63
    };
    const base = receivingEnergyMap[aura.dominantColor] || 70;
    const variation = Math.cos(aura.energyLevel * 0.15) * 6; // Different variation pattern than giving
    const calculated = base + variation + (aura.energyLevel - 45) * 0.4;
    return Math.max(28, Math.min(88, Math.round(calculated)));
  };

  const getGivingEnergyDescription = (percentage: number): string => {
    if (percentage >= 80) return 'Strong radiator';
    if (percentage >= 60) return 'Balanced giver';
    if (percentage >= 40) return 'Selective sharing';
    return 'Energy conserving';
  };

  const getReceivingEnergyDescription = (percentage: number): string => {
    if (percentage >= 800) return 'Highly receptive';
    if (percentage >= 600) return 'Balanced receiver';
    if (percentage >= 400) return 'Selective absorber';
    return 'Energy filtering';
  };

  const getChakraColor = (chakra: string): string => {
    const chakraColors: Record<string, string> = {
      'root': 'bg-red-500',
      'sacral': 'bg-orange-500',
      'solarPlexus': 'bg-yellow-500',
      'heart': 'bg-green-500',
      'throat': 'bg-blue-500',
      'thirdEye': 'bg-indigo-500',
      'crown': 'bg-purple-500',
      'soulStar': 'bg-pink-500',
      'earthStar': 'bg-brown-500'
    };
    return chakraColors[chakra] || 'bg-gray-400';
  };

  const calculateEarthStarChakra = (aura: AuraAnalysisResult): number => {
    // Earth Star Chakra (Number 4) - Brown/Earth colors, grounding energy
    const baseValue = aura.energyLevel * 8;
    const colorModifier = ['Brown', 'Black', 'Gray', 'Maroon'].includes(aura.dominantColor) ? 15 : 0;
    return Math.min(100, baseValue + colorModifier);
  };

  const calculateSoulStarChakra = (aura: AuraAnalysisResult): number => {
    // Soul Star Chakra (Number 7) - White/Silver colors, divine connection
    const baseValue = aura.energyLevel * 7;
    const colorModifier = ['White', 'Silver', 'Gold', 'Violet'].includes(aura.dominantColor) ? 20 : 0;
    return Math.min(100, baseValue + colorModifier);
  };

  const calculateAuraStrength = (aura: AuraAnalysisResult): number => {
    return Math.min(95, (aura.energyLevel * 7) + 2);
  };

  const calculateVulnerability = (aura: AuraAnalysisResult): number => {
    const sensitiveColors = ['Pink', 'Blue', 'Green', 'Indigo', 'lavender', 'mint', 'peach', 'sky blue', 'rose', 'amber', 'gray', 'black', 'crimson', 'magenta', 'ocher', 'beige', 'cyan', 'lime', 'maroon', 'navy', 'olive', 'teal', 'bronze', 'cobalt', 'emerald', 'jade', 'sapphire',];
    const isSensitive = sensitiveColors.includes(aura.dominantColor);
    const base = isSensitive ? 60 : 40;
    return Math.max(50, base - aura.energyLevel * 20);
  };

  const calculateEnergyBalance = (aura: AuraAnalysisResult): number => {
    const giving = calculateGivingEnergy(aura);
    const receiving = calculateReceivingEnergy(aura);
    const balance = 70 - Math.abs(giving - receiving);
    return Math.max(30, balance);
  };

  const getStrengthDescription = (percentage: number): string => {
    if (percentage >= 80) return 'Powerful aura';
    if (percentage >= 60) return 'Strong presence';
    if (percentage >= 40) return 'Developing strength';
    return 'Gentle energy';
  };

  const getVulnerabilityDescription = (percentage: number): string => {
    if (percentage >= 70) return 'Highly sensitive';
    if (percentage >= 50) return 'Moderately open';
    if (percentage >= 30) return 'Well protected';
    return 'Strong boundaries';
  };



  const getBalanceDescription = (percentage: number): string => {
    if (percentage >= 80) return 'Harmonious flow';
    if (percentage >= 60) return 'Good balance';
    if (percentage >= 40) return 'Adjusting flow';
    return 'Seeking balance';
  };

  const getEnergyLevelDescription = (level: number): string => {
    if (level >= 8) return 'Vibrant energy';
    if (level >= 6) return 'Active energy';
    if (level >= 4) return 'Steady energy';
    return 'Calm energy';
  };

  const getMorningEnergyInfluence = (dominant: string, secondary: string): string => {
    const morningInfluences: Record<string, string> = {
      'Red': 'Your red energy ignites your morning with passionate drive and determination.',
      'Orange': 'Orange energy brings creative enthusiasm and social warmth to your mornings.',
      'Yellow': 'Yellow energy illuminates your mind with clarity and optimistic thinking.',
      'Green': 'Green energy grounds you with natural balance and healing intentions.',
      'Blue': 'Blue energy flows through you with peaceful communication and truth.',
      'Indigo': 'Indigo energy opens your intuitive channels for insightful mornings.',
      'Violet': 'Violet energy connects you to higher consciousness and spiritual awareness.',
      'Purple': 'Purple energy transforms your morning with mystical understanding.',
      'Pink': 'Pink energy radiates love and emotional healing throughout your morning.',
      'White': 'White energy purifies your morning with divine protection and clarity.',
      'Gold': 'Gold energy empowers your morning with wisdom and spiritual authority.',
      'Silver': 'Silver energy reflects intuitive insights and lunar wisdom in your morning.'
    };
    return morningInfluences[dominant] || `${dominant} consciousness awakens your morning with divine soul purpose and authentic spiritual expression.`;
  };

  const getPeakEnergyHours = (dominant: string): string => {
    const peakHours: Record<string, string> = {
      'Red': 'Your energy peaks during mid-morning (9-11am) when action-oriented tasks flow naturally.',
      'Orange': 'Peak energy flows in late morning to early afternoon (11am-2pm) for creative pursuits.',
      'Yellow': 'Mental energy peaks during late morning (10am-12pm) for learning and communication.',
      'Green': 'Balanced energy maintains consistency throughout the day with gentle peaks at sunrise and sunset.',
      'Blue': 'Communication energy peaks in afternoon (2-4pm) when truth and clarity are strongest.',
      'Indigo': 'Intuitive energy peaks during twilight hours (6-8pm) for deep insights.',
      'Violet': 'Spiritual energy peaks in early evening (7-9pm) for meditation and connection.',
      'Purple': 'Mystical energy peaks during late evening (8-10pm) for transformation work.',
      'Pink': 'Heart energy maintains steady flow with peaks during mid-afternoon (1-3pm).',
      'White': 'Divine energy flows consistently with peaks during dawn and dusk prayers.',
      'Gold': 'Wisdom energy peaks during afternoon (3-5pm) for important decisions.',
      'Silver': 'Reflective energy peaks during moonlit hours for intuitive guidance.'
    };
    return peakHours[dominant] || `${dominant} energy peaks during cosmic alignment hours when your soul frequency resonates with divine timing.`;
  };

  const getEveningEnergyGuidance = (dominant: string): string => {
    const eveningGuidance: Record<string, string> = {
      'Red': 'Red energy in evening calls for physical release through exercise or passionate activities.',
      'Orange': 'Orange energy encourages creative expression and social connection in evening hours.',
      'Yellow': 'Yellow energy suggests evening journaling or learning to process the days insights.',
      'Green': 'Green energy invites evening nature connection and gentle healing practices.',
      'Blue': 'Blue energy flows into evening meditation and truthful communication with loved ones.',
      'Indigo': 'Indigo energy opens evening hours for psychic development and intuitive practices.',
      'Violet': 'Violet energy elevates evening into spiritual study and consciousness expansion.',
      'Purple': 'Purple energy transforms evening into mystical exploration and magical practices.',
      'Pink': 'Pink energy wraps evening in love meditation and emotional healing rituals.',
      'White': 'White energy purifies evening with prayer, blessing, and divine connection.',
      'Gold': 'Gold energy illuminates evening with wisdom sharing and spiritual teaching.',
      'Silver': 'Silver energy reflects evening into lunar meditation and dream preparation.'
    };
    return eveningGuidance[dominant] || `${dominant} consciousness guides your evening toward soul purpose practices and divine spiritual alignment.`;
  };

  // Helper functions for 9-chakra system calculations (using existing functions below)

  // Color spectrum analysis helper functions (duplicate removed)

  const getColorMeaningForEnergyTab = (color: string): string => {
    const meanings: Record<string, string> = {
      'Red': 'Root chakra energy - survival instinct, life force, physical vitality',
      'Orange': 'Sacral chakra energy - creativity, sexuality, emotional flow',
      'Yellow': 'Solar plexus chakra - personal power, confidence, willpower',
      'Green': 'Heart chakra - unconditional love, healing abilities, compassion',
      'Blue': 'Throat chakra - communication, truth speaking, authentic voice',
      'Indigo': 'Third eye chakra - psychic abilities, intuition, spiritual sight',
      'Violet': 'Crown chakra - spiritual connection, divine consciousness, enlightenment',
      'Purple': 'Higher crown chakra - spiritual mastery, mystical awareness',
      'Pink': 'Higher heart chakra - unconditional love, divine compassion',
      'White': 'Pure divine light - spiritual protection, angelic connection',
      'Gold': 'Christ consciousness - divine wisdom, spiritual illumination',
      'Silver': 'Lunar energy - intuitive wisdom, feminine power, psychic protection',
      'Turquoise': 'Higher throat chakra - healing communication, divine truth',
      'Lavender': 'Spiritual peace - gentle awakening, cosmic consciousness',
      'Coral': 'Creative heart energy - artistic expression, gentle passion',
      'Mint': 'Healing heart energy - renewal power, emotional cleansing',
      'Peach': 'Nurturing heart energy - gentle love, emotional healing',
      'Sky Blue': 'Higher communication - cosmic truth, unlimited expression',
      'Rose': 'Divine love frequency - soul mate connection, heart healing',
      'Amber': 'Ancient earth wisdom - protection energy, timeless knowledge',
      'Gray': 'Neutral wisdom - spiritual balance, cosmic neutrality',
      'Black': 'Shadow integration - transformation power, deep inner work',
      'Crimson': 'Life force power - intense vitality, passionate purpose',
      'Magenta': 'Soul rebellion - unique spiritual path, divine independence',
      'Brown': 'Earth connection - material stability, physical grounding',
      'Beige': 'Gentle grounding - peaceful stability, neutral harmony',
      'Cyan': 'Emotional clarity - healing communication, pure emotion',
      'Lime': 'Fresh life force - new growth energy, spring awakening',
      'Maroon': 'Deep earth power - sustained passion, mature strength',
      'Navy': 'Deep spiritual wisdom - profound intuition, soul depth',
      'Olive': 'Natural harmony - earth wisdom, balanced growth',
      'Teal': 'Heart-throat bridge - healing words, compassionate communication',
      'Bronze': 'Ancient strength - enduring wisdom, protective power',
      'Cobalt': 'Deep cosmic wisdom - mystical knowledge, universal truth',
      'Emerald': 'Pure heart healing - deep compassion, soul growth energy',
      'Jade': 'Balanced heart wisdom - harmonious love, peaceful healing',
      'Sapphire': 'Divine truth seeking - spiritual clarity, soul wisdom',
      'Topaz': 'Golden wisdom - creative intelligence, spiritual creativity'     
    };
    const additionalColorMeanings: Record<string, string> = {
      'Crimson': 'Deep passion energy - intense life force, warrior spirit, primal power',
      'Magenta': 'Soul love energy - divine feminine, cosmic creativity, spiritual passion',
      'Aqua': 'Higher communication - soul voice, mystical truth, divine expression',
      'Navy': 'Deep wisdom energy - cosmic knowledge, soul memory, profound insight',
      'Lime': 'Renewal energy - fresh healing, growth acceleration, emotional cleansing',
      'Maroon': 'Grounded passion - stable strength, earthly wisdom, enduring power',
      'Chocolate': 'Earth wisdom energy - practical spirituality, natural healing, grounded insight',
      'Beige': 'Gentle earth energy - subtle wisdom, peaceful healing, quiet strength',
      'Tan': 'Natural balance energy - earth connection, practical wisdom, stable grounding'
    };
    
    return meanings[color] || additionalColorMeanings[color] || `${color} mastery - Specific chakra activation expressing authentic spiritual gifts through divine consciousness and soul purpose manifestation`;
  };

  const getColorFrequency = (color: string): string => {
    const frequencies: Record<string, string> = {
      'Red': 'Root chakra. Low frequency (430-480 THz) - Grounding and energizing vibration that connects to physical realm.',
      'Orange': 'Sacral chakra. Medium-low frequency (480-510 THz) - Creative and emotional vibration that stimulates passion.',
      'Yellow': 'Solar Plexus. Medium frequency (510-540 THz) - Mental and intellectual vibration that enhances clarity.',
      'Green': 'Heart chakra. Balanced frequency (540-580 THz) - Heart-centered vibration promoting healing and harmony.',
      'Blue': 'Throat chakra. Medium-high frequency (610-670 THz) - Communicative vibration that opens expression.',
      'Indigo': 'Third Eye Chakra. High frequency (670-700 THz) - Intuitive vibration connecting to psychic abilities.',
      'Violet': 'Crown Chakra. Highest frequency (700-750 THz) - Spiritual vibration linking to divine consciousness.',
      'Purple': 'Very high frequency (680-750 THz) - Mystical vibration enhancing spiritual power.',
      'Pink': 'Heart frequency (520-560 THz) - Love vibration that opens compassion centers.',
      'White': 'Full spectrum frequency - Contains all colors, representing complete spiritual integration.',
      'Gold': 'Divine frequency (550-570 THz) - Wisdom vibration connecting to cosmic consciousness.',
      'Silver': 'Soul star chakra. Lunar frequency (480-520 THz) - Reflective vibration enhancing intuitive abilities.',
      'Crimson': 'Earth star chakra. Low frequency (430-480 THz) - Grounding and energizing vibration that connects to physical realm.',
      
    };
    return frequencies[color] || `${color} Frequency - Specific vibrational rate activating corresponding chakra energy centers and soul consciousness pathways through authentic spiritual resonance.`;
  };

  const getChakraConnection = (color: string): string => {
    // Standardized chakra mappings consistent with remedies data
    const chakras: Record<string, string> = {
      'Red': 'Number:9. Planet:Mars. Root Chakra (Muladhara) - Grounding, survival, and physical vitality. Practice: Forgiveness meditation and grounding exercises.',
      'Orange': 'Number:6. Planet:Venus. Sacral Chakra (Svadhisthana) - Creativity, sexuality, and emotional flow. Practice: Creative expression and emotional healing.',
      'Yellow': 'Number:1. Planet:Sun. Solar Plexus Chakra (Manipura) - Personal power, confidence, and mental clarity. Practice: Goal setting and leadership development.',
      'Green': 'Number:2. Planet:Moon. Heart Chakra (Anahata) - Love, compassion, and emotional healing. Practice: Gratitude and relationship harmony.',
      'Blue': 'Number:5. Planet:Mercury. Throat Chakra (Vishuddha) - Communication, truth, and self-expression. Practice: Authentic communication and acts of kindness.',
      'Indigo': 'Number:8. Planet:Saturn. Third Eye Chakra (Ajna) - Intuition, psychic abilities, and inner wisdom. Practice: Meditation and intuition development.',
      'Violet': 'Number:3. Planet:Jupiter. Crown Chakra (Sahasrara) - Spiritual connection and divine consciousness. Practice: Expressive writing and spiritual connection.',
      'Purple': 'Number:3. Planet:Jupiter. Crown Chakra (Sahasrara) - Spiritual connection and divine consciousness. Practice: Mystical exploration and spiritual study.',
      'White': 'Number:7. Planet:Ketu. Soul Star Chakra - Complete chakra alignment and spiritual integration. Practice: Self-compassion and transcendence.',
      'Gold': 'Number:1. Planet:Sun. Solar Plexus Chakra (Manipura) - Divine wisdom and spiritual achievement. Practice: Leadership and confidence building.',
      'Silver': 'Number:7. Planet:Ketu. Soul Star Chakra - Lunar energy and psychic abilities. Practice: Intuitive development and spiritual wisdom.',
      'Brown': 'Number:4. Planet:Rahu. Earth Star Chakra - Grounding, stability, and deep earth connection. Practice: Mindfulness and grounding meditation.',
      'Black': 'Number:4. Planet:Rahu. Earth Star Chakra - Protection, transformation, and grounding. Practice: Stability building and earth connection.',
      'Pink': 'Number:2. Planet:Moon. Heart Chakra (Anahata) - Emotional love, compassion, and gentle healing. Practice: Self-love and emotional healing.',
      'Turquoise': 'Number:5. Planet:Mercury. Throat Chakra (Vishuddha) - Healing communication and emotional clarity. Practice: Truth expression and clear communication.',
      'Magenta': 'Number:2. Planet:Moon. Heart Chakra (Anahata) - Deep love, intensity, and emotional passion. Practice: Emotional flow and relationship harmony.',
      'Crimson': 'Number:9. Planet:Mars. Root Chakra (Muladhara) - Deep passion, intensity, and physical vitality. Practice: Physical grounding and courage building.'
    };
    return chakras[color] || 'This color resonates with multiple chakra centers, creating a unique energetic pattern.';
  };

  const getColorBalance = (primary: string, secondary: string): string => {
    const balances: Record<string, Record<string, string>> = {
      'Red': {
        'Blue': 'Fire and water elements create dynamic balance between action and reflection.',
        'Green': 'Passion balanced with healing creates powerful manifestation abilities.',
        'Yellow': 'Physical energy combined with mental clarity creates strong leadership potential.',
        'Orange': 'Passion combined with creativity enhances artistic and teaching abilities.',
        'Purple': 'Passion combined with spiritual connection creates natural healing and teaching abilities.',
        'White': 'Passion combined with purity creates natural healing and spiritual guidance abilities.',
        'Gold': 'Passion combined with wisdom creates natural healing and spiritual guidance abilities.',
        'Indigo': 'Passion combined with intuition creates natural healing and spiritual guidance abilities.'
      },
      'Blue': {
        'Orange': 'Communication balanced with creativity enhances artistic and teaching abilities.',
        'Red': 'Calm wisdom balances intense passion, creating measured but powerful action.',
        'Yellow': 'Truth and wisdom combine to create excellent teaching and counseling abilities.',
        'Green': 'Communication combined with healing creates natural counseling and teaching abilities.',
        'Purple': 'Communication combined with spiritual connection creates natural counseling and teaching abilities.',
        'White': 'Communication combined with purity creates natural counseling and teaching abilities.',
        'Gold': 'Communication combined with wisdom creates natural counseling and teaching abilities.',
        'Indigo': 'Communication combined with intuition creates natural counseling and teaching abilities.',
        'Pink': 'Communication combined with love creates natural counseling and teaching abilities.',
        'Silver': 'Communication combined with intuition creates natural counseling and teaching abilities.',
        'Turquoise': 'Communication combined with communication creates natural counseling and teaching abilities.'
      },
      'Green': {
        'Purple': 'Healing energy enhanced by spiritual power creates natural healer capabilities.',
        'Red': 'Growth balanced with passion creates dynamic healing and manifestation abilities.',
        'Blue': 'Heart wisdom combined with clear communication creates excellent counseling potential.',
        'Yellow': 'Healing energy combined with mental clarity creates strong analytical healing abilities.',
        'Orange': 'Healing energy combined with creativity creates dynamic healing and artistic abilities.',
        'White': 'Healing energy combined with purity creates natural healing and spiritual guidance abilities.',
        'Gold': 'Healing energy combined with wisdom creates natural healing and spiritual guidance abilities.',
        'Indigo': 'Healing energy combined with intuition creates natural healing and spiritual guidance abilities.',
        'Pink': 'Healing energy combined with love creates natural healing and spiritual guidance abilities.',
        'Silver': 'Healing energy combined with intuition creates natural healing and spiritual guidance abilities.',
        'Turquoise': 'Healing energy combined with communication creates natural healing and spiritual guidance abilities.',
        'Lavender': 'Healing energy combined with intuition creates natural healing and love guidance abilities.',
      }
    };
    return balances[primary]?.[secondary] || balances[secondary]?.[primary] || 
           `The combination of ${primary} and ${secondary} creates a unique energetic balance specific to your spiritual path.`;
  };

  const getColorKeyword = (color: string): string => {
    const keywords: Record<string, string> = {
      'Red': 'Passion & Power',
      'Orange': 'Creativity & Joy',
      'Yellow': 'Wisdom & Clarity',
      'Green': 'Healing & Growth',
      'Blue': 'Truth & Peace',
      'Indigo': 'Intuition & Vision',
      'Violet': 'Spirituality & Transformation',
      'Purple': 'Mysticism & Nobility',
      'Pink': 'Love & Compassion',
      'White': 'Purity & Protection',
      'Gold': 'Divine Wisdom',
      'Silver': 'Lunar Intuition',
      'Turquoise': 'Healing Communication',
      'Lavender': 'Gentle Spirituality',
      'Coral': 'Gentle Passion',
      'Mint': 'Fresh Healing Energy',
      'Peach': 'Gentle Love',
      'Sky Blue': 'Clear Communication',
      'Rose': 'Deep Love',
      'Amber': 'Ancient Wisdom',
      'Gray': 'Balance & Neutrality',
      'Black': 'Power & Protection',
      'Crimson': 'Deep Passion',
      'Magenta': 'Deep Love & Intensity',
      'ocher': 'Ancient Wisdom & Protection',
      'Brown': 'Stability & Practicality',
      'Beige': 'Neutrality & Balance',
      'Cyan': 'Healing Communication',
      'Lime': 'Fresh Healing Energy',
      'Maroon': 'Deep Passion',
      'Navy': 'Deep Intuition & Wisdom',
      'Olive': 'Balance & Harmony',
      'Teal': 'Healing Communication & Purity',
      'Bronze': 'Ancient Wisdom & Protection',
      'Cobalt': 'Deep Intuition & Wisdom',
      'Emerald': 'Fresh Healing Energy & Depth',
      'Jade': 'Fresh Healing Energy & Compassion',
      'Sapphire': 'Trust & Insight',
      'Topaz': 'Ancient Wisdom & Emotions'
        
    };
    return keywords[color] || `${color} Mastery`;
  };

  const getLayerMeaning = (layer: string, color: string): string => {
    const layerMeanings: Record<string, Record<string, string>> = {
      'inner': {
        'Red': 'Your core essence pulses with primal life force and determination.',
        'Blue': 'Your inner truth radiates calm wisdom and spiritual guidance.',
        'Green': 'Your heart center naturally emanates healing and growth energy.',
        'Yellow': 'Your mental core shines with intelligence and spiritual illumination.',
        'Purple': 'Your spiritual essence carries ancient wisdom and mystical power.',
        'White': 'Your inner core radiates pure spiritual energy and divine connection.',
        'Gold': 'Your inner wisdom center emanates divine protection and spiritual authority.',
        'Indigo': 'Your inner intuition center radiates psychic abilities and visionary insights.',
        'Pink': 'Your inner love center emanates unconditional compassion and healing.',
        'Silver': 'Your inner core radiates protection of the divine and of spiritual connection',
        'Turquoise': 'Your inner core center radiates communication and purity and visionary insights.',
        'Lavender': 'Your inner intuition center radiates softness and a quite intutive connection.',
        'Coral': 'Your inner core center radiates passion and warmth and social energy.',
        'Mint': 'Your inner core center radiates fresh healing energy, renewal, growth.',
        'Peach': 'Your inner core center radiates gentle love, caring, emotional warmth.',
        'Sky Blue': 'Your inner core center radiates clear communication, freedom, openness.',
        'Rose': 'Your inner core center radiates deep love, emotional healing, romance.',
        'Amber': 'Your inner core center radiates ancient wisdom, protection, grounding.',
        'Gray': 'Your inner core center radiates balance, neutrality, adaptability.',
        'Black': 'Your inner core center radiates power, protection, transformation.',
        'Crimson': 'Your inner core center radiates deep passion, intensity, vitality.',
        'Magenta': 'Your inner core center radiates deep love, intensity, passion.',
        'ocher': 'Your inner core center radiates ancient wisdom, protection, grounding.',
        'Brown': 'Your inner core center radiates stability, grounding, practicality.',
        'Beige': 'Your inner core center radiates neutrality, balance, adaptability.',
        'Cyan': 'Your inner core center radiates healing communication, emotional clarity.',
        'Lime': 'Your inner core center radiates fresh healing energy, renewal, growth.',
        'Maroon': 'Your inner core center radiates deep passion, intensity, vitality.',
        'Navy': 'Your inner core center radiates deep intuition, wisdom, grounding.'
    
      },
      'middle': {
        'Red': 'Your emotional body processes through passionate and intense feeling.',
        'Blue': 'Your emotional processing flows through peaceful and truthful expression.',
        'Green': 'Your emotional healing naturally balances and harmonizes energy.',
        'Yellow': 'Your emotional intelligence analyzes feelings with clarity and wisdom.',
        'Purple': 'Your emotional body connects feelings to spiritual insights.',
        'White': 'Your emotional body processes feelings with pure spiritual intention.',
        'Gold': 'Your emotional wisdom center radiates divine protection and spiritual authority.',
        'Indigo': 'Your emotional intuition center radiates psychic abilities and visionary insights.',
        'Pink': 'Your emotional love center emanates unconditional compassion and healing.',
        'Silver': 'Your emotional core radiates protection of the divine and of spiritual connection',
        'Turquoise': 'Your emotional core center radiates communication and purity and visionary insights.',
        'Lavender': 'Your emotional intuition center radiates softness and a quite intutive connection.',
        'Coral': 'Your emotional core center radiates passion and warmth and social energy.',
        'Mint': 'Your emotional core center radiates fresh healing energy, renewal, growth.',
        'Peach': 'Your emotional core center radiates gentle love, caring, emotional warmth.',
        'Sky Blue': 'Your emotional core center radiates clear communication, freedom, openness.',
        'Rose': 'Your emotional core center radiates deep love, emotional healing, romance.',
        'Amber': 'Your emotional core center radiates ancient wisdom, protection, grounding.',
        'Gray': 'Your emotional core center radiates balance, neutrality, adaptability.',
        'Black': 'Your emotional core center radiates power, protection, transformation.',
        'Crimson': 'Your emotional core center radiates deep passion, intensity, vitality.',
        'Magenta': 'Your emotional core center radiates deep love, intensity, passion.',
        'ocher': 'Your emotional core center radiates ancient wisdom, protection, grounding.',
        'Brown': 'Your emotional core center radiates stability, grounding, practicality.'
      },
      'outer': {
        'Red': 'You project dynamic energy and commanding presence to the world.',
        'Blue': 'You emanate peaceful authority and trustworthy communication.',
        'Green': 'You radiate healing presence that others find naturally comforting.',
        'Yellow': 'You project intellectual brightness and inspiring optimism.',
        'Purple': 'You emanate spiritual authority and mystical presence.',
        'White': 'You radiate pure spiritual energy and divine connection.',
        'Gold': 'Your outer wisdom center emanates divine protection and spiritual authority.',
        'Indigo': 'Your outer intuition center radiates psychic abilities and visionary insights.',
        'Pink': 'Your outer love center emanates unconditional compassion and healing.',
        'Silver': 'Your outer core radiates protection of the divine and of spiritual connection',
        'Turquoise': 'Your outer core center radiates communication and purity and visionary insights.',
        'Lavender': 'Your outer intuition center radiates softness and a quite intutive connection.',
        'Coral': 'Your outer core center radiates passion and warmth and social energy.',
        'Mint': 'Your outer core center radiates fresh healing energy, renewal, growth.',
        'Peach': 'Your outer core center radiates gentle love, caring, emotional warmth.',
        'Sky Blue': 'Your outer core center radiates clear communication, freedom, openness.',
        'Rose': 'Your outer core center radiates deep love, emotional healing, romance.',
        'Amber': 'Your outer core center radiates ancient wisdom, protection, grounding.',
        'Gray': 'Your outer core center radiates balance, neutrality, adaptability.',
        'Black': 'Your outer core center radiates power, protection, transformation.',
        'Crimson': 'Your outer core center radiates deep passion, intensity, vitality.',
        'Magenta': 'Your outer core center radiates deep love, intensity, passion.'
      }
    };
    return layerMeanings[layer]?.[color] || 
           `Your ${layer} layer radiates ${color.toLowerCase()} mastery - Specific chakra activation creating authentic spiritual expression and divine consciousness manifestation through this energy field`;
  };

  const getEnergyPattern = (primary: string, secondary: string): string => {
    const patterns: Record<string, Record<string, string>> = {
      'Red': {
        'Blue': 'Fire-water pattern - passionate action balanced with calm wisdom, creating powerful leadership energy',
        'Green': 'Fire-earth pattern - vital force channeled through healing, creating natural healer energy',
        'Yellow': 'Fire-air pattern - physical power merged with mental clarity, creating strong manifestation energy',
        'Purple': 'Fire-spirit pattern - earthly passion elevated to spiritual service, creating warrior-mystic energy',
        'Orange': 'Double fire pattern - life force amplified through creativity, creating dynamic artistic energy'
      },
      'Blue': {
        'Red': 'Water-fire pattern - truthful communication empowered by passion, creating inspiring teacher energy',
        'Green': 'Water-earth pattern - peaceful wisdom flowing through healing love, creating gentle counselor energy',
        'Yellow': 'Water-air pattern - clear truth merged with bright intellect, creating wise communicator energy',
        'Purple': 'Water-spirit pattern - authentic voice channeling divine wisdom, creating spiritual messenger energy',
        'Pink': 'Water-heart pattern - truthful expression softened by compassion, creating loving guide energy'
      },
      'Green': {
        'Red': 'Earth-fire pattern - healing love energized by passion, creating dynamic healer energy',
        'Blue': 'Earth-water pattern - heart wisdom expressed through clear truth, creating compassionate teacher energy',
        'Yellow': 'Earth-air pattern - healing heart illuminated by wisdom, creating enlightened healer energy',
        'Purple': 'Earth-spirit pattern - healing love elevated to divine service, creating sacred healer energy',
        'Pink': 'Double heart pattern - healing love amplified by divine compassion, creating pure love energy'
      },
      'Yellow': {
        'Red': 'Air-fire pattern - brilliant mind empowered by passionate will, creating visionary leader energy',
        'Blue': 'Air-water pattern - clear wisdom expressed through peaceful truth, creating wise teacher energy',
        'Green': 'Air-earth pattern - mental clarity grounded in healing love, creating balanced teacher energy',
        'Purple': 'Air-spirit pattern - intellectual wisdom elevated to divine understanding, creating enlightened sage energy',
        'Orange': 'Air-fire pattern - mental brightness enhanced by creative joy, creating inspired teacher energy'
      },
      'Purple': {
        'Red': 'Spirit-fire pattern - divine wisdom empowered by earthly passion, creating spiritual warrior energy',
        'Blue': 'Spirit-water pattern - mystical knowledge expressed through truthful communication, creating prophet energy',
        'Green': 'Spirit-earth pattern - divine love channeled through healing service, creating saint energy',
        'Yellow': 'Spirit-air pattern - cosmic wisdom merged with brilliant intellect, creating master teacher energy',
        'White': 'Double spirit pattern - divine consciousness amplified by pure light, creating avatar energy'
      }
    };
    
    return patterns[primary]?.[secondary] || patterns[secondary]?.[primary] || 
           `${primary}-${secondary} pattern - divine soul frequencies creating cosmic consciousness awakening energy`;
  };

  const getColorMeditation = (color: string): string => {
    const meditations: Record<string, string> = {
      'Red': 'Visualize deep red light at your root chakra. Breathe in strength and grounding energy.',
      'Blue': 'Focus on peaceful blue light at your throat. Breathe in truth and clear communication.',
      'Green': 'Imagine healing green light at your heart center. Breathe in love and harmony.',
      'Yellow': 'Visualize golden yellow light at your solar plexus. Breathe in wisdom and confidence.',
      'Purple': 'Focus on royal purple light at your crown. Breathe in spiritual connection and wisdom.',
      'White': 'Visualize pure white light surrounding your entire aura. Breathe in purity and protection.',
      'Gold': 'Focus on divine gold light at your soul star chakra. Breathe in wisdom and protection.',
      'Indigo': 'Visualize deep indigo light at your third eye. Breathe in intuition and psychic abilities.',
      'Pink': 'Focus on loving pink light at your heart center. Breathe in compassion and healing.',
      'Silver': 'Visualize silver light at your soul star chakra. Breathe in intuition and psychic abilities.',
      'Turquoise': 'Visualize turquoise light at your throat. Breathe in healing communication and emotional clarity.',
      'Lavender': 'Visualize lavender light at your third eye. Breathe in gentle spirituality, peace, calm.',
      'Coral': 'Visualize coral light at your root chakra. Breathe in gentle passion, warmth, social energy.',
      'Mint': 'Visualize mint light at your heart center. Breathe in fresh healing energy, renewal, growth.',
      'Peach': 'Visualize peach light at your heart center. Breathe in gentle love, caring, emotional warmth.',
      'Sky Blue': 'Visualize sky blue light at your throat. Breathe in clear communication, freedom, openness.',
      'Rose': 'Visualize rose light at your heart center. Breathe in deep love, emotional healing, romance.',
      'Amber': 'Visualize amber light at your root chakra. Breathe in ancient wisdom, protection, grounding.',
      'Gray': 'Visualize gray light at your root chakra. Breathe in balance, neutrality, adaptability.',
      'Black': 'Visualize black light at your root chakra. Breathe in power, protection, transformation.',
      'Crimson': 'Visualize crimson light at your root chakra. Breathe in deep passion, intensity, vitality.',
      'Magenta': 'Visualize magenta light at your heart center. Breathe in deep love, intensity, passion.',
      'ocher': 'Visualize ocher light at your root chakra. Breathe in ancient wisdom, protection, grounding.',
      'Brown': 'Visualize brown light at your root chakra. Breathe in stability, grounding, practicality.',
      'Beige': 'Visualize beige light at your root chakra. Breathe in neutrality, balance, adaptability.',
      'Cyan': 'Visualize cyan light at your throat. Breathe in healing communication, emotional clarity.',
      'Lime': 'Visualize lime light at your heart center. Breathe in fresh healing energy, renewal, growth.',
      'Maroon': 'Visualize maroon light at your root chakra. Breathe in deep passion, intensity, vitality.',
      'Navy': 'Visualize navy light at your root chakra. Breathe in deep intuition, wisdom, grounding.',
      'Teal': 'Visualize teal light at your throat. Breathe in healing communication, emotional clarity, purity, connections.',
      'Bronze': 'Visualize bronze light at your root chakra. Breathe in ancient wisdom, protection, grounding.',
    };
    return meditations[color] || `Visualize ${color.toLowerCase()} light at your chakra centers. Breathe in ${color.toLowerCase()} mastery energy for authentic spiritual activation and divine consciousness enhancement.`;
  };

  const getColorHealing = (primary: string, secondary: string): string => {
    return `Wear ${primary.toLowerCase()} clothing or crystals to amplify your natural energy. Balance with ${secondary.toLowerCase()} elements in your environment. Consider ${primary.toLowerCase()} gemstone therapy and ${secondary.toLowerCase()} color breathing exercises.`;
  };
  const getPositiveTraits = (color: string): string => {
    const traits: Record<string, string> = {
      'Red': 'Strong life force, physical vitality, courage, passion, grounding, survival strength, manifestation power, leadership',
      'Orange': 'Creative and sexual energy flowing, emotional expression active, joy, enthusiasm, optimism, social confidence',
      'Yellow': 'Personal power and confidence radiating, strong willpower, mental clarity, wisdom, analytical thinking',
      'Green': 'Love and healing energy flowing, compassionate nature, growth, harmony with nature, balanced emotions',
      'Blue': 'Throat area with extension to jaw and neck - Truth-speaking abilities, authentic communication, peaceful nature',
      'Purple': 'Spiritual awareness awakening, divine connection opening, mystical abilities, intuitive wisdom',
      'Gold': 'Divine wisdom and protection, spiritual achievement, enlightened consciousness, cosmic connection',
      'White': 'Purity and spiritual protection, connection to higher realms, clarity of purpose, divine guidance',
      'Pink': 'Unconditional love, compassion, nurturing energy, heart-centered healing, emotional balance',
      'Silver': 'Protection of the divine and of spiritual connection.',
      'Turquoise': 'Communication and purity and visionary insights.',
      'Lavender': 'Softness and a quite intutive connection.',
      'Coral': 'Passion and warmth and social energy.',
      'Mint': 'Fresh healing energy, renewal, growth.',
      'Peach': 'Gentle love, caring, emotional warmth.',
      
    };
    return traits[color] || `${color} spiritual mastery - Divine consciousness expressing through authentic soul gifts and chakra activation power`;
  };

  const getPositiveDescription = (color: string): string => {
    const descriptions: Record<string, string> = {
      'Red': 'Your red aura energy manifests as powerful grounding force, giving you exceptional physical vitality and the courage to take decisive action. You have natural leadership abilities and can manifest your desires into physical reality.',
      'Orange': 'This vibrant energy makes you naturally creative and socially confident. You experience life with enthusiasm and joy, expressing emotions freely and inspiring others through your optimistic presence.',
      'Yellow': 'Your solar plexus radiates confidence and personal power. You possess strong analytical abilities and mental clarity that helps you make wise decisions and teach others through your accumulated wisdom.',
      'Green': 'This healing energy makes you a natural peacemaker and healer. You create harmony wherever you go and have an innate connection to nature and growth cycles.',
      'Blue': 'Your throat chakra energy enhances truthful communication and authentic self-expression. You naturally inspire trust and can communicate complex ideas with clarity and peace.',
      'Purple': 'This spiritual energy connects you to higher dimensions and mystical understanding. You have natural psychic abilities and can access ancient wisdom.',
      'Gold': 'Your divine connection manifests as spiritual authority and wisdom. You carry protective energy and have achieved significant spiritual development.',
      'White': 'This pure energy provides spiritual protection and connects you directly to source consciousness. You embody clarity and divine guidance.',
      'Pink': 'Your heart chakra radiates unconditional love and compassion. You naturally nurture others and create healing through your loving presence.',
      'Silver': 'Your soul star chakra radiates protection of the divine and of spiritual connection.',
      'Turquoise': 'Your throat chakra radiates communication and purity and visionary insights.',
      'Lavender': 'Your third eye chakra radiates softness and a quite intutive connection.',
      'Coral': 'Your root chakra radiates passion and warmth and social energy.',
      'Mint': 'Your heart chakra radiates fresh healing energy, renewal, growth.',
      'Peach': 'Your heart chakra radiates gentle love, caring, emotional warmth.',
      'Sky Blue': 'Your throat chakra radiates clear communication, freedom, openness.',
      'Rose': 'Your heart chakra radiates deep love, emotional healing, romance.',
      'AMBER': 'Your root chakra radiates ancient wisdom, protection, grounding.',
      'Gray': 'Your root chakra radiates balance, neutrality, adaptability.',
      'Black': 'Your root chakra radiates power, protection, transformation.',
      'Crimson': 'Your root chakra radiates deep passion, intensity, vitality.',
      'Magenta': 'Your heart chakra radiates deep love, intensity, passion.'
      
    };
    return descriptions[color] || 'Your unique energy signature carries powerful positive qualities.';
  };

  const getShadowTraits = (color: string): string => {
    const shadows: Record<string, string> = {
      'Red': 'Anger, aggression, impatience, survival fears, material obsession, explosive emotions, physical tension, restlessness',
      'Orange': 'Emotional overwhelm, sexual imbalance, creative blocks, attention-seeking, superficial expressions',
      'Yellow': 'Mental overthinking, ego dominance, criticism, perfectionism, intellectual arrogance, analysis paralysis',
      'Green': 'Emotional codependency, giving too much, boundary issues, jealousy, possessiveness, healing burnout',
      'Blue': 'Communication blocks, truth avoidance, throat constriction, difficulty expressing authentic self',
      'Purple': 'Spiritual bypassing, disconnection from reality, psychic overwhelm, superiority complex, mystical inflation',
      'Gold': 'Spiritual pride, divine complex, isolation from humanity, perfectionist standards, wisdom hoarding',
      'White': 'Spiritual detachment, avoidance of earthly matters, purity obsession, emotional numbness',
      'Pink': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Silver': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Turquoise': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Lavender': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Coral': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Mint': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Peach': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Sky Blue': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Rose': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'AMBER': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Gray': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality',
      'Black': 'Emotional overwhelm, boundary dissolution, self-sacrifice to detriment, naive trust, victim mentality'
    };
    return shadows[color] || `${color} shadow integration - Specific chakra blockages requiring targeted healing and conscious transformation work`;
  };

  const getShadowDescription = (color: string): string => {
    const descriptions: Record<string, string> = {
      'Red': 'When unbalanced, this powerful energy can manifest as anger, impatience, or survival fears. You may experience explosive emotions or become overly focused on material concerns, losing connection to your spiritual nature.',
      'Orange': 'The shadow side may show up as emotional overwhelm or attention-seeking behaviors. Creative energy can become blocked, leading to frustration or superficial expressions of your true creative potential.',
      'Yellow': 'Mental energy can become overthinking and ego-driven criticism. You might fall into analysis paralysis or develop intellectual arrogance that blocks genuine wisdom and connection with others.',
      'Green': 'The healing nature can become codependent giving or boundary issues. You may exhaust yourself caring for others while neglecting your own needs, or experience jealousy and possessiveness.',
      'Blue': 'Communication blocks can manifest as difficulty expressing your authentic truth. You might avoid difficult conversations or experience throat constriction when trying to speak your truth.',
      'Purple': 'Spiritual energy can lead to disconnection from practical reality or psychic overwhelm. You might develop superiority complex or use spirituality to avoid dealing with earthly responsibilities.',
      'Gold': 'Divine wisdom can manifest as spiritual pride or perfectionist standards. You might isolate yourself from others, feeling they dont understand your elevated consciousness.',
      'White': 'Pure energy can lead to spiritual detachment or avoidance of emotional depth. You might become overly focused on perfection while avoiding the messy aspects of human experience.',
      'Pink': 'Loving energy can become boundary-less giving or naive trust. You might sacrifice yourself to help others or fall into victim mentality when your love isn= not reciprocated.',
      'Silver': 'Loving energy can become boundary-less giving or naive trust. You might sacrifice yourself to help others or fall into victim mentality when your love isn= not reciprocated.',
      'Turquoise': 'Loving energy can become boundary-less giving or naive trust. You might sacrifice yourself to help others or fall into victim mentality when your love isn= not reciprocated.',
      'Lavender': 'Loving energy can become boundary-less giving or naive trust. You might sacrifice yourself to help others or fall into victim mentality when your love isn= not reciprocated.',
      'Coral': 'Loving energy can become boundary-less giving or naive trust. You might sacrifice yourself to help others or fall into victim mentality when your love isn= not reciprocated.',
    };
    return descriptions[color] || `${color} integration needed - Specific chakra healing work required to balance energy imbalances and transform shadow patterns.`;
  };

  const getPlacementDescription = (color: string): string => {
    const placements: Record<string, string> = {
      'Red': 'Base of spine radiating through legs and into earth connection',
      'Orange': 'Sacral center extending to lower abdomen and reproductive organs',
      'Yellow': 'Solar plexus center extending to stomach area',
      'Green': 'Heart center expanding outward to arms and hands',
      'Blue': 'Throat area with extension to jaw and neck',
      'Purple': 'Crown of head with upward spiritual connection',
      'Gold': 'Soul star chakra above the crown, cosmic connection',
      'White': 'Full aura field surrounding entire energy body',
      'Pink': 'Heart chakra higher octave, emotional and spiritual love center',
      'Silver': 'Soul star chakra above the crown, cosmic connection',
      'Turquoise': 'Throat chakra higher octave, emotional and spiritual love center',
      'Lavender': 'Third eye chakra higher octave, emotional and spiritual love center',
      'Mint': 'Heart chakra higher octave, emotional and communication center',
      'Peach': 'Heart chakra chest, emotional and love center',
      'Coral': 'Root chakra lower octave, emotional and love center',
      'Maroon': 'Root chakra higher octave, emotional and love center',
      'Navy': 'around the body octave, emotional and love center',
      'Teal': 'Throat chakra higher octave, emotional and love center',
      'Bronze': 'Root chakra higher octave, emotional and love center',
      'Cobalt': 'head chakra higher octave, understandinf and higher connection',
      
    };
    return placements[color] || `${color} chakra positioning - Specific energy alignment creating focused spiritual activation through precise chakra coordination`;
  };



  const getDetailedPlacement = (color: string): string => {
    const details: Record<string, string> = {
      'Red': 'Powerful grounding energy with strong life force and survival instincts. This energy connects you deeply to the earth and physical realm, providing stability and manifestation power.',
      'Orange': 'Creative life force and sensual energy that flows through your creative and reproductive centers. This placement enhances your ability to create, procreate, and experience joy.',
      'Yellow': 'Personal power radiating from your core, giving you confidence and strong willpower. This energy helps you assert yourself and make decisions from a place of inner strength.',
      'Green': 'Love and healing energy flowing compassionately from your heart center. This placement makes you naturally nurturing and able to heal both yourself and others.',
      'Blue': 'Truth-speaking abilities centered in your throat that enhance authentic communication. This energy helps you express your truth clearly and inspire others through your words.',
      'Purple': 'Spiritual connection opening divine awareness and mystical understanding. This placement connects you to higher dimensions and ancient wisdom.',
      'Gold': 'Divine wisdom and protection flowing from higher spiritual centers. This energy indicates advanced spiritual development and cosmic consciousness.',
      'White': 'Complete spiritual integration surrounding your entire energy field. This placement indicates purity of intention and direct connection to source energy.',
      'Pink': 'Unconditional love emanating from an elevated heart center. This energy transcends personal love and connects you to universal compassion.', 
      'Silver': 'Protection of the divine and of spiritual connection.',
        'Turquoise': 'Communication and purity and visionary insights.',
        'Lavender': 'Softness and a quite intutive connection.',
        'Coral': 'Passion and warmth and social energy.',
        'Mint': 'Fresh healing energy, renewal, growth.',
        'Peach': 'Gentle love, caring, emotional warmth.',
    };
    return details[color] || `${color} energy creates specific chakra activation patterns through multi-dimensional spiritual field positioning and authentic soul consciousness expression.`;
  };

  const getSecondaryColorDescription = (color: string): string => {
    return `${getColorMeaningForEnergyTab(color)} This secondary energy creates a supportive foundation that balances and enhances your dominant energy pattern.`;
  };

  const getSupportingColorLocation = (color: string, index: number): string => {
    const locations = [
      'Heart center expanding outward to arms and hands - Love and healing energy flowing, compassionate nature',
      'Throat area with extension to jaw and neck - Truth-speaking abilities, authentic communication development',
      'Crown of head with upward spiritual connection - Spiritual awareness awakening, divine connection opening',
      'Third eye chakra showing a movemnt in the spiritual direction from you',
      'Throat chakra explanding around the face and neck shows a communication',
      'Root chakra around the body shows a grounding and stability',
      'Heart chakra around the body shows a love and compassion',
      'Crown chakra colours around the body shows a intellectual connection',
      'Sacral chakra around the body shows a creative and sensual energy',
      'Solar plexus around the body shows a personal power and confidence',
      'Third eye chakra around the body shows a spiritual awareness and divine connection',
      'Crown chakra around the body shows a spiritual awareness and divine connection',
      'Throat chakra around the body shows a truth-speaking abilities and authentic communication',
    ];
    return locations[index] || 'Divine energy anchor point - cosmic positioning for spiritual growth and soul evolution';
  };

  const getSupportingColorDescription = (color: string): string => {
    const supportingDescriptions: Record<string, string> = {
      'Red': 'Root chakra support - strengthens your foundation with grounding, survival instincts, and physical vitality',
      'Orange': 'Sacral chakra support - enhances your creativity with emotional flow, artistic expression, and joyful passion',
      'Yellow': 'Solar plexus support - empowers your confidence with personal power, mental clarity, and intellectual wisdom',
      'Green': 'Heart chakra support - opens your compassion with healing love, emotional balance, and natural harmony',
      'Blue': 'Throat chakra support - clarifies your communication with truthful expression, authentic voice, and peaceful wisdom',
      'Indigo': 'Third eye support - awakens your intuition with psychic abilities, inner knowing, and spiritual sight',
      'Purple': 'Crown chakra support - connects your spirit with divine wisdom, mystical awareness, and cosmic consciousness',
      'Pink': 'Higher heart support - expands your love with unconditional compassion, divine grace, and soul connection',
      'Gold': 'Christ consciousness support - illuminates your purpose with divine wisdom, spiritual mastery, and soul mission',
      'Silver': 'Lunar energy support - activates your intuition with feminine wisdom, psychic protection, and mystical insight',
      'White': 'Pure light support - purifies your energy with spiritual protection, angelic connection, and divine grace',
      'Turquoise': 'Higher throat support - elevates your expression with healing communication, divine truth, and soul voice'
    };
    
    return supportingDescriptions[color] || `${color} frequency support - channels divine consciousness through authentic spiritual expression and soul purpose activation`;
  };

  const getEnergyFlowPattern = (primary: string, secondary: string): string => {
    const flowPatterns: Record<string, Record<string, string>> = {
      'Red': {
        'Blue': 'Passion flows into peaceful wisdom - fiery determination channeled through calm truth-speaking',
        'Green': 'Life force flows into healing love - vital energy channeled through heart-centered compassion',
        'Yellow': 'Physical power flows into mental clarity - grounding strength channeled through brilliant wisdom',
        'Purple': 'Earthly passion flows into divine wisdom - material strength channeled through spiritual service',
        'Orange': 'Root vitality flows into creative joy - survival energy channeled through artistic expression'
      },
      'Blue': {
        'Red': 'Peaceful truth flows into passionate action - calm wisdom channeled through determined service',
        'Green': 'Clear communication flows into healing love - authentic voice channeled through heart wisdom',
        'Yellow': 'Truthful wisdom flows into mental brilliance - honest expression channeled through intellectual clarity',
        'Purple': 'Authentic voice flows into mystical knowing - truthful communication channeled through divine wisdom',
        'Pink': 'Clear truth flows into gentle love - honest expression channeled through compassionate understanding'
      },
      'Green': {
        'Red': 'Healing love flows into passionate service - heart wisdom channeled through determined action',
        'Blue': 'Heart compassion flows into truthful expression - healing love channeled through authentic communication',
        'Yellow': 'Emotional healing flows into mental clarity - heart wisdom channeled through brilliant understanding',
        'Purple': 'Heart love flows into spiritual service - healing compassion channeled through divine wisdom',
        'Pink': 'Heart healing flows into divine love - compassionate service channeled through unconditional acceptance'
      },
      'Yellow': {
        'Red': 'Mental clarity flows into passionate manifestation - brilliant wisdom channeled through determined action',
        'Blue': 'Intellectual light flows into peaceful truth - mental clarity channeled through honest communication',
        'Green': 'Brilliant wisdom flows into healing service - mental clarity channeled through heart-centered action',
        'Purple': 'Intellectual understanding flows into spiritual wisdom - mental clarity channeled through divine knowing',
        'Orange': 'Mental brightness flows into creative expression - intellectual clarity channeled through joyful creation'
      },
      'Purple': {
        'Red': 'Divine wisdom flows into earthly service - spiritual knowing channeled through passionate action',
        'Blue': 'Mystical understanding flows into truthful expression - divine wisdom channeled through authentic voice',
        'Green': 'Spiritual love flows into healing service - divine compassion channeled through heart-centered action',
        'Yellow': 'Cosmic consciousness flows into mental clarity - spiritual wisdom channeled through brilliant understanding',
        'White': 'Divine knowing flows into pure light - mystical consciousness channeled through spiritual illumination'
      }
    };
    
    return flowPatterns[primary]?.[secondary] || flowPatterns[secondary]?.[primary] || 
           `${primary} consciousness flows into ${secondary} expression - divine soul energy channeled through authentic spiritual service`;
  };

  const getBalancingRecommendations = (primary: string, secondary: string): string => {
    const balancingGuidance: Record<string, Record<string, string>> = {
      'Red': {
        'Blue': 'Balance passion with meditation - physical exercise followed by calming breathwork and truthful journaling',
        'Green': 'Balance action with compassion - grounding exercises followed by heart-opening yoga and nature connection',
        'Yellow': 'Balance strength with wisdom - weightlifting or martial arts followed by study and intellectual pursuits',
        'Purple': 'Balance earthly work with spiritual practice - physical service followed by meditation and prayer',
        'Orange': 'Balance power with creativity - strength training followed by artistic expression and joyful creation'
      },
      'Blue': {
        'Red': 'Balance communication with action - vocal exercises followed by physical movement and passionate pursuits',
        'Green': 'Balance truth with love - honest expression followed by heart-centered healing and compassionate service',
        'Yellow': 'Balance voice with mind - singing or chanting followed by intellectual study and mental clarity practices',
        'Purple': 'Balance authentic speaking with spiritual silence - truthful communication followed by mystical meditation',
        'Pink': 'Balance clear expression with gentle love - honest dialogue followed by compassionate listening and heart work'
      },
      'Green': {
        'Red': 'Balance healing with vitality - heart-opening meditation followed by energizing physical activity',
        'Blue': 'Balance love with truth - compassionate service followed by honest communication and authentic expression',
        'Yellow': 'Balance emotion with intellect - heart meditation followed by mental study and clarity practices',
        'Purple': 'Balance human love with divine love - emotional healing followed by spiritual contemplation',
        'Pink': 'Balance healing service with self-love - caring for others followed by self-compassion and inner nurturing'
      },
      'Yellow': {
        'Red': 'Balance mental work with physical action - intellectual study followed by vigorous exercise and grounding',
        'Blue': 'Balance thinking with speaking - mental clarity practices followed by truthful communication and expression',
        'Green': 'Balance mind with heart - intellectual pursuits followed by emotional healing and compassionate service',
        'Purple': 'Balance human wisdom with divine wisdom - mental study followed by spiritual contemplation and mystical practice',
        'Orange': 'Balance intellect with creativity - analytical work followed by artistic expression and joyful creation'
      },
      'Purple': {
        'Red': 'Balance spiritual practice with earthly service - meditation followed by passionate action and material work',
        'Blue': 'Balance mystical silence with truthful expression - contemplative prayer followed by authentic communication',
        'Green': 'Balance divine love with human service - spiritual communion followed by healing work and compassionate action',
        'Yellow': 'Balance cosmic consciousness with practical wisdom - mystical meditation followed by intellectual study',
        'White': 'Balance divine communion with pure service - deep spiritual practice followed by selfless action and light work'
      }
    };
    
    return balancingGuidance[primary]?.[secondary] || balancingGuidance[secondary]?.[primary] || 
           `Balance ${primary} energy with ${secondary} expression - alternate between focused spiritual practice and authentic soul service`;
  };

  const getOptimalEnergyTimes = (color: string): string => {
    const times: Record<string, string> = {
      'Red': 'Dawn and early morning hours when life force is strongest. Physical activity and grounding work are most effective during sunrise.',
      'Orange': 'Late morning to early afternoon when creative energy peaks. Best time for artistic work and emotional expression.',
      'Yellow': 'Midday when solar energy is strongest. Optimal for intellectual work, decision-making, and personal power practices.',
      'Green': 'Late afternoon and early evening when heart energy is most receptive. Perfect for healing work and compassionate activities.',
      'Blue': 'Evening hours when communication flows most clearly. Ideal time for truth-telling and authentic expression.',
      'Purple': 'Night hours and pre-dawn when spiritual veils are thinnest. Best for meditation, psychic work, and mystical practices.',
      'Gold': 'Sacred hours of dawn and dusk when divine energy is most accessible. Optimal for spiritual practices and wisdom work.',
      'White': 'All hours carry equal potential as this energy transcends time. Particularly strong during meditation and prayer.',
      'Pink': 'Heart-opening hours of sunrise and sunset when love energy is most expansive. Perfect for compassion practices.'
    };
    return times[color] || `${color} consciousness flows through cosmic timing - sacred power hours activate during lunar phases and divine spiritual alignment.`;
  };

  const getCompatibleEnergies = (color: string): string => {
    const compatible: Record<string, string> = {
      'Red': 'Orange (creativity), Yellow (personal power), and Earth energies. Compatible with other grounding and manifestation forces.',
      'Orange': 'Red (passion), Yellow (joy), and Water energies. Harmonizes with creative and emotional expression energies.',
      'Yellow': 'Orange (creativity), Green (balance), and Fire energies. Resonates with intellectual and solar-powered energies.',
      'Green': 'Blue (communication), Pink (love), and Earth energies. Harmonizes with heart-centered and healing energies.',
      'Blue': 'Green (healing), Purple (spirituality), and Air energies. Compatible with truth and communication frequencies.',
      'Purple': 'Blue (truth), White (purity), and Cosmic energies. Resonates with spiritual and mystical frequencies.',
      'Gold': 'Compatible with high-frequency spiritual energies.',
      'White': 'All colors as it contains the full spectrum. Harmonizes with any authentic spiritual energy.',
      'Pink': 'Green (healing), White (purity), and Heart energies. Compatible with all love-based frequencies.',
      'Silver': 'All colors as it contains the full spectrum. Harmonizes with any authentic spiritual energy.',
      'Turquoise': 'Green (healing), Purple (spirituality), and Air energies. Compatible with truth and communication frequencies.',
      'Lavender': 'Blue (truth), White (purity), and Cosmic energies. Resonates with spiritual and mystical frequencies.',
      'Coral': 'Orange (creativity), Yellow (personal power), and Earth energies. Compatible with other grounding and manifestation forces.',
      'Mint': 'Blue (communication), Pink (love), and Earth energies. Harmonizes with heart-centered and healing energies.',
      'Peach': 'All colors as it contains the full spectrum. Harmonizes with any authentic spiritual energy.',
      'Sky Blue': 'Green (healing), Purple (spirituality), and Air energies. Compatible with truth and communication frequencies.',
      'Rose': 'Green (healing), White (purity), and Heart energies. Compatible with all love-based frequencies.',
      
    };
    const additionalCompatible: Record<string, string> = {
      'Crimson': 'Maroon (deep earth), Red (life force), and Fire energies. Resonates with intense manifestation and warrior spirit frequencies.',
      'Magenta': 'Pink (divine love), Purple (mysticism), and Cosmic feminine energies. Compatible with soul creativity and divine rebellion frequencies.',
      'Aqua': 'Turquoise (healing communication), Blue (truth), and Water energies. Harmonizes with soul voice and mystical truth frequencies.',
      'Navy': 'Indigo (wisdom), Blue (communication), and Deep water energies. Compatible with profound knowledge and soul memory frequencies.',
      'Lime': 'Green (healing), Yellow (renewal), and Fresh earth energies. Resonates with growth acceleration and emotional cleansing frequencies.',
      'Maroon': 'Red (passion), Brown (earth), and Stable earth energies. Compatible with grounded strength and enduring wisdom frequencies.',
      'Chocolate': 'Brown (earth), Green (natural), and Deep earth energies. Harmonizes with practical spirituality and natural healing frequencies.',
      'Beige': 'Brown (earth), White (peace), and Gentle earth energies. Compatible with subtle wisdom and peaceful stability frequencies.',
      'Tan': 'Brown (earth), Yellow (balance), and Natural earth energies. Resonates with earth connection and practical wisdom frequencies.'
    };
    
    return compatible[color] || additionalCompatible[color] || 'Divine soul frequency - harmonizes with cosmic consciousness and authentic spiritual vibrations.';
  };
  
  // Function to generate aura visualization with colored clouds
  // Function to process the uploaded image with aura colors

  const processImageWithAura = (imageBase64: string, auraData: AuraAnalysisResult): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx?.drawImage(img, 0, 0);
        
        if (ctx) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const maxRadius = Math.max(canvas.width, canvas.height) * 0.6;
          
          // Calculate energy colors for the 4 zones with proper spiritual mapping
          const thinkingColor = getAccurateColorCode(auraData.dominantColor);           // Crown - How you think
          const receivingColor = getAccurateColorCode(getReceivingEnergyColor(auraData)); // Left - Receiving from environment (dynamic)
          const givingColor = getAccurateColorCode(getGivingEnergyColor(auraData));       // Right - Giving energy, life patterns (dynamic)
          const personalityColor = getAccurateColorCode(getPersonalityColor(auraData));   // Overall - Static personality (why things happen)
          
          // 1. Personality Color - Static background around entire picture
          ctx.globalCompositeOperation = 'multiply';
          const personalityGlow = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, maxRadius * 2
          );
          personalityGlow.addColorStop(0, 'transparent');
          personalityGlow.addColorStop(0.8, `${personalityColor}25`);
          personalityGlow.addColorStop(0.8, `${personalityColor}40`);
          personalityGlow.addColorStop(1, `${personalityColor}20`);
          
          ctx.fillStyle = personalityGlow;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 2. Crown/Thinking Energy - Above head (how you think)
          ctx.globalCompositeOperation = 'overlay';
          const headY = canvas.height * 0.25;
          const headRadius = Math.min(canvas.width, canvas.height) * 0.12;
          const thinkingGlow = ctx.createRadialGradient(
            centerX, headY, 0,
            centerX, headY, headRadius * 1.5
          );
          thinkingGlow.addColorStop(0, `${thinkingColor}90`);
          thinkingGlow.addColorStop(0.8, `${thinkingColor}70`);
          thinkingGlow.addColorStop(0.9, `${thinkingColor}40`);
          thinkingGlow.addColorStop(1, 'transparent');
          
          ctx.fillStyle = thinkingGlow;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 3. Receiving Energy - Left side (dynamic environmental intake)
          ctx.globalCompositeOperation = 'overlay';
          const leftX = canvas.width * 0.5;
          const leftY = centerY;
          const sideRadius = Math.min(canvas.width, canvas.height) * 0.3;
          
          // Create flowing receiving energy pattern
          for (let i = 0; i < 3; i++) {
            const offsetY = leftY + (i - 1) * canvas.height * 0.2;
            const receivingGlow = ctx.createRadialGradient(
              leftX, offsetY, 0,
              leftX + sideRadius * 0.9, offsetY, sideRadius
            );
            receivingGlow.addColorStop(0, `${receivingColor}${80 - i * 15}`);
            receivingGlow.addColorStop(0.8, `${receivingColor}${60 - i * 10}`);
            receivingGlow.addColorStop(1, `${receivingColor}${30 - i * 5}`);
            receivingGlow.addColorStop(1, 'transparent');
            
            ctx.fillStyle = receivingGlow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          // 4. Giving Energy - Right side (dynamic life pattern creation)
          ctx.globalCompositeOperation = 'overlay';
          const rightX = canvas.width * 0.5;
          const rightY = centerY;
        
          // Create flowing giving energy pattern
          for (let i = 0; i < 3; i++) {
            const offsetY = rightY + (i - 1) * canvas.height * 0.2;
            const givingGlow = ctx.createRadialGradient(
              rightX, offsetY, 0,
              rightX - sideRadius * 0.9, offsetY, sideRadius
            );
            givingGlow.addColorStop(0, `${givingColor}${80 - i * 15}`);
            givingGlow.addColorStop(0.8, `${givingColor}${60 - i * 10}`);
            givingGlow.addColorStop(1, `${givingColor}${30 - i * 5}`);
            givingGlow.addColorStop(1, 'transparent');
            
            ctx.fillStyle = givingGlow;
            ctx.fillRect(0, 3, canvas.width, canvas.height);
          }
          
          // 5. Add energy flow connections between zones
          ctx.globalCompositeOperation = 'overlay';
          ctx.strokeStyle = `${thinkingColor}80`;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          
          // Thinking to receiving flow (how thoughts receive environmental input)
          ctx.beginPath();
          ctx.moveTo(centerX - headRadius * 0.8, headY + headRadius * 0.3);
          ctx.quadraticCurveTo(leftX + sideRadius * 0.8, centerY * 0.7, leftX + sideRadius * 0.3, leftY);
          ctx.stroke();
          
          // Thinking to giving flow (how thoughts create life patterns)
          ctx.beginPath();
          ctx.moveTo(centerX + headRadius * 0.5, headY + headRadius * 0.3);
          ctx.quadraticCurveTo(rightX - sideRadius * 0.8, centerY * 0.7, rightX - sideRadius * 0.3, rightY);
          ctx.stroke();
          
          // Add subtle sparkle effects around thinking area
          ctx.globalCompositeOperation = 'overlay';
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sparkleX = centerX + Math.cos(angle) * headRadius * 1.2;
            const sparkleY = headY + Math.sin(angle) * headRadius * 0.8;
            
            const sparkle = ctx.createRadialGradient(
              sparkleX, sparkleY, 0,
              sparkleX, sparkleY, headRadius * 0.15
            );
            sparkle.addColorStop(0, `${thinkingColor}70`);
            sparkle.addColorStop(1, 'transparent');
            
            ctx.fillStyle = sparkle;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over';
        }
        
        resolve(canvas.toDataURL());
      };
      
      img.src = imageBase64;
    });
  };

  const generateAuraVisualization = (originalImageBase64: string | undefined, auraData: AuraAnalysisResult) => {
    if (!originalImageBase64) return;
    
    // Create a new image element to work with
    const img = new Image();
    img.src = originalImageBase64;
    
    img.onload = () => {
      // Create a canvas to draw on
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // Get dominant and secondary colors
      const dominantColor = getAccurateColorCode(auraData.dominantColor);
      const secondaryColor = getAccurateColorCode(auraData.secondaryColor || auraData.dominantColor);
      
      // Draw aura clouds
      drawAuraClouds(ctx, img.width, img.height, dominantColor, secondaryColor, auraData.energyLevel);
      
      // Convert back to base64
      const enhancedImageBase64 = canvas.toDataURL('image/jpeg');
      setEnhancedAuraImage(enhancedImageBase64);
    };
  };
  
  // Function to draw aura cloud effects
  const drawAuraClouds = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    dominantColor: string, 
    secondaryColor: string,
    energyLevel: number
  ) => {
    // Map color names to rgba values
    const colorMap: Record<string, string> = {
      red: 'rgba(255, 0, 0, 0.3)',
      orange: 'rgba(255, 165, 0, 0.3)',
      yellow: 'rgba(255, 255, 0, 0.3)',
      green: 'rgba(0, 128, 0, 0.3)',
      blue: 'rgba(0, 0, 255, 0.3)',
      indigo: 'rgba(75, 0, 130, 0.3)',
      violet: 'rgba(148, 0, 211, 0.3)',
      purple: 'rgba(128, 0, 128, 0.3)',
      pink: 'rgba(255, 182, 193, 0.3)',
      white: 'rgba(255, 255, 255, 0.3)',
      gold: 'rgba(255, 215, 0, 0.3)',
      silver: 'rgba(192, 192, 192, 0.3)',
      black: 'rgba(0, 0, 0, 0.3)',
      turquoise: 'rgba(64, 224, 208, 0.3)',
      magenta: 'rgba(255, 0, 255, 0.3)',
      brown: 'rgba(165, 42, 42, 0.3)',
      ocher: 'rgba(255, 255, 0, 0.3)',
      lavender: 'rgba(230, 230, 250, 0.3)',
      coral: 'rgba(255, 127, 80, 0.3)',
      mint: 'rgba(152, 251, 152, 0.3)',
      peach: 'rgba(255, 218, 185, 0.3)',
      skyblue: 'rgba(135, 206, 235, 0.3)',
      rose: 'rgba(255, 105, 180, 0.3)',
      amber: 'rgba(255, 191, 0, 0.3)',
      gray: 'rgba(128, 128, 128, 0.3)',
      cyan: 'rgba(0, 255, 255, 0.3)',
      lime: 'rgba(0, 255, 0, 0.3)',
      maroon: 'rgba(128, 0, 0, 0.3)',
      navy: 'rgba(0, 0, 128, 0.3)',
      olive: 'rgba(128, 128, 0, 0.3)',
      teal: 'rgba(0, 128, 128, 0.3)',
      bronze: 'rgba(205, 127, 50, 0.3)',
      cobalt: 'rgba(0, 71, 171, 0.3)',
      emerald: 'rgba(80, 200, 120, 0.3)',
      jade: 'rgba(0, 163, 108, 0.3)',
      sapphire: 'rgba(15, 82, 186, 0.3)',
      topaz: 'rgba(255, 200, 124, 0.3)'
      
    };
    
    // Get RGBA values for dominant and secondary colors
    const dominantRgba = colorMap[dominantColor] || 'rgba(255, 255, 255, 0.3)';
    const secondaryRgba = colorMap[secondaryColor] || 'rgba(128, 128, 255, 0.3)';
    
    // Create a radial gradient for the aura effect
    const centerX = width / 4;
    const centerY = height / 4;
    
    // Intensity of the aura based on energy level (1-10)
    const intensityFactor = energyLevel / 10;
    const auraSize = Math.max(width, height) * (0.2 + intensityFactor * 0.3);
    
    // Draw multiple layers of aura clouds with different opacities and sizes
    for (let i = 0; i < 5; i++) {
      const radius = auraSize * (0.6 + i * 0.2);
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.2,
        centerX, centerY, radius
      );
      
      // Add color stops with varying opacity
      const opacity = 1 - i * 0.02;
      gradient.addColorStop(0, dominantRgba.replace('0.3', `${opacity + 0.1}`));
      gradient.addColorStop(0.4, dominantRgba.replace('0.3', `${opacity}`));
      gradient.addColorStop(0.6, secondaryRgba.replace('0.3', `${opacity}`));
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      // Apply the gradient
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw cloud-like shapes
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        const cloudX = centerX + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
        const cloudY = centerY + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
        const cloudRadius = radius * 0.3 * (0.7 + Math.random() * 0.6);
        
        ctx.moveTo(cloudX + cloudRadius, cloudY);
        ctx.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2);
      }
      
      ctx.fill();
    }
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  };

  // Function to calculate numerology based on name and birth date
  const calculateNumerologyData = async (name: string, birthDate: string) => {
    if (!name || !birthDate) {
      toast({
        title: "Missing information",
        description: "Please provide both your full name and birth date",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculatingNumerology(true);
    
    try {
      const data = await calculateNumerology(name, birthDate);
      setNumerologyResult(data);
      
      if (activeTab !== "combined") {
        setActiveTab("combined");
      }
      
      toast({
        title: "Combined Analysis Ready",
        description: `Your Life Path Number is ${data.lifePathNumber} - viewing combined insights`,
      });
      
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: error instanceof Error ? error.message : "Failed to calculate numerology",
        variant: "destructive"
      });
    } finally {
      setIsCalculatingNumerology(false);
    }
  };

  // Function to generate combined insights from aura and numerology
  const getCombinedInsights = (aura: AuraAnalysisResult, numerology: NumerologyResult) => {
    // Enhanced color-to-chakra-number mapping based on remedies data
    const colorToChakraMapping: Record<string, {
      number: number, 
      chakra: string, 
      planet: string, 
      color: string, 
      mantra: string, 
      crystal: string[], 
      remedies: string[],
      archangel: string,
      practices: string[]
    }> = {
      'Yellow': {
        number: 1, chakra: 'Solar Plexus Chakra', planet: 'Sun', color: 'Yellow',
        mantra: 'RAM', crystal: ['Citrine', 'Tiger\'s Eye'], archangel: 'Archangel Michael',
        remedies: ['Goal Setting and Achievement', 'Leadership Development', 'Self-Confidence Building'],
        practices: ['Set 3 short-term and 1 long-term goal weekly', 'Practice power affirmations', 'Visualize yellow light in solar plexus']
      },
      'Green': {
        number: 2, chakra: 'Heart Chakra', planet: 'Moon', color: 'Green or Pink',
        mantra: 'YAM', crystal: ['Rose Quartz', 'Green Aventurine', 'Rhodocrosite'], archangel: 'Archangel Raphael',
        remedies: ['Gratitude Practice', 'Emotional Healing', 'Relationship Harmony'],
        practices: ['Write 3 gratitudes daily', 'Practice forgiveness meditation', 'Send love to heart chakra']
      },
      'Violet': {
        number: 3, chakra: 'Crown Chakra', planet: 'Jupiter', color: 'Violet or White',
        mantra: 'AUM', crystal: ['Clear Quartz', 'Selenite', 'Lepidolite'], archangel: 'Archangel Metatron',
        remedies: ['Expressive Writing', 'Spiritual Connection', 'Divine Guidance'],
        practices: ['Write for 10 minutes daily about challenges', 'Practice crown chakra meditation', 'Connect with divine wisdom']
      },
      'Brown': {
        number: 4, chakra: 'Earth Star Chakra', planet: 'Rahu', color: 'Brown or Black',
        mantra: 'LAM', crystal: ['Smoky Quartz', 'Hematite', 'Red Jasper'], archangel: 'Archangel Ariel',
        remedies: ['Mindfulness Meditation', 'Grounding Practices', 'Stability Building'],
        practices: ['Practice 10 minutes mindfulness daily', 'Connect with earth energy', 'Focus on stability and foundation']
      },
      'Blue': {
        number: 5, chakra: 'Throat Chakra', planet: 'Mercury', color: 'Blue',
        mantra: 'HAM', crystal: ['Blue Lace Agate', 'Lapis Lazuli', 'Aquamarine'], archangel: 'Archangel Zadkiel',
        remedies: ['Communication Enhancement', 'Truth Expression', 'Random Acts of Kindness'],
        practices: ['Perform one act of kindness daily', 'Practice authentic communication', 'Chant throat chakra mantras']
      },
      'Orange': {
        number: 6, chakra: 'Sacral Chakra', planet: 'Venus', color: 'Orange',
        mantra: 'VAM', crystal: ['Carnelian', 'Moonstone', 'Orange Calcite'], archangel: 'Archangel Gabriel',
        remedies: ['Creative Expression', 'Emotional Flow', 'Strengths-Based Reflection'],
        practices: ['Identify and use personal strengths weekly', 'Express creativity daily', 'Practice emotional flow meditation']
      },
      'White': {
        number: 7, chakra: 'Soul Star Chakra', planet: 'Ketu', color: 'White or Silver',
        mantra: 'OM', crystal: ['Clear Quartz', 'Selenite', 'Moonstone'], archangel: 'Archangel Sandalphon',
        remedies: ['Self-Compassion Practice', 'Spiritual Wisdom', 'Inner Peace'],
        practices: ['Practice self-compassion daily', 'Engage in spiritual study', 'Meditate on transcendence']
      },
      'Indigo': {
        number: 8, chakra: 'Third Eye Chakra', planet: 'Saturn', color: 'Indigo or Deep Blue',
        mantra: 'OM', crystal: ['Amethyst', 'Sodalite', 'Fluorite'], archangel: 'Archangel Raziel',
        remedies: ['Strategic Planning', 'Intuition Development', 'Manifestation'],
        practices: ['Set clear intentions weekly', 'Practice third eye meditation', 'Develop intuitive abilities']
      },
      'Red': {
        number: 9, chakra: 'Root Chakra', planet: 'Mars', color: 'Red',
        mantra: 'LAM', crystal: ['Red Jasper', 'Garnet', 'Bloodstone'], archangel: 'Archangel Uriel',
        remedies: ['Forgiveness Practice', 'Physical Grounding', 'Service to Others'],
        practices: ['Write forgiveness letters weekly', 'Practice grounding exercises', 'Engage in humanitarian service']
      }
    };

    // Get mapping for dominant aura color (fallback to closest match)
    const getClosestColorMapping = (color: string) => {
      const colorMap: Record<string, string> = {
        'Gold': 'Yellow', 'Silver': 'White', 'Purple': 'Violet', 
        'Pink': 'Green', 'Turquoise': 'Blue', 'Cyan': 'Blue',
        'Crimson': 'Red', 'Magenta': 'Red', 'Maroon': 'Red',
        'Navy': 'Blue', 'Teal': 'Blue', 'Lime': 'Green',
        'Emerald': 'Green', 'Jade': 'Green', 'Sapphire': 'Blue',
        'Topaz': 'Yellow', 'Amber': 'Yellow', 'Coral': 'Orange',
        'Lavender': 'Violet', 'Mint': 'Green', 'Peach': 'Orange',
        'Rose': 'Green', 'Sky Blue': 'Blue'
      };
      return colorMap[color] || color;
    };

    const dominantColorKey = getClosestColorMapping(aura.dominantColor);
    const dominantColorMapping = colorToChakraMapping[dominantColorKey] || colorToChakraMapping['White'];
    
    // Calculate dominant soul chakra based on numerology
    const dominantSoulChakra = calculateDominantSoulChakra(numerology.lifePathNumber);
    const dominantSoulChakraName = getDominantSoulChakraName(dominantSoulChakra);
    
    // Enhanced compatibility analysis
    const isNumerologyAligned = dominantColorMapping.number === numerology.lifePathNumber;
    const chakraResonance = Math.abs(dominantColorMapping.number - numerology.lifePathNumber) <= 2;
    
    const energyAlignment = isNumerologyAligned ? 'Perfect Alignment' : 
                           chakraResonance ? 'Highly Aligned' : 'Growth Opportunity';
    
    const compatibility = isNumerologyAligned ? 
      `Your ${aura.dominantColor} aura is in perfect harmony with your Life Path ${numerology.lifePathNumber}, creating powerful manifestation abilities through the ${dominantColorMapping.chakra}.` :
      chakraResonance ?
      `Your ${aura.dominantColor} aura resonates well with your Life Path ${numerology.lifePathNumber}, offering balanced energy between ${dominantColorMapping.chakra} and your natural ${dominantSoulChakraName} tendencies.` :
      `Your ${aura.dominantColor} aura presents a transformative opportunity with Life Path ${numerology.lifePathNumber}, encouraging integration of ${dominantColorMapping.chakra} energy into your ${dominantSoulChakraName} nature.`;

    // Enhanced spiritual guidance
    const spiritualGuidance = `Your ${aura.dominantColor} aura resonates with the ${dominantColorMapping.chakra}, governed by ${dominantColorMapping.planet} and supported by ${dominantColorMapping.archangel}. Combined with Life Path ${numerology.lifePathNumber}, this creates a powerful spiritual signature focused on ${dominantColorMapping.remedies[0]}. Your energy field is naturally attuned to ${dominantSoulChakraName} development, enhanced by ${dominantColorMapping.planet} planetary influences.`;

    // Personality integration with chakra influences
    const personalityIntegration = `Your Personality Number ${numerology.personalityNumber} manifests through your ${aura.dominantColor} aura energy, channeling ${dominantColorMapping.chakra} qualities. Others perceive you as someone with natural ${getPersonalityTraits(numerology.personalityNumber)} enhanced by ${dominantColorMapping.remedies[1]} abilities.`;

    // Comprehensive practices based on remedies data
    const recommendedPractices = [
      `Chant "${dominantColorMapping.mantra}" mantra 45 times daily for ${dominantColorMapping.chakra} activation`,
      `Use ${dominantColorMapping.crystal.join(' or ')} crystals for energy enhancement`,
      `Practice ${dominantColorMapping.practices[0]} aligned with your ${dominantColorMapping.chakra}`,
      `Invoke ${dominantColorMapping.archangel} for guidance: "Guide me in ${dominantColorMapping.remedies[0]}"`,
      `Focus on ${dominantColorMapping.remedies[2]} based on your Life Path ${numerology.lifePathNumber}`,
      `Wear or visualize ${dominantColorMapping.color} light for chakra balancing`
    ];

    return {
      energyAlignment,
      compatibility,
      spiritualGuidance,
      personalityIntegration,
      lifePathColor: getColorForNumber(numerology.lifePathNumber),
      dominantSoulChakra: dominantSoulChakraName,
      chakraAlignment: dominantColorMapping.chakra,
      planetaryInfluence: dominantColorMapping.planet,
      archangelGuidance: dominantColorMapping.archangel,
      sacredMantra: dominantColorMapping.mantra,
      healingCrystals: dominantColorMapping.crystal,
      recommendedPractices
    };
  };

  const calculateDominantSoulChakra = (lifePathNumber: number): number => {
    // Soul chakra calculation based on life path number
    const chakraMappings: Record<number, number> = {
      1: 3, 2: 4, 3: 5, 4: 1, 5: 2, 6: 6, 7: 7, 8: 8, 9: 9
    };
    return chakraMappings[lifePathNumber] || 7;
  };

  const getDominantSoulChakraName = (chakraNumber: number): string => {
    const chakraNames: Record<number, string> = {
      1: 'Earth Star (Grounding & Stability)',
      2: 'Sacral (Creativity & Emotions)', 
      3: 'Solar Plexus (Leadership & Confidence)',
      4: 'Heart (Love & Relationships)',
      5: 'Throat (Communication & Truth)',
      6: 'Third Eye (Intuition & Vision)',
      7: 'Crown (Spiritual Connection)',
      8: 'Soul Star (Wisdom & Transcendence)',
      9: 'Root (Physical Energy & Survival)'
    };
    return chakraNames[chakraNumber] || 'Balanced Multi-Chakra';
  };

  const getPersonalityTraits = (personalityNumber: number): string => {
    const traits: Record<number, string> = {
      1: 'leadership and pioneering abilities',
      2: 'diplomatic and cooperative nature', 
      3: 'creative and communicative talents',
      4: 'organized and practical wisdom',
      5: 'adventurous and adaptable spirit',
      6: 'nurturing and healing capabilities',
      7: 'intuitive and spiritual insights',
      8: 'executive and manifestation skills',
      9: 'compassionate and humanitarian service'
    };
    return traits[personalityNumber] || 'balanced multi-dimensional qualities';
  };

  const getColorForNumber = (number: number): string => {
    const numberColors: Record<number, string> = {
      1: 'Yellow', 2: 'Green', 3: 'Violet', 4: 'Brown', 5: 'Blue',
      6: 'Orange', 7: 'White', 8: 'Indigo', 9: 'Red'
    };
    return numberColors[number] || 'White';
  };
  
  // Function to detect human faces for aura analysis
  const detectHumanFace = (file: File): Promise<boolean> => {
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
          
          // Face detection for aura analysis
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Skin tone detection criteria for human faces
            const skinTone1 = r > 120 && g > 80 && b > 60 && r > g && r > b && 
                             Math.abs(r - g) > 20 && Math.abs(r - b) > 30;
            const skinTone2 = r > 240 && g > 220 && b > 180 && r - g < 30 && r - b < 80; // Very light skin
            const skinTone3 = r > 110 && r < 140 && g > 80 && g < 110 && b > 60 && b < 90 && 
                             r > g && r > b; // Medium skin with strict bounds
            
            // Face pattern detection
            if (skinTone1 || skinTone2 || skinTone3) {
              skinPixels++;
              
              // Check for face-like patterns
              const pixelIndex = Math.floor(i / 4);
              const x = pixelIndex % canvas.width;
              const y = Math.floor(pixelIndex / canvas.width);
              
              let horizontalSkin = 0;
              let verticalSkin = 0;
              
              // Check horizontal continuity
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
              
              // Check vertical continuity
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
              
              if (horizontalSkin >= 3 && verticalSkin >= 3) {
                facePatternPixels++;
              }
            }
          }
          
          const skinRatio = skinPixels / totalPixels;
          const facePatternRatio = facePatternPixels / totalPixels;
          
          // For aura analysis, we need significant skin area AND face patterns
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
    setAnalysisProgress(0);
    setAnalysisStage("Checking image content...");
    // Reset review system for new analysis
    setReviewSubmitted(false);
    setRating(0);
    setReviewText("");
    setCurrentAnalysisId(null);

    try {
      // Check for human face first
      setAnalysisProgress(10);
      setAnalysisStage("Scanning for human face...");
      
      const hasFace = await detectHumanFace(file);
      
      if (!hasFace) {
        setIsAnalyzing(false);
        toast({
          title: "No Human Face Detected",
          description: "Aura analysis requires an image with a human face. Please upload a photo of yourself or another person.",
          variant: "destructive",
        });
        return;
      }

      setAnalysisProgress(20);
      setAnalysisStage("Initializing aura scanning...");

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          
          // Update stage text based on progress
          if (prev < 30) {
            setAnalysisStage("Preparing image for analysis...");
          } else if (prev < 50) {
            setAnalysisStage("Detecting energy patterns in your aura...");
          } else if (prev < 70) {
            setAnalysisStage("Analyzing color vibrations and frequencies...");
          } else if (prev < 85) {
            setAnalysisStage("Connecting with your chakra energy centers...");
          } else {
            setAnalysisStage("Finalizing your personalized aura reading...");
          }
          
          return prev + Math.random() * 5 + 1;
        });
      }, 800);

      // Convert the image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = reader.result?.toString();
        const base64data = base64String?.split(",")[1];
        
        // Store original image
        setOriginalImage(base64String || null);
        
        if (base64data) {
          try {
            // Generate hash for image consistency
            const imageHash = generateImageHash(base64data);
            
            // Check if we have a cached result for this or similar image
            const cachedResult = findSimilarImage(imageHash, base64data);
            
            let analysisResult: AuraAnalysisResult;
            
            if (cachedResult) {
              // Use cached result for consistency
              analysisResult = cachedResult;
              setAnalysisStage("Loading cached analysis for consistency...");
            } else {
              // Call API to analyze the image
              analysisResult = await analyzeAuraImage(base64data);
              // Cache the result
              setImageCache(prev => new Map(prev.set(imageHash, analysisResult)));
            }
            
            setResult(analysisResult);
            
            // Set analysis ID if returned from server for review functionality
            if (analysisResult.id) {
              setCurrentAnalysisId(analysisResult.id);
            }
            
            // Generate enhanced aura image with aura clouds
            if (base64String) {
              setAnalysisStage("Creating your aura visualization...");
              generateAuraVisualization(base64String, analysisResult);
              
              // Process the uploaded image with aura colors
              const auraProcessedImage = await processImageWithAura(base64String, analysisResult);
              setProcessedAuraImage(auraProcessedImage);
            }
            
            // Ensure progress shows 100% at the end
            setAnalysisProgress(100);
            setAnalysisStage("Analysis complete! Preparing your results...");
            
            // Clear interval if it's still running
            clearInterval(progressInterval);
            
            // Small delay to show the 100% state before removing loading
            setTimeout(() => {
              setIsAnalyzing(false);
              // Set active tab to analysis to show results including visualization
              setActiveTab("analysis");
            }, 800);
          } catch (error) {
            console.error("Error in aura analysis:", error);
            // Use fallback analysis if API has issues
            setAnalysisProgress(100);
            setAnalysisStage("Analysis complete!");
            clearInterval(progressInterval);
            setTimeout(() => { setIsAnalyzing(false); }, 800);
          }
        }
      };
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze your aura. Please try again.",
        variant: "destructive",
      });
      console.error("Error analyzing image:", error);
      setIsAnalyzing(false);
    }
  };

  // Helper function to get color class based on aura color
  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: "bg-purple-500",
      violet: "bg-purple-600",
      indigo: "bg-indigo-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      pink: "bg-pink-500",
      white: "bg-gray-100",
      gold: "bg-amber-400",
      silver: "bg-gray-300",
      turquoise: "bg-teal-500",
      magenta: "bg-pink-600",
      brown: "bg-brown-500",
      black: "bg-black"
      // Add more colors as needed
    };

    const lowerColor = color.toLowerCase();
    return colorMap[lowerColor] || "bg-gray-400";
  };

  // Helper function to get text color class based on aura color
  const getTextColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: "text-purple-500",
      violet: "text-purple-600",
      indigo: "text-indigo-500",
      blue: "text-blue-500",
      green: "text-green-500",
      yellow: "text-yellow-500",
      orange: "text-orange-500",
      red: "text-red-500",
      pink: "text-pink-500",
      white: "text-gray-100",
      gold: "text-amber-400",
      silver: "text-gray-300",
      turquoise: "text-teal-500",
      magenta: "text-pink-600",
      brown: "text-brown-500",
      black: "text-black"
      
    };

    const lowerColor = color.toLowerCase();
    return colorMap[lowerColor] || "text-gray-400";
  };



  // Helper functions for aura analysis and premium visualization
  const auraHelpers = {
    // Get color position on spectrum
    getColorPosition: (color: string): number | null => {
      const positionMap: Record<string, number> = {
        red: 10,
        orange: 25,
        yellow: 40,
        green: 55,
        blue: 70,
        indigo: 80,
        violet: 85,
        purple: 90,
        pink: 75,
        white: 95,
        gold: 35,
        silver: 60,
        turquoise: 65,
        magenta: 78,
        brown: 15,
        black: 5,
        ocher: 20, 
        lavender: 82,
        coral: 30,
        mint: 50,
        peach: 45,
        skyblue: 68,
        rose: 72,
        amber: 28,
        gray: 58,
        cyan: 62,
        lime: 48,
        maroon: 12,
        navy: 73,
        olive: 52,
        teal: 63,
        bronze: 18,
        cobalt: 76,
        emerald: 53,
        jade: 57,
        sapphire: 74,
        topaz: 32
      };
      
      const lowerColor = color.toLowerCase();
      return positionMap[lowerColor] !== undefined ? positionMap[lowerColor] : null;
    },
    
    // Get complementary color for aura visualization
    getComplementaryColor: (color: string): string => {
      const colorMap: Record<string, string> = {
        "Red": "Green",
        "Orange": "Blue",
        "Yellow": "Purple",
        "Green": "Red",
        "Blue": "Orange",
        "Indigo": "Yellow",
        "Violet": "Gold",
        "Purple": "Yellow",
        "Pink": "Turquoise",
        "Gold": "Violet",
        "Silver": "Magenta",
        "White": "Black",
        "Black": "White",
        "Turquoise": "Pink",
        "Magenta": "Silver",
        "Brown": "Blue",
        "Cyan": "Red",
        "Lime": "Purple",
        "Maroon": "Green",
        "Navy": "Yellow",
        "Olive": "Blue",
        "Teal": "Orange",
        "Bronze": "Green",
        
      };
      
      return colorMap[color] || "White";
    },
    
    // Get energy cycle pattern
    getEnergyCycle: (energyLevel: number, color: string): string => {
      const highEnergy = energyLevel >= 7;
      const mediumEnergy = energyLevel >= 4 && energyLevel < 7;
      
      const colorLower = color.toLowerCase();
      
      if (["red", "orange", "yellow", "ocher", "coral", "maroon" ].includes(colorLower)) {
        return highEnergy ? "rapid and intense" : mediumEnergy ? "steady and consistent" : "slow-building";
      } else if (["green", "blue", "turquoise", "cyan", "emerald", "jade", "sapphire"].includes(colorLower)) {
        return highEnergy ? "flowing and wave-like" : mediumEnergy ? "rhythmic and balanced" : "gentle and steady";
      } else if (["purple", "violet", "indigo", "pink", "lavender", "magenta", "shapphire", "topaz", "bronze"].includes(colorLower)) {
        return highEnergy ? "pulsating and dynamic" : mediumEnergy ? "cyclical and intuitive" : "subtle and intermittent";
      } else {
        return mediumEnergy ? "moderate and balanced" : "variable";
      }
    },
    
    // Get energy level text
    getEnergyLevelText: (level: number): string => {
      if (level >= 8) return "Extremely High";
      if (level >= 6) return "Very High";
      if (level >= 4) return "Above Average";
      if (level >= 2) return "Moderate";
      return "Reserved";
    },
    
    // Get energy advice
    getEnergyAdvice: (level: number, color: string): string => {
      const colorLower = color.toLowerCase();
      
      if (level >= 8) {
        return ` Your energy appears intensely vibrant in your aura photograph. Consider grounding practices to balance this powerful energy.`;
      } else if (level >= 6) {
        if (["purple", "blue", "indigo", "violet", "lavender", "magenta", "sapphire", "topaz"].includes(colorLower)) {
          return ` This high spiritual energy visible in your aura field suggests focusing on channeling your intuitive gifts.`;
        } else if (["red", "orange", "yellow", "ocher", "maroon"].includes(colorLower)) {
          return ` The high physical/emotional energy visible in your aura suggests finding healthy outlets for expression.`;
        } else {
          return ` Your aura shows vibrant energy flow that could benefit from regular creative or spiritual practices.`;
        }
      } else if (level >= 3) {
        return ` This balanced energy state visible in your aura photograph indicates a good equilibrium of giving and receiving energy.`;
      } else {
        return ` The calmer energy visible in your aura field suggests a period of energy conservation. Gentle energy practices may be beneficial.`;
      }
    }
  };

  // Helper functions for the detailed analysis tab
  const getAuraLayerAnalysis = (layer: string, color: string): string => {
    const layerAnalysis: Record<string, Record<string, string>> = {
      etheric: {
        "Purple": "Your etheric layer shows strong spiritual development and healing energy fields. Physical vitality is enhanced through psychic connections rather than purely physical sources.",
        "Blue": "Your etheric layer is strongly aligned with truth and clear expression. Physical health responds well to sound therapy and throat chakra work.",
        "Green": "Your etheric layer shows exceptional healing potential and natural vitality. Physical energy is balanced and flows freely through all systems.",
        "Yellow": "Your etheric layer vibrates with intellectual energy and mental stimulation. Physical vitality is strongly tied to mental engagement and learning.",
        "Orange": "Your etheric layer pulses with creative life force and sensual energy. Physical vitality is enhanced through creative expression and joy.",
        "Red": "Your etheric layer contains powerful primal energy and strong physical vitality. Your physical presence is grounded and commanding.",
        "White": "Your etheric layer is exceptionally pure and connected to higher consciousness. Physical energy is refined and spiritually aligned.",
        "Gold": "Your etheric layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
        "Indigo": "Your etheric layer is connected to higher intuition and visionary abilities. Physical body benefits from third eye meditation.",
        "Pink": "Your etheric layer resonates with unconditional love and compassion. Physical health is enhanced through heart-centered practices.",
        "Silver": "Your etheric layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
        "Turquoise": "Your etheric layer resonates with unconditional love and compassion. Physical health is enhanced through heart-centered practices.",
        "Lavender": "Your etheric layer resonates with unconditional love and compassion. Physical health is enhanced through heart-centered practices.",
      },
      emotional: {
        "Purple": "Your emotional layer reveals spiritual sensitivity and intuitive emotional processing. You may experience emotions as spiritual messages.",
        "Blue": "Your emotional layer shows a peaceful approach to feelings with truthful emotional expression. You process emotions through communication.",
        "Green": "Your emotional layer indicates balance and healing in emotional patterns. You naturally create harmony in emotional environments.",
        "Yellow": "Your emotional layer shows optimism and intellectual processing of emotions. You tend to analyze feelings before expressing them.",
        "Orange": "Your emotional layer is vibrant with enthusiasm and creative emotional expression. You experience emotions intensely and expressively.",
        "Red": "Your emotional layer indicates passionate feelings and strong emotional presence. Your emotions are powerful motivators in your life.",
        "White": "Your emotional layer contains pure, unconditional emotional responses. You experience emotions with spiritual detachment.",
        "Gold": "Your emotional layer carries wisdom in emotional processing. You have access to ancient emotional patterns and healing.",
        "Indigo": "Your emotional layer connects emotions to intuitive knowing. You understand the deeper purpose behind emotional experiences.",
        "Pink": "Your emotional layer is suffused with love and compassion. Your emotional responses are heart-centered and nurturing.",
        "Silver": "Your emotional layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
        "olive": "Your emotional layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
        "Teal": "Your emotional layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
      },
      mental: {
        "Purple": "Your mental layer shows psychic abilities integrated into thought processes. Your thinking is informed by spiritual insights.",
        "Blue": "Your mental layer reveals clear, truthful thinking and excellent communication skills. Your thoughts align with higher truth.",
        "Green": "Your mental layer indicates balanced thinking and healing thought patterns. Your mind naturally seeks harmony and growth.",
        "Yellow": "Your mental layer shows exceptional intellectual abilities and analytical thinking. Your mind is your greatest tool.",
        "Orange": "Your mental layer is highly creative with innovative thought patterns. Your thinking breaks conventional boundaries.",
        "Red": "Your mental layer indicates decisive thinking and action-oriented mental processes. Your thoughts quickly translate to action.",
        "White": "Your mental layer connects to universal consciousness. Your thinking transcends ordinary limitations.",
        "Gold": "Your mental layer accesses wisdom and higher knowledge. Your thoughts carry authority and spiritual insight.",
        "Indigo": "Your mental layer shows visionary thinking and future-oriented perspectives. Your ideas come from higher dimensions.",
        "Pink": "Your mental layer processes thoughts through the lens of compassion. Your thinking is heart-centered and loving.",
        "Silver": "Your mental layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
         "olive": "Your mental layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
         "Teal": "Your mental layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
         "Bronze": "Your mental layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
         "Cobalt": "Your mental layer carries spiritual wisdom and divine protection. Physical vitality is enhanced through spiritual practices.",
      },
      spiritual: {
        "Purple": "Your spiritual layer reveals advanced spiritual development and direct connection to higher dimensions. Your spiritual path involves psychic development.",
        "Blue": "Your spiritual layer shows alignment with truth and clear spiritual communication. You may be a channel for spiritual teachings.",
        "Green": "Your spiritual layer indicates healing abilities and balanced spiritual growth. Your spiritual path involves healing self and others.",
        "Yellow": "Your spiritual layer connects intellectual understanding with spiritual wisdom. Your spiritual path involves teaching and sharing knowledge.",
        "Orange": "Your spiritual layer shows creative spiritual expression and sensual spirituality. Your spiritual path involves creation and joy.",
        "Red": "Your spiritual layer reveals power and strength in spiritual practice. Your spiritual path involves courage and leadership.",
        "White": "Your spiritual layer connects directly to source consciousness. Your spiritual presence carries purity and higher frequency.",
        "Gold": "Your spiritual layer carries divine wisdom and protection. Your spiritual path involves becoming a wisdom keeper.",
        "Indigo": "Your spiritual layer reveals visionary abilities and psychic seeing. Your spiritual path involves bringing new visions to humanity.",
        "Pink": "Your spiritual layer emanates unconditional love. Your spiritual path involves becoming a heart-centered healer."
      }
    };
    
    return layerAnalysis[layer]?.[color] || 
      "This layer of your aura carries unique energetic signatures that reflect your personal spiritual evolution.";
  };
  
  // These functions are already defined above, so removing duplicates.

  const getTraitExplanation = (trait: string, color: string): string => {
    const traitExplanations: Record<string, string> = {
      "Intuitive": "You perceive information beyond the five senses, receiving guidance directly from higher consciousness.",
      "Empathetic": "You naturally sense and absorb the emotional states of others, making you a compassionate healing presence.",
      "Creative": "Your energy naturally manifests new forms and ideas, bringing previously unseen concepts into reality.",
      "Analytical": "You process energy through logical frameworks, bringing clarity and order to spiritual information.",
      "Spiritual": "Your energy vibrates at frequencies that connect easily with higher dimensions and spiritual realms.",
      "Healing": "You naturally channel universal life force energy in ways that restore balance and wholeness.",
      "Visionary": "You perceive potential futures and possibilities beyond current reality constraints.",
      "Grounded": "Your energy maintains strong earth connection while working with higher frequencies.",
      "Passionate": "Your energy field pulses with intense life force that energizes projects and relationships.",
      "Compassionate": "Your heart chakra emanates unconditional love energy that nurtures and supports others.",
      "Wise": "Your energy field contains accumulated wisdom from multiple lifetimes and dimensions.",
      "Psychic": "Your subtle energy sensors are highly developed, allowing perception beyond physical reality.",
      "Balanced": "Your energy system maintains harmonious flow between all chakras and subtle bodies.",
      "Focused": "Your energy can be precisely directed toward specific intentions with minimal scatter.",
      "Expansive": "Your energy field extends widely, connecting with collective consciousness and universal mind.",
      "Calming": "Your energy field is soothing and peaceful, creating a sense of tranquility and relaxation.",
      "Energetic": "Your energy field is vibrant and dynamic, radiating vitality and enthusiasm.",
      "Transformative": "Your energy field carries the power to shift and transform reality.",
      "Protective": "Your energy field is a barrier against negative influences and energies.",
    };
    
    return traitExplanations[trait] || "This trait represents a unique expression of your spiritual signature.";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-dark to-primary-dark text-white py-16">
          <AuraGlow 
            colors={[
              { color: "bg-primary-light", top: "top-1/4", left: "-left-20", size: "w-96 h-96", delay: "0s" },
              { color: "bg-secondary-light", bottom: "bottom-1/3", right: "right-10", size: "w-64 h-64", delay: "1s" }
            ]} 
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-center">Aura Analysis</h1>
            <p className="text-white/80 max-w-2xl mx-auto text-center">
              Upload your photo and our AI will analyze your energy field, revealing your aura colors and providing personalized insights.
            </p>
          </div>
        </section>
        
        {/* Upload and Analysis section */}
        <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-10">
                {/* Upload section */}
                <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8">
                  <div className="w-full">
                    <h2 className="font-heading font-semibold text-lg md:text-xl mb-3">Upload Your Photo</h2>
                    <ImageUpload onImageSelect={handleImageSelect} isLoading={isAnalyzing} />
                  </div>
                  
                  <div>
              <div className="h-full p-4 bg-white/70 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-800 mb-2">Tips for the best aura reading:</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          Use a clear photo in good lighting
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          Your face should be clearly visible
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          A neutral background works best
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          A relaxed, natural expression reveals your true energy
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Results section - full width */}
                <div>
                  <div className="flex items-center justify-between mb-7">
                    <h2 className="font-heading font-semibold text-xl">Your Aura Reading</h2>
                    
                    {result && !isAnalyzing && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-sm"
                          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`My aura today is ${result.dominantColor}! Check out my spiritual energy reading from Aurfy.`)}`, '_blank')}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                          </svg>
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-sm"
                          onClick={() => window.open(`https://www.instagram.com/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428.247-.67.636-1.276 1.153-1.772a4.91 4.91 0 011.772-1.153c.637-.247 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.04 0 2.669.01 2.986.058 4.04.045.976.207 1.504.344 1.857.181.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.04.058 2.669 0 2.986-.01 4.04-.058.976-.045 1.504-.207 1.857-.344.466-.181.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.04 0-2.669-.01-2.986-.058-4.04-.045-.976-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15c-.35-.35-.683-.567-1.15-.748-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.04-.058zm0 3.063a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm6.538-8.469a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/>
                          </svg>
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-sm"
                          onClick={downloadAuraPDF}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download PDF
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {isAnalyzing ? (
                    <Card className="h-200 flex flex-col items-center justify-center">
                      <div className="text-center w-full max-w-md px-6">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Analyzing your aura energy...</p>
                        
                        <div className="space-y-6 w-full">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Scanning energy field</span>
                              <span className="text-primary">{Math.round(analysisProgress)}%</span>
                            </div>
                            <div className="h-10 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${analysisProgress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 italic">
                            {analysisStage}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : result ? (
                    <Card>
                      <CardContent className="p-7" id="aura-reading-section">
                        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full h-30">
                          <TabsList className="grid grid-rows-4 gap-3 w-full h-30 p-2 mb-11">
                            <div className="grid grid-cols-2 gap-20">
                              <TabsTrigger value="analysis" className="text-sm whitespace-nowrap px-2">Analysis</TabsTrigger>
                              <TabsTrigger value="energy-reading" className="text-sm whitespace-nowrap px-2 relative">
                                Energy Reading
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 items-center justify-center">
                                    <span className="text-[8px] text-white font-bold">●</span>
                                  </span>
                                </span>
                              </TabsTrigger>
                            </div>
                            <div className="grid grid-cols-2 gap-10">
                              <TabsTrigger value="chakras" className="text-sm whitespace-nowrap px-2">Chakras</TabsTrigger>
                              <TabsTrigger value="guidance" className="text-sm whitespace-nowrap px-2">Guidance</TabsTrigger>
                            </div>
                            <div className="grid grid-cols-2 gap-15">
                              <TabsTrigger value="spectrum" className="text-sm whitespace-nowrap px-2 relative">
                                Color Spectrum
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rainbow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 items-center justify-center">
                                    <Sparkles className="h-2 w-2 text-white" />
                                  </span>
                                </span>
                              </TabsTrigger>
                              <TabsTrigger value="energy-map" className="text-sm whitespace-nowrap px-2 relative">
                                Energy Map
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center">
                                    <Zap className="h-2 w-2 text-white" />
                                  </span>
                                </span>
                              </TabsTrigger>
                            </div>
                            <div className="grid grid-cols-2 gap-10">
                              <TabsTrigger value="detailed" className="relative">
                                Detailed Analysis
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 mb-5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center">
                                    <Crown className="h-2 w-2 text-white" />
                                  </span>
                                </span>
                              </TabsTrigger>
                              <TabsTrigger value="combined" className="text-sm whitespace-nowrap px-2 relative">
                                Combined Analysis
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 items-center justify-center">
                                    <span className="text-[10px] text-white font-bold">✨</span>
                                  </span>
                                </span>
                              </TabsTrigger>
                            </div>
                          </TabsList>
                          
                          <TabsContent value="energy-reading">
                            <div className="space-y-6">
                              {/* Energy Reading Content */}
                              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">

                                {/* Energy Flow Only */}
                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm">Energy Flow</h4>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-white rounded-lg border">
                                      <div className="font-medium text-sm mb-1">Giving Energy</div>
                                      <div className="text-xs text-gray-600 mb-2">How you radiate energy to others</div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${calculateGivingEnergy(result)}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">{calculateGivingEnergy(result)}% - {getGivingEnergyDescription(calculateGivingEnergy(result))}</div>
                                    </div>
                                    
                                    <div className="p-3 bg-white rounded-lg border">
                                      <div className="font-medium text-sm mb-1">Receiving Energy</div>
                                      <div className="text-xs text-gray-600 mb-2">How you absorb energy from environment</div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${calculateReceivingEnergy(result)}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">{calculateReceivingEnergy(result)}% - {getReceivingEnergyDescription(calculateReceivingEnergy(result))}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 9 Chakra Graph */}
                              <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="font-medium text-lg mb-4">Your 9-Chakra Energy System</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Primary 7 Chakras */}
                                  <div className="md:col-span-2">
                                    <h4 className="font-medium text-sm mb-3">Primary Chakras</h4>
                                    <div className="space-y-3">
                                      {Object.entries(result.chakraActivity).map(([chakra, value]) => (
                                        <div key={chakra} className="flex items-center space-x-3">
                                          <div className="w-20 text-sm text-gray-600 capitalize">{chakra.replace(/([A-Z])/g, ' $1').trim()}</div>
                                          <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                              <div 
                                                className={`h-3 rounded-full transition-all duration-500 ${getChakraColor(chakra)}`}
                                                style={{ width: `${value * 10}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                          <div className="w-12 text-sm text-gray-500">{value}/10</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Extended Chakras */}
                                  <div>
                                    <h4 className="font-medium text-sm mb-3">Extended Chakras</h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-16 text-xs text-gray-600">Earth Star</div>
                                        <div className="flex-1">
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${calculateEarthStarChakra(result)}%` }}></div>
                                          </div>
                                        </div>
                                        <div className="w-12 text-xs text-gray-500">{Math.round(calculateEarthStarChakra(result)/10)}/10</div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-3">
                                        <div className="w-16 text-xs text-gray-600">Soul Star</div>
                                        <div className="flex-1">
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-white border h-2 rounded-full" style={{ width: `${calculateSoulStarChakra(result)}%` }}></div>
                                          </div>
                                        </div>
                                        <div className="w-12 text-xs text-gray-500">{Math.round(calculateSoulStarChakra(result)/10)}/10</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Energy Scores */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{calculateAuraStrength(result)}%</div>
                                    <div className="text-sm text-gray-600 mt-1">Aura Strength</div>
                                    <div className="text-xs text-gray-500 mt-2">{getStrengthDescription(calculateAuraStrength(result))}</div>
                                  </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{calculateVulnerability(result)}%</div>
                                    <div className="text-sm text-gray-600 mt-1">Vulnerability</div>
                                    <div className="text-xs text-gray-500 mt-2">{getVulnerabilityDescription(calculateVulnerability(result))}</div>
                                  </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{calculateEnergyBalance(result)}%</div>
                                    <div className="text-sm text-gray-600 mt-1">Energy Balance</div>
                                    <div className="text-xs text-gray-500 mt-2">{getBalanceDescription(calculateEnergyBalance(result))}</div>
                                  </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{result.energyLevel}/10</div>
                                    <div className="text-sm text-gray-600 mt-1">Overall Energy</div>
                                    <div className="text-xs text-gray-500 mt-2">{getEnergyLevelDescription(result.energyLevel)}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Daily Energy Influence */}
                              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100">
                                <h3 className="font-medium text-lg mb-4">How Your Energy Colors Influence Your Day</h3>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Morning Energy Pattern</h4>
                                    <p className="text-sm text-gray-700">{getMorningEnergyInfluence(result.dominantColor, result.secondaryColor)}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Peak Energy Hours</h4>
                                    <p className="text-sm text-gray-700">{getPeakEnergyHours(result.dominantColor)}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Evening Energy Guidance</h4>
                                    <p className="text-sm text-gray-700">{getEveningEnergyGuidance(result.dominantColor)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="spectrum">
                            <div className="space-y-6">
                              <div className="text-center mb-6">
                                <h3 className="font-medium text-xl mb-2">Complete Aura Color Spectrum Analysis</h3>
                                <p className="text-sm text-gray-600">
                                  Detailed breakdown of all colors detected in your aura field with accurate color representations
                                </p>
                              </div>

                              {/* Enhanced Color Spectrum Display */}
                              <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h4 className="font-medium text-lg mb-4">Your Multi-Dimensional Aura Colors</h4>
                                
                                {/* Primary Colors Section */}
                                <div className="mb-6">
                                  <h5 className="font-medium text-sm mb-3 text-gray-700">Primary Energy Colors</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Dominant Color */}
                                    <div className="p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full shadow-lg border-4 border-white"
                                          style={{ 
                                            backgroundColor: getAccurateColorCode(result.dominantColor),
                                            boxShadow: `0 0 20px ${getAccurateColorCode(result.dominantColor)}40`
                                          }}
                                        ></div>
                                        <div>
                                          <div className="font-semibold text-lg">{result.dominantColor}</div>
                                          <div className="text-sm text-primary font-medium">Dominant Energy</div>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 mb-2">{getColorMeaning(result.dominantColor)}</p>
                                      
                                      {/* Positive and Negative Meanings */}
                                      <div className="mt-3 space-y-2">
                                        <div className="p-2 bg-green-50 rounded-md border border-green-200">
                                          <div className="text-xs font-medium text-green-800 mb-1">✓ Positive Aspects</div>
                                          <div className="text-xs text-green-700">{getColorPositiveMeaning(result.dominantColor)}</div>
                                        </div>
                                        <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
                                          <div className="text-xs font-medium text-amber-800 mb-1">⚠ Areas for Growth</div>
                                          <div className="text-xs text-amber-700">{getColorNegativeMeaning(result.dominantColor)}</div>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Hex: {getAccurateColorCode(result.dominantColor)}
                                      </div>
                                    </div>

                                    {/* Secondary Color */}
                                    <div className="p-4 rounded-lg border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full shadow-lg border-4 border-white"
                                          style={{ 
                                            backgroundColor: getAccurateColorCode(result.secondaryColor || result.dominantColor),
                                            boxShadow: `0 0 20px ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}40`
                                          }}
                                        ></div>
                                        <div>
                                          <div className="font-semibold text-lg">{result.secondaryColor || result.dominantColor}</div>
                                          <div className="text-sm text-secondary font-medium">Secondary Energy</div>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 mb-2">{getColorMeaning(result.secondaryColor || result.dominantColor)}</p>
                                      
                                      {/* Positive and Negative Meanings */}
                                      <div className="mt-3 space-y-2">
                                        <div className="p-2 bg-green-50 rounded-md border border-green-200">
                                          <div className="text-xs font-medium text-green-800 mb-1">✓ Positive Aspects</div>
                                          <div className="text-xs text-green-700">{getColorPositiveMeaning(result.secondaryColor || result.dominantColor)}</div>
                                        </div>
                                        <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
                                          <div className="text-xs font-medium text-amber-800 mb-1">⚠ Areas for Growth</div>
                                          <div className="text-xs text-amber-700">{getColorNegativeMeaning(result.secondaryColor || result.dominantColor)}</div>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Hex: {getAccurateColorCode(result.secondaryColor || result.dominantColor)}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Supporting Colors Section */}
                                {result.auraColorSpectrum && result.auraColorSpectrum.length > 2 && (
                                  <div className="mb-6">
                                    <h5 className="font-medium text-sm mb-3 text-gray-700">Supporting Energy Colors</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {result.auraColorSpectrum.slice(2, 6).map((color, index) => (
                                        <div key={index} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                                          <div className="flex items-center space-x-3 mb-2">
                                            <div 
                                              className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                                              style={{ 
                                                backgroundColor: getAccurateColorCode(color),
                                                boxShadow: `0 0 15px ${getAccurateColorCode(color)}30`
                                              }}
                                            ></div>
                                            <div>
                                              <div className="font-medium text-sm">{color}</div>
                                              <div className="text-xs text-gray-500">
                                                {index === 0 ? 'Tertiary' : index === 1 ? 'Quaternary' : 'Accent'} Energy
                                              </div>
                                            </div>
                                          </div>
                                          <p className="text-xs text-gray-600 mb-2">{getColorMeaning(color)}</p>
                                          <div className="text-xs text-gray-400">
                                            Hex: {getAccurateColorCode(color)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Color Interaction Analysis */}
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                                  <h5 className="font-medium text-sm mb-3 text-purple-700">Color Harmony Analysis</h5>
                                  <p className="text-sm text-gray-700 mb-3">
                                    {(() => {
                                      const chakraConnections: Record<string, string> = {
                                        'Red': 'Root Chakra (Muladhara)',
                                        'Orange': 'Sacral Chakra (Svadhisthana)', 
                                        'Yellow': 'Solar Plexus Chakra (Manipura)',
                                        'Green': 'Heart Chakra (Anahata)',
                                        'Blue': 'Throat Chakra (Vishuddha)',
                                        'Indigo': 'Third Eye Chakra (Ajna)',
                                        'Violet': 'Crown Chakra (Sahasrara)',
                                        'Purple': 'Higher Crown Chakra',
                                        'Pink': 'Higher Heart Chakra',
                                        'Gold': 'Soul Star Chakra',
                                        'Silver': 'Lunar Energy Center',
                                        'Turquoise': 'Higher Throat Chakra',
                                        'White': 'Divine Light Center',
                                        'Lime': 'Heart Healing Chakra',
                                        'Teal': 'Heart-Throat Bridge',
                                        'Maroon': 'Earth Star Chakra',
                                        'Navy': 'Deep Wisdom Center',
                                        'Coral': 'Creative Heart Center',
                                        'Mint': 'Renewal Energy Center',
                                        'Peach': 'Nurturing Heart Center'
                                      };

                                      const colorMeanings: Record<string, string> = {
                                        'Red': 'grounding, vitality, survival strength',
                                        'Orange': 'creativity, passion, emotional flow',
                                        'Yellow': 'personal power, mental clarity, confidence',
                                        'Green': 'healing love, compassion, heart wisdom',
                                        'Blue': 'truth, peace, authentic communication',
                                        'Indigo': 'intuition, psychic sight, inner knowing',
                                        'Violet': 'spiritual connection, divine consciousness',
                                        'Purple': 'mystical wisdom, spiritual mastery',
                                        'Pink': 'unconditional love, divine compassion',
                                        'Gold': 'divine wisdom, Christ consciousness',
                                        'Silver': 'lunar intuition, feminine wisdom',
                                        'Turquoise': 'healing communication, divine truth',
                                        'White': 'pure light, spiritual protection',
                                        'Lime': 'fresh healing, renewal energy',
                                        'Teal': 'emotional truth, compassionate expression',
                                        'Maroon': 'deep passion, earthly wisdom',
                                        'Navy': 'profound wisdom, cosmic knowledge',
                                        'Coral': 'creative warmth, gentle passion',
                                        'Mint': 'healing renewal, emotional cleansing',
                                        'Peach': 'nurturing love, gentle care'
                                      };

                                      const totalColors = result.auraColorSpectrum ? result.auraColorSpectrum.length : 2;
                                      const dominantChakra = chakraConnections[result.dominantColor] || `${result.dominantColor} Energy Center`;
                                      const secondaryChakra = result.secondaryColor ? chakraConnections[result.secondaryColor] || `${result.secondaryColor} Energy Center` : '';
                                      const dominantMeaning = colorMeanings[result.dominantColor] || 'authentic soul expression';
                                      const secondaryMeaning = result.secondaryColor ? colorMeanings[result.secondaryColor] || 'supportive energy' : '';

                                      let analysis = `Your ${totalColors}-color aura spectrum reveals ${dominantChakra} dominance with ${dominantMeaning}`;
                                      
                                      if (result.secondaryColor) {
                                        analysis += ` harmonizing with ${secondaryChakra} expressing ${secondaryMeaning}`;
                                      }

                                      if (result.auraColorSpectrum && result.auraColorSpectrum.length > 2) {
                                        const supportingColors = result.auraColorSpectrum.slice(2, 4);
                                        const supportingChakras = supportingColors.map(color => 
                                          chakraConnections[color] || `${color} Center`
                                        ).join(' and ');
                                        analysis += `. Supporting energy from ${supportingChakras} creates multi-dimensional chakra activation`;
                                      }

                                      analysis += '. This chakra combination indicates advanced spiritual development with balanced energy flow across multiple dimensional frequencies.';
                                      
                                      return analysis;
                                    })()}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {(result.auraColorSpectrum || [result.dominantColor, result.secondaryColor]).filter(Boolean).map((color, index) => (
                                      <div 
                                        key={index}
                                        className="w-4 h-4 rounded-full border border-white shadow-sm"
                                        style={{ backgroundColor: getAccurateColorCode(color) }}
                                        title={`${color}: ${getColorMeaning(color)}`}
                                      ></div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Primary Color Analysis */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg flex items-center">
                                  <div className={`w-4 h-4 rounded-full mr-2`} style={{backgroundColor: getAccurateColorCode(result.dominantColor)}}></div>
                                  Primary Aura Color: {result.dominantColor}
                                </h4>
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Spiritual Meaning</h5>
                                      <p className="text-sm text-gray-700">{getColorMeaningForEnergyTab(result.dominantColor)}</p>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Energy Frequency</h5>
                                      <p className="text-sm text-gray-700">{getColorFrequency(result.dominantColor)}</p>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <h5 className="font-medium text-sm mb-2">Chakra Connection</h5>
                                    <p className="text-sm text-gray-700">{getChakraConnection(result.dominantColor)}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Secondary Color Analysis */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg flex items-center">
                                  <div className={`w-4 h-4 rounded-full mr-2`} style={{backgroundColor: getAccurateColorCode(result.secondaryColor)}}></div>
                                  Secondary Aura Color: {result.secondaryColor}
                                </h4>
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Complementary Energy</h5>
                                      <p className="text-sm text-gray-700">{getColorMeaningForEnergyTab(result.secondaryColor)}</p>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Balancing Influence</h5>
                                      <p className="text-sm text-gray-700">{getColorBalance(result.dominantColor, result.secondaryColor)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Extended Color Spectrum */}
                              {result.auraColorSpectrum && result.auraColorSpectrum.length > 2 && (
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-lg">Extended Color Spectrum</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {result.auraColorSpectrum.slice(2).map((color, index) => (
                                      <div key={index} className="bg-white border rounded-lg p-3 text-center">
                                        <div className={`w-8 h-8 rounded-full mx-auto mb-2`} style={{backgroundColor: getAccurateColorCode(color)}}></div>
                                        <h6 className="font-medium text-sm">{color}</h6>
                                        <p className="text-xs text-gray-600 mt-1">{getColorKeyword(color)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Aura Layer Analysis */}
                              {result.auraLayerColors && (
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-lg">Aura Layer Breakdown</h4>
                                  <div className="space-y-3">
                                    {result.auraLayerColors.inner && (
                                      <div className="border-l-4 pl-4" style={{borderColor: getAccurateColorCode(result.auraLayerColors.inner)}}>
                                        <h5 className="font-medium text-sm">Inner Layer - {result.auraLayerColors.inner}</h5>
                                        <p className="text-sm text-gray-700">{getLayerMeaning('inner', result.auraLayerColors.inner)}</p>
                                      </div>
                                    )}
                                    {result.auraLayerColors.middle && (
                                      <div className="border-l-4 pl-4" style={{borderColor: getAccurateColorCode(result.auraLayerColors.middle)}}>
                                        <h5 className="font-medium text-sm">Middle Layer - {result.auraLayerColors.middle}</h5>
                                        <p className="text-sm text-gray-700">{getLayerMeaning('middle', result.auraLayerColors.middle)}</p>
                                      </div>
                                    )}
                                    {result.auraLayerColors.outer && (
                                      <div className="border-l-4 pl-4" style={{borderColor: getAccurateColorCode(result.auraLayerColors.outer)}}>
                                        <h5 className="font-medium text-sm">Outer Layer - {result.auraLayerColors.outer}</h5>
                                        <p className="text-sm text-gray-700">{getLayerMeaning('outer', result.auraLayerColors.outer)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Color Harmony Analysis */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Color Harmony & Energy Flow</h4>
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                                  <div className="space-y-3">
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Dominant Energy Pattern</h5>
                                      <p className="text-sm text-gray-700">{getEnergyPattern(result.dominantColor, result.secondaryColor)}</p>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Recommended Color Meditation</h5>
                                      <p className="text-sm text-gray-700">{getColorMeditation(result.dominantColor)}</p>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Color Healing Suggestions</h5>
                                      <p className="text-sm text-gray-700">{getColorHealing(result.dominantColor, result.secondaryColor)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Complete Spectrum Visualization */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Your Complete Aura Spectrum</h4>
                                <div className="bg-black rounded-lg p-6 relative overflow-hidden">
                                  <div className="flex justify-center items-center space-x-4">
                                    <div className="relative">
                                      <div className="w-32 h-32 rounded-full bg-gradient-to-r opacity-80" 
                                           style={{background: `radial-gradient(circle, ${getAccurateColorCode(result.dominantColor)} 0%, ${getAccurateColorCode(result.secondaryColor)} 70%, transparent 100%)`}}>
                                      </div>
                                      <div className="absolute inset-0 w-32 h-32 rounded-full animate-pulse" 
                                           style={{background: `radial-gradient(circle, transparent 40%, ${getAccurateColorCode(result.dominantColor)}40 60%, transparent 80%)`}}>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-center mt-4">
                                    <p className="text-white text-sm">Your unique aura signature combining {result.dominantColor} and {result.secondaryColor} energies</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="energy-map">
                            <div className="space-y-6">
                              <div className="text-center mb-6">
                                <h3 className="font-medium text-xl mb-2">Energy Map & Color Analysis</h3>
                                <p className="text-sm text-gray-600">
                                  Complete breakdown of your dominant energy and supporting color influences
                                </p>
                              </div>

                              <div className="space-y-6">
                                {/* 4-Zone Energy Visualization */}
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                                  <h4 className="font-semibold text-lg mb-4 text-center">Your 4-Zone Energy Map</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                    {/* Crown/Thinking Energy */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                          style={{backgroundColor: getAccurateColorCode(result.dominantColor)}}
                                        >
                                          <span className="text-white font-bold">🧠</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-purple-800">{result.dominantColor}</h5>
                                          <p className="text-sm text-purple-600">Crown Energy - How You Think</p>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        This energy above your head shows your thinking patterns and mental approach to life. 
                                        {getPositiveDescription(result.dominantColor)}
                                      </p>
                                    </div>

                                    {/* Receiving Energy */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                          style={{backgroundColor: getAccurateColorCode(getReceivingEnergyColor(result))}}
                                        >
                                          <span className="text-white font-bold">⬅️</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-blue-800">{getReceivingEnergyColor(result)}</h5>
                                          <p className="text-sm text-blue-600">Receiving Energy (Dynamic)</p>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        This dynamic energy on your left side shows how you receive and process energy from your environment, 
                                        relationships, and external circumstances. It changes based on your surroundings.
                                      </p>
                                    </div>

                                    {/* Giving Energy */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                          style={{backgroundColor: getAccurateColorCode(getGivingEnergyColor(result))}}
                                        >
                                          <span className="text-white font-bold">➡️</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-orange-800">{getGivingEnergyColor(result)}</h5>
                                          <p className="text-sm text-orange-600">Giving Energy (Dynamic)</p>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        This dynamic energy on your right side reveals how you give energy to the world and create patterns in your life. 
                                        It shows your active contribution and how you influence reality through actions.
                                      </p>
                                    </div>

                                    {/* Personality Color */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div 
                                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                          style={{backgroundColor: getAccurateColorCode(getPersonalityColor(result))}}
                                        >
                                          <span className="text-white font-bold">🌈</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-amber-800">{getPersonalityColor(result)}</h5>
                                          <p className="text-sm text-amber-600">Personality Color (Static)</p>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        This static color surrounding your entire energy field represents your fundamental personality and 
                                        core nature. It explains why certain things happen to you and reveals your karmic patterns.
                                      </p>
                                    </div>

                                  </div>
                                </div>

                                {/* Detailed Color Analysis */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Primary Color Details */}
                                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center space-x-4 mb-4">
                                      <div 
                                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                                        style={{backgroundColor: getAccurateColorCode(result.dominantColor)}}
                                      >
                                        <span className="text-white font-bold text-lg">
                                          {result.dominantColor.charAt(0)}
                                        </span>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-lg">{result.dominantColor}</h4>
                                        <p className="text-sm text-gray-600">Primary Crown Energy</p>
                                      </div>
                                    </div>

                                    {/* Positive Aspects */}
                                    <div className="mb-4">
                                      <h5 className="font-semibold text-sm text-green-700 mb-2">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Positive: {getPositiveTraits(result.dominantColor)}
                                      </h5>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {getPositiveDescription(result.dominantColor)}
                                      </p>
                                    </div>

                                    {/* Shadow Aspects */}
                                    <div className="mb-4">
                                      <h5 className="font-semibold text-sm text-amber-700 mb-2">
                                        <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                        Areas for Growth: {getShadowTraits(result.dominantColor)}
                                      </h5>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {getShadowDescription(result.dominantColor)}
                                      </p>
                                    </div>

                                    {/* Spiritual Placement */}
                                    <div>
                                      <h5 className="font-semibold text-sm text-blue-700 mb-2">
                                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                        Energy Placement: {getPlacementDescription(result.dominantColor)}
                                      </h5>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {getDetailedPlacement(result.dominantColor)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Secondary & Supporting Colors */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-lg">Secondary & Supporting Colors</h4>
                                    
                                    {/* Secondary Color */}
                                    <div className="bg-gray-50 border rounded-lg p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                      <div 
                                        className="w-8 h-8 rounded-full"
                                        style={{backgroundColor: getAccurateColorCode(result.secondaryColor)}}
                                      ></div>
                                      <div>
                                        <h5 className="font-medium">{result.secondaryColor}</h5>
                                        <p className="text-xs text-gray-600">Right side of lower abdomen, 2 inches below navel</p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                      {getSecondaryColorDescription(result.secondaryColor)}
                                    </p>
                                  </div>

                                  {/* Extended Color Spectrum */}
                                  {result.auraColorSpectrum && result.auraColorSpectrum.length > 2 && (
                                    <>
                                      {result.auraColorSpectrum.slice(2, 5).map((color, index) => (
                                        <div key={index} className="bg-gray-50 border rounded-lg p-4">
                                          <div className="flex items-center space-x-3 mb-3">
                                            <div 
                                              className="w-8 h-8 rounded-full"
                                              style={{backgroundColor: getAccurateColorCode(color)}}
                                            ></div>
                                            <div>
                                              <h5 className="font-medium">{color}</h5>
                                              <p className="text-xs text-gray-600">{getSupportingColorLocation(color, index)}</p>
                                            </div>
                                          </div>
                                          <p className="text-sm text-gray-700">
                                            {getSupportingColorDescription(color)}
                                          </p>
                                        </div>
                                      ))}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Energy Interaction Map */}
                              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
                                <h4 className="font-semibold text-lg mb-4">Energy Interaction Map</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">Energy Flow Pattern</h5>
                                    <p className="text-sm text-gray-700">
                                      {getEnergyFlowPattern(result.dominantColor, result.secondaryColor)}
                                    </p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">Balancing Recommendations</h5>
                                    <p className="text-sm text-gray-700">
                                      {getBalancingRecommendations(result.dominantColor, result.secondaryColor)}
                                    </p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">Optimal Energy Times</h5>
                                    <p className="text-sm text-gray-700">
                                      {getOptimalEnergyTimes(result.dominantColor)}
                                    </p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">Compatible Energies</h5>
                                    <p className="text-sm text-gray-700">
                                      {getCompatibleEnergies(result.dominantColor)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Visual Energy Map */}
                              <div className="bg-black rounded-lg p-6 relative overflow-hidden">
                                <h4 className="text-white font-semibold text-lg mb-4">Your Personal Energy Signature</h4>
                                <div className="flex justify-center items-center space-x-8">
                                  <div className="relative">
                                    {/* Dominant Energy Visualization */}
                                    <div 
                                      className="w-24 h-24 rounded-full opacity-90 animate-pulse"
                                      style={{background: `radial-gradient(circle, ${getAccurateColorCode(result.dominantColor)} 0%, ${getAccurateColorCode(result.dominantColor)}80 50%, transparent 100%)`}}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">Core</span>
                                    </div>
                                  </div>
                                  
                                  {/* Secondary Energy */}
                                  <div className="relative">
                                    <div 
                                      className="w-16 h-16 rounded-full opacity-75 animate-pulse"
                                      style={{background: `radial-gradient(circle, ${getAccurateColorCode(result.secondaryColor)} 0%, ${getAccurateColorCode(result.secondaryColor)}60 50%, transparent 100%)`, animationDelay: '0.5s'}}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-white font-medium text-xs">Flow</span>
                                    </div>
                                  </div>

                                  {/* Supporting energies */}
                                  {result.auraColorSpectrum && result.auraColorSpectrum.slice(2, 4).map((color, index) => (
                                    <div key={index} className="relative">
                                      <div 
                                        className="w-12 h-12 rounded-full opacity-60 animate-pulse"
                                        style={{
                                          background: `radial-gradient(circle, ${getAccurateColorCode(color)} 0%, ${getAccurateColorCode(color)}40 50%, transparent 100%)`,
                                          animationDelay: `${1 + index * 0.5}s`
                                        }}
                                      ></div>
                                    </div>
                                  ))}
                                </div>
                                <div className="text-center mt-4">
                                  <p className="text-white/80 text-sm">Energy radiating from {result.dominantColor} core through {result.secondaryColor || result.dominantColor} pathways</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          </TabsContent>
                          
                          <TabsContent value="combined">
                            <div className="space-y-6">
                              {!numerologyResult ? (
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                                  <div className="text-center mb-6">
                                    <h3 className="font-medium text-lg mb-2">Enhanced Aura & Numerology Integration</h3>
                                    <p className="text-sm text-gray-600">
                                      Unlock deeper spiritual insights by combining your aura colors with numerological chakra analysis
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Aura Color Display */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h4 className="font-medium mb-3">Your Current Aura Signature</h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                          <div 
                                            className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                                            style={{ 
                                              backgroundColor: getAccurateColorCode(result.dominantColor),
                                              boxShadow: `0 0 15px 2px ${getAccurateColorCode(result.dominantColor)}60`
                                            }}
                                          ></div>
                                          <div>
                                            <div className="font-medium text-sm">{result.dominantColor} - Dominant</div>
                                            <div className="text-xs text-gray-600">{getChakraConnection(result.dominantColor).split('.')[0]}</div>
                                          </div>
                                        </div>
                                        {result.secondaryColor && (
                                          <div className="flex items-center space-x-3">
                                            <div 
                                              className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                                              style={{ 
                                                backgroundColor: getAccurateColorCode(result.secondaryColor),
                                                boxShadow: `0 0 10px 1px ${getAccurateColorCode(result.secondaryColor)}60`
                                              }}
                                            ></div>
                                            <div>
                                              <div className="font-medium text-sm">{result.secondaryColor} - Secondary</div>
                                              <div className="text-xs text-gray-600">{getChakraConnection(result.secondaryColor).split('.')[0]}</div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Chakra Preview */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h4 className="font-medium mb-3">Dominant Chakra Energy</h4>
                                      <div className="text-center">
                                        <div className={`w-16 h-16 rounded-full mx-auto mb-2 ${getColorClass(result.dominantColor)} opacity-80`}></div>
                                        <div className="text-sm font-medium">{getChakraConnection(result.dominantColor).split('Chakra')[0]}Chakra</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          Energy Level: {result.energyLevel}/10
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Enter your full birth name"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                        value={numerologyName}
                                        onChange={(e) => setNumerologyName(e.target.value)}
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Birth Date
                                      </label>
                                      <input
                                        type="date"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                        value={numerologyBirthDate}
                                        onChange={(e) => setNumerologyBirthDate(e.target.value)}
                                      />
                                    </div>
                                    
                                    <Button 
                                      className="w-full"
                                      onClick={() => calculateNumerologyData(numerologyName, numerologyBirthDate)}
                                      disabled={isCalculatingNumerology}
                                    >
                                      {isCalculatingNumerology ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Creating Combined Analysis...
                                        </>
                                      ) : "Create Combined Spiritual Analysis"}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {/* Energy Alignment Status */}
                                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="font-medium text-lg">Spiritual Energy Alignment</h3>
                                      <Badge variant={getCombinedInsights(result, numerologyResult).energyAlignment === 'Highly Aligned' ? 'default' : 'secondary'}>
                                        {getCombinedInsights(result, numerologyResult).energyAlignment}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                      {getCombinedInsights(result, numerologyResult).compatibility}
                                    </p>
                                  </div>

                                  {/* Combined Numbers and Colors */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h4 className="font-medium mb-3">Aura & Life Path Connection</h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Dominant Aura Color</span>
                                          <div className="flex items-center space-x-2">
                                            <div className={`w-4 h-4 rounded-full ${getColorClass(result.dominantColor)}`}></div>
                                            <span className="text-sm font-medium">{result.dominantColor}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Life Path Number</span>
                                          <span className="text-2xl font-bold text-purple-600">{numerologyResult.lifePathNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Life Path Color</span>
                                          <div className="flex items-center space-x-2">
                                            <div className={`w-4 h-4 rounded-full ${getColorClass(getCombinedInsights(result, numerologyResult).lifePathColor)}`}></div>
                                            <span className="text-sm font-medium">{getCombinedInsights(result, numerologyResult).lifePathColor}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h4 className="font-medium mb-3">Personality Integration</h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Energy Level</span>
                                          <span className="text-sm font-medium">{result.energyLevel}/10</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Personality Number</span>
                                          <span className="text-2xl font-bold text-indigo-600">{numerologyResult.personalityNumber}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                          {getCombinedInsights(result, numerologyResult).personalityIntegration}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Enhanced Chakra & Planetary Analysis */}
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Chakra Alignment Details */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-100">
                                      <h4 className="font-medium mb-4 flex items-center">
                                        <div className={`w-4 h-4 rounded-full mr-2 ${getColorClass(result.dominantColor)}`}></div>
                                        Dominant Soul Chakra Analysis
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Active Chakra</span>
                                          <span className="text-sm font-medium">{getCombinedInsights(result, numerologyResult).chakraAlignment}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Planetary Influence</span>
                                          <span className="text-sm font-medium">{getCombinedInsights(result, numerologyResult).planetaryInfluence}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Sacred Mantra</span>
                                          <span className="text-sm font-mono bg-white px-2 py-1 rounded">{getCombinedInsights(result, numerologyResult).sacredMantra}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">Soul Chakra Type</span>
                                          <span className="text-sm font-medium">{getCombinedInsights(result, numerologyResult).dominantSoulChakra}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Archangel & Crystal Guidance */}
                                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-6 border border-violet-100">
                                      <h4 className="font-medium mb-4">Spiritual Support System</h4>
                                      <div className="space-y-3">
                                        <div>
                                          <span className="text-sm text-gray-600 block">Archangel Guidance</span>
                                          <span className="text-sm font-medium text-purple-700">{getCombinedInsights(result, numerologyResult).archangelGuidance}</span>
                                        </div>
                                        <div>
                                          <span className="text-sm text-gray-600 block">Healing Crystals</span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {getCombinedInsights(result, numerologyResult).healingCrystals.map((crystal, index) => (
                                              <span key={index} className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200">
                                                {crystal}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-sm text-gray-600 block">Energy Alignment</span>
                                          <div className="mt-1">
                                            <Badge variant={getCombinedInsights(result, numerologyResult).energyAlignment === 'Perfect Alignment' ? 'default' : 
                                                           getCombinedInsights(result, numerologyResult).energyAlignment === 'Highly Aligned' ? 'secondary' : 'outline'}>
                                              {getCombinedInsights(result, numerologyResult).energyAlignment}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Combined Spiritual Guidance */}
                                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
                                    <h4 className="font-medium mb-3">Integrated Spiritual Guidance</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                      {getCombinedInsights(result, numerologyResult).spiritualGuidance}
                                    </p>
                                    
                                    <div className="bg-white rounded-lg p-4 border border-amber-200 mb-4">
                                      <h5 className="font-medium text-sm mb-2 text-amber-800">Personality Integration Insight</h5>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {getCombinedInsights(result, numerologyResult).personalityIntegration}
                                      </p>
                                    </div>
                                    
                                    <h5 className="font-medium text-sm mb-3">Personalized Spiritual Practices</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {getCombinedInsights(result, numerologyResult).recommendedPractices.map((practice, index) => (
                                        <div key={index} className="flex items-start text-sm text-gray-600 bg-white p-3 rounded border border-amber-100">
                                          <span className="text-amber-500 mr-2 flex-shrink-0">•</span>
                                          <span>{practice}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Reset Option */}
                                  <div className="flex items-center justify-between pt-4 border-t">
                                    <p className="text-sm text-gray-500">
                                      Based on: {numerologyName}, {new Date(numerologyBirthDate).toLocaleDateString()}
                                    </p>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          setNumerologyResult(null);
                                          setNumerologyName("");
                                          setNumerologyBirthDate("");
                                        }}
                                      >
                                        New Analysis
                                      </Button>
                                      <Button 
                                        variant="default" 
                                        size="sm"
                                        onClick={() => {
                                          window.location.href = '/services#numerology';
                                        }}
                                      >
                                        Know More
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="numerology">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-lg">Numerology Profile</h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Discover how your birth date and name influence your spiritual journey
                                  </p>
                                </div>
                              </div>
                              
                              {!numerologyResult ? (
                                <div className="space-y-6 bg-gray-50 rounded-lg p-6">
                                  <div className="text-center">
                                    <h4 className="font-medium">Enter Your Details</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      We'll calculate your numerology profile based on your name and birth date
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label htmlFor="fullName" className="text-sm font-medium">
                                        Full Name
                                      </label>
                                      <input
                                        id="fullName"
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                        value={numerologyName}
                                        onChange={(e) => setNumerologyName(e.target.value)}
                                      />
                                      <p className="text-xs text-gray-500">Use your full birth name for the most accurate results</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <label htmlFor="birthDate" className="text-sm font-medium">
                                        Birth Date
                                      </label>
                                      <input
                                        id="birthDate"
                                        type="date"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                        value={numerologyBirthDate}
                                        onChange={(e) => setNumerologyBirthDate(e.target.value)}
                                      />
                                    </div>
                                    
                                    <Button 
                                      className="w-full"
                                      onClick={() => calculateNumerology(numerologyName, numerologyBirthDate)}
                                      disabled={isCalculatingNumerology}
                                    >
                                      {isCalculatingNumerology ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Calculating...
                                        </>
                                      ) : "Calculate Numerology Profile"}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
                                      <div className="text-3xl font-bold text-purple-800">{numerologyResult.lifePathNumber}</div>
                                      <div className="text-sm text-gray-600 mt-1">Life Path Number</div>
                                    </div>
                                    
                                    <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100">
                                      <div className="text-3xl font-bold text-indigo-800">{numerologyResult.destinyNumber}</div>
                                      <div className="text-sm text-gray-600 mt-1">Destiny Number</div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                                      <div className="text-3xl font-bold text-blue-800">{numerologyResult.soulUrgeNumber}</div>
                                      <div className="text-sm text-gray-600 mt-1">Soul Urge Number</div>
                                    </div>
                                    
                                    <div className="bg-sky-50 rounded-lg p-4 text-center border border-sky-100">
                                      <div className="text-3xl font-bold text-sky-800">{numerologyResult.personalityNumber}</div>
                                      <div className="text-sm text-gray-600 mt-1">Personality Number</div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                                    <h4 className="font-medium mb-2">Your Numerology Interpretation</h4>
                                    <p className="text-sm text-gray-600">
                                      {numerologyResult.interpretation}
                                    </p>
                                  </div>
                                  
                                  <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                      Based on: {numerologyName}, {new Date(numerologyBirthDate).toLocaleDateString()}
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setNumerologyResult(null);
                                        setNumerologyName("");
                                        setNumerologyBirthDate("");
                                      }}
                                    >
                                      Calculate New Profile
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex items-center">
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium">Tip:</span> Combine your aura colors with your numerology for deeper spiritual insights
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    if (result) setActiveTab("analysis");
                                  }}
                                >
                                  View Aura Analysis
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="analysis">
                            <div className="space-y-10">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-lg mt-2.5">Your Aura Photo Analysis</h3>
                                  <p className="text-sm text-gray-500">Analysis of the visible energy fields in your specialized aura photograph</p>
                                </div>
                                <div className="flex gap-2">
                                  <span 
                                    className="inline-block w-6 h-6 rounded-full border border-gray-200" 
                                    style={{ 
                                      backgroundColor: getAccurateColorCode(result.dominantColor),
                                      boxShadow: `0 0 8px 1px ${getAccurateColorCode(result.dominantColor)}80`
                                    }}
                                  ></span>
                                  {result.secondaryColor && (
                                    <span 
                                      className="inline-block w-6 h-6 rounded-full border border-gray-200" 
                                      style={{ 
                                        backgroundColor: getAccurateColorCode(result.secondaryColor),
                                        boxShadow: `0 0 8px 1px ${getAccurateColorCode(result.secondaryColor)}80`
                                      }}
                                    ></span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Image Comparison Section */}
                              {originalImage && (
                                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                                  <h3 className="font-medium text-lg mb-4 text-center">Image Comparison: Original vs Aura Visualization</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Original Image */}
                                    <div className="text-center">
                                      <h4 className="font-medium mb-3">Original Photo</h4>
                                      <div className="relative bg-white rounded-lg shadow-sm border p-4">
                                        <img 
                                          src={originalImage} 
                                          alt="Original uploaded image" 
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      </div>
                                    </div>
                                    
                                    {/* Processed Aura Image */}
                                    <div className="text-center">
                                      <h4 className="font-medium mb-3">With Aura Colors</h4>
                                      <div className="relative bg-white rounded-lg shadow-sm border p-4">
                                        {processedAuraImage ? (
                                          <img 
                                            src={processedAuraImage} 
                                            alt="Image with aura colors" 
                                            className="w-full h-full object-cover rounded-lg"
                                          />
                                        ) : (
                                          <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                                            <span className="text-gray-500 text-sm">Processing aura visualization...</span>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600 mt-2">
                                        Aura colors: {result.dominantColor} & {result.secondaryColor}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Aura visualization */}
                              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                  <div className="relative w-48 h-48">
                                    {/* Aura visualization with actual colors detected */}
                                    <div 
                                      className="absolute inset-0 rounded-full animate-pulse" 
                                      style={{
                                        background: `radial-gradient(circle at center, 
                                          ${getAccurateColorCode(result.dominantColor)} 30%, 
                                          ${getAccurateColorCode(result.secondaryColor || result.dominantColor)} 70%)`,
                                        boxShadow: `0 0 30px 10px ${getAccurateColorCode(result.dominantColor)}80`,
                                        opacity: 0.7
                                      }}
                                    ></div>
                                    <div 
                                      className="absolute inset-8 rounded-full" 
                                      style={{
                                        background: `radial-gradient(circle at center, 
                                          ${getAccurateColorCode(result.dominantColor)}99 40%, 
                                          ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}99 80%)`,
                                        opacity: 0.8
                                      }}
                                    ></div>
                                    <div className="absolute inset-16 rounded-full flex items-center justify-center bg-white/30 backdrop-blur-sm">
                                      <Sparkles className="h-8 w-8 text-gray-700/60" />
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Detected Aura Colors</h4>
                                      <p className="text-sm text-gray-600 mb-3">
                                        The colored energy field visible around you in your specialized aura photograph reveals your spiritual signature:
                                      </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex items-start gap-3">
                                          <div 
                                            className="w-12 h-12 rounded-full flex-shrink-0" 
                                            style={{ 
                                              backgroundColor: getAccurateColorCode(result.dominantColor),
                                              boxShadow: `0 0 10px 2px ${getAccurateColorCode(result.dominantColor)}60`
                                            }}
                                          ></div>
                                          <div className="flex-1">
                                            <div className="text-xs text-gray-500 mb-1">Primary Aura</div>
                                            <div className="text-lg font-bold mb-2">{result.dominantColor}</div>
                                            <div className="space-y-2">
                                              <div className="text-sm text-gray-700 leading-relaxed">
                                                {getColorPositiveMeaning(result.dominantColor)}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {result.secondaryColor && (
                                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                          <div className="flex items-start gap-3">
                                            <div 
                                              className="w-12 h-12 rounded-full flex-shrink-0" 
                                              style={{ 
                                                backgroundColor: getAccurateColorCode(result.secondaryColor),
                                                boxShadow: `0 0 10px 2px ${getAccurateColorCode(result.secondaryColor)}60`
                                              }}
                                            ></div>
                                            <div className="flex-1">
                                              <div className="text-xs text-gray-500 mb-1">Secondary Aura</div>
                                              <div className="text-lg font-bold mb-2">{result.secondaryColor}</div>
                                              <div className="space-y-2">
                                                <div className="text-sm text-gray-700 leading-relaxed">
                                                  {getColorPositiveMeaning(result.secondaryColor)}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
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
                                <div className="text-center text-sm font-medium mt-1">
                                  {result.energyLevel}/10 - {getEnergyLevelDescription(result.energyLevel)}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm text-gray-500 mb-2">Personality Traits</h4>
                                <div className="flex flex-wrap gap-2">
                                  {result.personalityTraits.map((trait, index) => (
                                    <Badge key={index} variant="outline" className="rounded-full">
                                      {trait}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Energy Aspects Section */}
                              <div>
                                <h4 className="text-sm text-gray-500 mb-4">Energy Aspects</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-3 text-center border border-amber-200">
                                    <div className="text-amber-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Recieving Energy</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.ceil(result.energyLevel * 5 / 10) ? 'bg-amber-500' : 'bg-amber-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 text-center border border-purple-200">
                                    <div className="text-purple-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Giving Energy</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.floor(result.chakraActivity.heart / 2) ? 'bg-purple-500' : 'bg-purple-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200">
                                    <div className="text-blue-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Overall Strength</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.floor(result.chakraActivity.root / 2) ? 'bg-blue-500' : 'bg-blue-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
                                    <div className="text-green-600 mb-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                      </svg>
                                    </div>
                                    <h5 className="font-medium text-sm">Alignment</h5>
                                    <div className="mt-1 flex justify-center">
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.ceil(result.chakraActivity.heart / 2) ? 'bg-green-500' : 'bg-green-200'}`}></span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="chakras">
                            <div className="space-y-6">
                              <h3 className="font-medium text-lg">9-Chakra Energy System Analysis</h3>
                              
                              <div className="space-y-4">
                                {/* Soul Star Chakra - Number 7 */}
                                <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Soul Star Chakra connects you to divine consciousness and spiritual transcendence, representing your highest potential and cosmic awareness.
                                    </p>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Soul Star Chakra (7)</span>
                                      <span className="text-gray-600">{Math.round(calculateSoulStarChakra(result)/10)}/10 ({calculateSoulStarChakra(result)}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={calculateSoulStarChakra(result)} className="h-3 bg-gray-200" />
                                </div>

                                {/* Crown Chakra - Number 3 */}
                                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Crown Chakra governs spiritual connection, divine wisdom, and your link to universal consciousness and higher guidance.
                                    </p>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Crown Chakra (3)</span>
                                      <span className="text-violet-600">{result.chakraActivity.crown}/10 ({result.chakraActivity.crown * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={result.chakraActivity.crown * 10} className="h-3 bg-violet-100" />
                                  {result.chakraActivity.crown * 10 < 70 && (
                                    <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                                      <h5 className="font-medium text-sm text-violet-800 mb-2">Healing Remedies for Crown Chakra</h5>
                                      <p className="text-xs text-gray-700 leading-relaxed">
                                        {getChakraRemedies('Crown', result.chakraActivity.crown * 10)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Third Eye Chakra - Number 8 */}
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Third Eye Chakra enhances intuition, psychic abilities, inner wisdom, and your capacity to see beyond the physical realm.
                                    </p>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Third Eye Chakra (8)</span>
                                      <span className="text-indigo-600">{result.chakraActivity.thirdEye}/10 ({result.chakraActivity.thirdEye * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={result.chakraActivity.thirdEye * 10} className="h-3 bg-indigo-100" />
                                  {result.chakraActivity.thirdEye * 10 < 70 && (
                                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                      <h5 className="font-medium text-sm text-indigo-800 mb-2">Healing Remedies for Third Eye Chakra</h5>
                                      <p className="text-xs text-gray-700 leading-relaxed">
                                        {getChakraRemedies('Third Eye', result.chakraActivity.thirdEye * 10)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Throat Chakra - Number 5 */}
                                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Throat Chakra governs communication, self-expression, truth-speaking, and your ability to voice your authentic self.
                                    </p>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Throat Chakra (5)</span>
                                      <span className="text-blue-600">{result.chakraActivity.throat}/10 ({result.chakraActivity.throat * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={result.chakraActivity.throat * 10} className="h-3 bg-blue-100" />
                                  {result.chakraActivity.throat * 10 < 70 && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <h5 className="font-medium text-sm text-blue-800 mb-2">Healing Remedies for Throat Chakra</h5>
                                      <p className="text-xs text-gray-700 leading-relaxed">
                                        {getChakraRemedies('Throat', result.chakraActivity.throat * 10)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Heart Chakra - Number 2 */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Heart Chakra controls love, compassion, emotional healing, relationships, and your ability to give and receive love.
                                    </p>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Heart Chakra (2)</span>
                                      <span className="text-green-600">{result.chakraActivity.heart}/10 ({result.chakraActivity.heart * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={result.chakraActivity.heart * 10} className="h-3 bg-green-100" />
                                  {result.chakraActivity.heart * 10 < 70 && (
                                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                      <h5 className="font-medium text-sm text-green-800 mb-2">Healing Remedies for Heart Chakra</h5>
                                      <p className="text-xs text-gray-700 leading-relaxed">
                                        {getChakraRemedies('Heart', result.chakraActivity.heart * 10)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Solar Plexus Chakra - Number 1 */}
                                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Solar Plexus Chakra governs personal power, confidence, willpower, and your sense of identity and self-worth.
                                    </p>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Solar Plexus Chakra (1)</span>
                                      <span className="text-yellow-600">{result.chakraActivity.solarPlexus}/10 ({result.chakraActivity.solarPlexus * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={result.chakraActivity.solarPlexus * 10} className="h-3 bg-yellow-100" />
                                  {result.chakraActivity.solarPlexus * 10 < 70 && (
                                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                      <h5 className="font-medium text-sm text-yellow-800 mb-2">Healing Remedies for Solar Plexus Chakra</h5>
                                      <p className="text-xs text-gray-700 leading-relaxed">
                                        {getChakraRemedies('Solar Plexus', result.chakraActivity.solarPlexus * 10)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Sacral Chakra - Number 6 */}
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Sacral Chakra influences creativity, sexuality, emotional flow, pleasure, and your capacity for joy and passion.
                                    </p>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Sacral Chakra (6)</span>
                                      <span className="text-orange-600">{result.chakraActivity.sacral}/10 ({result.chakraActivity.sacral * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={result.chakraActivity.sacral * 10} className="h-3 bg-orange-100" />
                                  {result.chakraActivity.sacral * 10 < 70 && (
                                    <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                      <h5 className="font-medium text-sm text-orange-800 mb-2">Healing Remedies for Sacral Chakra</h5>
                                      <p className="text-xs text-gray-700 leading-relaxed">
                                        {getChakraRemedies('Sacral', result.chakraActivity.sacral * 10)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Root Chakra - Number 9 */}
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Root Chakra provides grounding, survival instincts, physical vitality, and your connection to earth energy and stability.
                                    </p>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Root Chakra (9)</span>
                                      <span className="text-red-600">{result.chakraActivity.root}/10 ({result.chakraActivity.root * 10}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={result.chakraActivity.root * 10} className="h-3 bg-red-100" />
                                  {result.chakraActivity.root * 10 < 70 && (
                                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                      <h5 className="font-medium text-sm text-red-800 mb-2">Healing Remedies for Root Chakra</h5>
                                      <p className="text-xs text-gray-700 leading-relaxed">
                                        {getChakraRemedies('Root', result.chakraActivity.root * 10)}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Earth Star Chakra - Number 4 */}
                                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                                  <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-3">
                                      The Earth Star Chakra anchors you to earth energy, provides deep grounding, and connects you to planetary consciousness.
                                    </p>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium">Earth Star Chakra (4)</span>
                                      <span className="text-amber-600">{Math.round(calculateEarthStarChakra(result)/10)}/10 ({calculateEarthStarChakra(result)}%)</span>
                                    </div>
                                  </div>
                                  <Progress value={calculateEarthStarChakra(result)} className="h-3 bg-amber-100" />
                                </div>
                              </div>

                              {/* Chakra Summary */}
                              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                                <h4 className="font-medium text-lg mb-3">Your Chakra Profile</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600 mb-1">
                                      {Math.round((result.chakraActivity.crown + result.chakraActivity.thirdEye + calculateSoulStarChakra(result)/10) / 3 * 10)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Higher Chakras</div>
                                    <div className="text-xs text-gray-500">Spiritual Connection</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                      {Math.round((result.chakraActivity.throat + result.chakraActivity.heart + result.chakraActivity.solarPlexus) / 3 * 10)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Middle Chakras</div>
                                    <div className="text-xs text-gray-500">Emotional Balance</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600 mb-1">
                                      {Math.round((result.chakraActivity.sacral + result.chakraActivity.root + calculateEarthStarChakra(result)/10) / 3 * 10)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Lower Chakras</div>
                                    <div className="text-xs text-gray-500">Physical Grounding</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="guidance">
                            <div>
                              <h3 className="font-medium mb-3">Spiritual Guidance</h3>
                              <p className="text-gray-700 whitespace-pre-line">{result.spiritualGuidance}</p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="detailed">
                            <div>
                              <div className="mb-6 relative">
                                <div className="absolute -top-3 -right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-300 z-17 mb-5">
                                  Advanced Feature
                                </div>
                                <h3 className="font-medium text-lg mb-5 text-primary">Advanced Aura Field Analysis</h3>
                                
                                {/* Premium Aura Visualization */}
                                <div className="relative h-56 mb-6 overflow-hidden rounded-lg">
                                  {/* Background gradient animation */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20 z-10"></div>
                                  <div 
                                    className="absolute inset-0 animate-pulse-slow" 
                                    style={{
                                      background: `radial-gradient(ellipse at center, 
                                        ${getAccurateColorCode(result.dominantColor)}99 20%, 
                                        ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}70 60%, 
                                        rgba(0,0,0,0) 70%)`,
                                      filter: 'blur(20px)',
                                      transformOrigin: 'center',
                                      animation: 'pulse 8s infinite ease-in-out'
                                    }}
                                  ></div>
                                  
                                  {/* Multiple energy layers */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-40 h-40">
                                      {/* Etheric Layer */}
                                      <div 
                                        className="absolute inset-0 rounded-full animate-pulse-slow opacity-70" 
                                        style={{
                                          background: `radial-gradient(circle at center, 
                                            ${getAccurateColorCode(result.dominantColor)}99 0%, 
                                            ${getAccurateColorCode(result.dominantColor)}20 70%, 
                                            transparent 100%)`,
                                          animation: 'pulse 10s infinite ease-in-out',
                                          animationDelay: '0.5s'
                                        }}
                                      ></div>
                                      
                                      {/* Emotional Layer */}
                                      <div 
                                        className="absolute inset-4 rounded-full animate-pulse-slow opacity-80" 
                                        style={{
                                          background: `radial-gradient(circle at center, 
                                            ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}99 0%, 
                                            ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}30 80%, 
                                            transparent 100%)`,
                                          animation: 'pulse 8s infinite ease-in-out',
                                          animationDelay: '1s'
                                        }}
                                      ></div>
                                      
                                      {/* Mental Layer */}
                                      <div 
                                        className="absolute inset-8 rounded-full animate-pulse-slow opacity-90" 
                                        style={{
                                          background: `radial-gradient(circle at center, 
                                            ${getAccurateColorCode(result.dominantColor)}90 0%, 
                                            ${getAccurateColorCode(result.dominantColor)}40 70%, 
                                            transparent 100%)`,
                                          animation: 'pulse 6s infinite ease-in-out',
                                          animationDelay: '1.5s'
                                        }}
                                      ></div>
                                      
                                      {/* Spiritual Core */}
                                      <div 
                                        className="absolute inset-12 rounded-full animate-pulse-slow opacity-95 flex items-center justify-center" 
                                        style={{
                                          background: `radial-gradient(circle at center, 
                                            white 0%, 
                                            ${getAccurateColorCode(result.secondaryColor || result.dominantColor)}70 70%, 
                                            transparent 100%)`,
                                          animation: 'pulse 4s infinite ease-in-out',
                                          animationDelay: '2s'
                                        }}
                                      >
                                        <Sparkles className="w-6 h-6 text-white/90" />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Labels */}
                                  <div className="absolute top-3 left-3 text-white text-xs font-medium bg-black/30 px-2 py-1 rounded z-20">
                                    Multi-Layer Aura Visualization
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
                                  <h4 className="font-medium text-base mb-3">Specialized Aura Interpretation</h4>
                                  <p className="text-gray-700 whitespace-pre-line mb-5">{result.detailedAnalysis}</p>
                                  
                                  {/* Comprehensive Aura Color Spectrum */}
                                  <div className="mb-6">
                                    <h4 className="font-medium text-sm text-secondary mb-3">Complete Aura Color Spectrum</h4>
                                    <div className="relative h-14 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-violet-600 rounded-md mb-2 overflow-hidden">
                                      {/* Frequency markers */}
                                      <div className="absolute inset-0 flex justify-between px-1">
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                        <div className="h-full w-px bg-white/30"></div>
                                      </div>
                                      
                                      {/* Primary and secondary colors */}
                                      {auraHelpers.getColorPosition(result.dominantColor) !== null && (
                                        <div 
                                          className="absolute top-0 bottom-0 w-6 border-2 border-white rounded-sm" 
                                          style={{ 
                                            left: `${auraHelpers.getColorPosition(result.dominantColor)}%`,
                                            transform: 'translateX(-50%)',
                                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)' 
                                          }}
                                        ></div>
                                      )}
                                      
                                      {result.secondaryColor && auraHelpers.getColorPosition(result.secondaryColor) !== null && (
                                        <div 
                                          className="absolute top-0 bottom-0 w-6 border-2 border-white rounded-sm opacity-70" 
                                          style={{ 
                                            left: `${auraHelpers.getColorPosition(result.secondaryColor)}%`,
                                            transform: 'translateX(-50%)',
                                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.6)' 
                                          }}
                                        ></div>
                                      )}
                                      
                                      {/* Additional aura colors from the spectrum (if available) */}
                                      {result.auraColorSpectrum && result.auraColorSpectrum.slice(2).map((color, index) => 
                                        auraHelpers.getColorPosition(color) !== null && (
                                          <div 
                                            key={`spectrum-${index}`}
                                            className="absolute top-0 bottom-0 w-4 border border-white rounded-sm opacity-40" 
                                            style={{ 
                                              left: `${auraHelpers.getColorPosition(color)}%`,
                                              transform: 'translateX(-50%)',
                                              boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)' 
                                            }}
                                          ></div>
                                        )
                                      )}
                                    </div>
                                    
                                    {/* Frequency labels */}
                                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                                      <span>Physical (Lower Hz)</span>
                                      <span>Emotional</span>
                                      <span>Mental</span>
                                      <span>Spiritual (Higher Hz)</span>
                                    </div>
                                    
                                    {/* Aura color spectrum display */}
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-2">Complete Aura Color Profile</h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                        {/* Always show primary color */}
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                          <div 
                                            className="w-8 h-8 rounded-full flex-shrink-0" 
                                            style={{ 
                                              backgroundColor: getAccurateColorCode(result.dominantColor),
                                              boxShadow: `0 0 10px ${getAccurateColorCode(result.dominantColor)}60`
                                            }}
                                          ></div>
                                          <div>
                                            <div className="text-xs text-gray-500">Primary</div>
                                            <div className="text-sm font-medium">{result.dominantColor}</div>
                                          </div>
                                        </div>
                                        
                                        {/* Show secondary color if present */}
                                        {result.secondaryColor && (
                                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                            <div 
                                              className="w-8 h-8 rounded-full flex-shrink-0" 
                                              style={{ 
                                                backgroundColor: getAccurateColorCode(result.secondaryColor),
                                                boxShadow: `0 0 10px ${getAccurateColorCode(result.secondaryColor)}60`
                                              }}
                                            ></div>
                                            <div>
                                              <div className="text-xs text-gray-500">Secondary</div>
                                              <div className="text-sm font-medium">{result.secondaryColor}</div>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Show additional colors from spectrum if available */}
                                        {result.auraColorSpectrum ? (
                                          result.auraColorSpectrum.slice(2).map((color, index) => (
                                            <div key={`color-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                              <div 
                                                className="w-8 h-8 rounded-full flex-shrink-0" 
                                                style={{ 
                                                  backgroundColor: getAccurateColorCode(color),
                                                  boxShadow: `0 0 10px ${getAccurateColorCode(color)}60`
                                                }}
                                              ></div>
                                              <div>
                                                <div className="text-xs text-gray-500">Complementary</div>
                                                <div className="text-sm font-medium">{color}</div>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          // Fallback colors when auraColorSpectrum isn't available
                                          <>
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                              <div 
                                                className="w-8 h-8 rounded-full flex-shrink-0 bg-opacity-70"
                                                style={{ 
                                                  backgroundColor: result.dominantColor.toLowerCase(),
                                                  opacity: 0.6,
                                                  boxShadow: `0 0 10px ${result.dominantColor.toLowerCase()}30`
                                                }}
                                              ></div>
                                              <div>
                                                <div className="text-xs text-gray-500">Complementary</div>
                                                <div className="text-sm font-medium">{auraHelpers.getComplementaryColor(result.dominantColor)}</div>
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                              <div 
                                                className="w-8 h-8 rounded-full flex-shrink-0 bg-opacity-70"
                                                style={{ 
                                                  backgroundColor: result.secondaryColor?.toLowerCase() || 
                                                    (auraHelpers.getComplementaryColor(result.dominantColor) || "white").toLowerCase(),
                                                  opacity: 0.6,
                                                  boxShadow: `0 0 10px ${(result.secondaryColor?.toLowerCase() || 
                                                    (auraHelpers.getComplementaryColor(result.dominantColor) || "white").toLowerCase())}30`
                                                }}
                                              ></div>
                                              <div>
                                                <div className="text-xs text-gray-500">Complementary</div>
                                                <div className="text-sm font-medium">{auraHelpers.getComplementaryColor(result.secondaryColor || result.dominantColor)}</div>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Aura Layers Interpretation</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                        <span 
                                          className="inline-block w-3 h-3 rounded-full mr-2" 
                                          style={{ 
                                            backgroundColor: result.dominantColor.toLowerCase(),
                                            boxShadow: `0 0 5px ${result.dominantColor.toLowerCase()}80` 
                                          }}
                                        ></span>
                                        Etheric Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("etheric", result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                        <span 
                                          className="inline-block w-3 h-3 rounded-full mr-2" 
                                          style={{ 
                                            backgroundColor: result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase(),
                                            boxShadow: `0 0 5px ${result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase()}80` 
                                          }}
                                        ></span>
                                        Emotional Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("emotional", result.secondaryColor || result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                        <span 
                                          className="inline-block w-3 h-3 rounded-full mr-2" 
                                          style={{ 
                                            backgroundColor: result.dominantColor.toLowerCase(),
                                            boxShadow: `0 0 5px ${result.dominantColor.toLowerCase()}80` 
                                          }}
                                        ></span>
                                        Mental Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("mental", result.dominantColor)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                      <h5 className="text-sm font-medium mb-1 flex items-center">
                                        <span 
                                          className="inline-block w-3 h-3 rounded-full mr-2" 
                                          style={{ 
                                            backgroundColor: result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase(),
                                            boxShadow: `0 0 5px ${result.secondaryColor?.toLowerCase() || result.dominantColor.toLowerCase()}80` 
                                          }}
                                        ></span>
                                        Spiritual Layer
                                      </h5>
                                      <p className="text-xs text-gray-600">
                                        {getAuraLayerAnalysis("spiritual", result.secondaryColor || result.dominantColor)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Energy Flow Analysis</h4>
                                  <div className="p-3 bg-white rounded-lg shadow-sm mb-4">
                                    <div className="flex items-center mb-2">
                                      <div className="relative w-20 h-20 mr-4 flex-shrink-0">
                                        <div 
                                          className="absolute inset-0 rounded-full animate-ping" 
                                          style={{
                                            background: `radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)`,
                                            animation: `ping ${7 - result.energyLevel}s cubic-bezier(0, 0, 0.2, 1) infinite`
                                          }}
                                        ></div>
                                        <div className="absolute inset-0 rounded-full flex items-center justify-center">
                                          <div 
                                            className="w-12 h-12 rounded-full" 
                                            style={{
                                              background: `conic-gradient(${getAccurateColorCode(result.dominantColor)} ${result.energyLevel * 36}deg, transparent 0deg)`,
                                              boxShadow: `0 0 15px ${getAccurateColorCode(result.dominantColor)}60`
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium">Energy Intensity: <span className="font-bold">{auraHelpers.getEnergyLevelText(result.energyLevel)}</span></div>
                                        <p className="text-xs text-gray-600 mt-1">
                                          {auraHelpers.getEnergyAdvice(result.energyLevel, result.dominantColor)}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-700 mt-2">
                                      <strong>Energy Cycles:</strong> Your aura indicates a {auraHelpers.getEnergyCycle(result.energyLevel, result.dominantColor)} energy cycle currently. 
                                      Pay attention to how your energy fluctuates throughout the day and week.
                                    </div>
                                  </div>
                                  
                                  <h4 className="font-medium text-sm text-secondary mb-2">Personality Integration</h4>
                                  <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-700 mb-2">
                                      Your aura field reveals these dominant traits that combine to form your unique spiritual signature:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {result.personalityTraits.map((trait, index) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded-md text-sm border border-gray-100">
                                          <span className="font-medium block">{trait}</span>
                                          <span className="text-xs text-gray-600 block">{getTraitExplanation(trait, result.dominantColor)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Demo mode - showing premium features without upgrade */}
                              <div className="flex justify-center mt-4">
                                <div className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 border border-green-200">
                                  <span className="mr-1.5">✓</span> Premium Analysis Demo Mode Active
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* 5-Star Review System */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 mt-8">
                          {reviewSubmitted ? (
                            <div className="text-center py-4">
                              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                              </div>
                              <h4 className="font-semibold text-lg text-green-800 mb-2">Review Submitted!</h4>
                              <p className="text-green-700">Thank you for your feedback. Your review helps us improve our aura analysis experience.</p>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-semibold text-lg mb-4 flex items-center">
                                <Star className="w-5 h-5 mr-2 text-amber-500" />
                                Rate Your Aura Analysis Experience
                              </h4>
                              
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-700 mb-3">How accurate and helpful was your aura reading?</p>
                                  <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`w-8 h-8 rounded-full transition-all duration-200 ${
                                          star <= rating 
                                            ? 'text-amber-500 scale-110' 
                                            : 'text-gray-300 hover:text-amber-400'
                                        }`}
                                      >
                                        <Star className="w-full h-full fill-current" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Share your thoughts (optional)
                                  </label>
                                  <Textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Tell us about your experience with this aura analysis..."
                                    className="min-h-[80px] resize-none"
                                  />
                                </div>
                                
                                <div className="flex justify-end space-x-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setRating(0);
                                      setReviewText("");
                                    }}
                                  >
                                    Clear
                                  </Button>
                                  <Button
                                    onClick={submitReview}
                                    disabled={rating === 0 || isSubmittingReview}
                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                    size="sm"
                                  >
                                    {isSubmittingReview ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Submit Review
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-96 flex items-center justify-center bg-white/50 border-dashed border-2">
                      <div className="text-center p-6">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 opacity-30`}></div>
                        <p className="text-gray-600">Upload your photo to see your aura analysis</p>
                        <p className="text-gray-500 text-sm mt-2">Your reading will be private and secure</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Aura Color Guide Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-8 text-center">Aura Color Guide</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-purple-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-purple-700">Purple Aura</h3>
                  <p className="text-gray-600">
                    Indicates spiritual awareness, wisdom and intuition. People with purple auras often have psychic abilities and a strong connection to higher consciousness.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-blue-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-blue-700">Blue Aura</h3>
                  <p className="text-gray-600">
                    Represents calm communication, truth, and self-expression. People with blue auras are often peaceful, trustworthy and have strong intuitive abilities.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-green-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-green-700">Green Aura</h3>
                  <p className="text-gray-600">
                    Symbolizes healing, growth and balance. Those with green auras often have a natural ability to heal others and foster growth in all areas of life.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-yellow-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-yellow-700">Yellow Aura</h3>
                  <p className="text-gray-600">
                    Reflects joy, intellect and optimism. People with yellow auras tend to be analytical, playful, and have an energetic approach to life challenges.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-orange-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-orange-700">Orange Aura</h3>
                  <p className="text-gray-600">
                    Indicates creativity, courage and enthusiasm. Those with orange auras are often adventurous, expressive and have a strong sense of personal power.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-3 bg-red-500"></div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-red-700">Red Aura</h3>
                  <p className="text-gray-600">
                    Represents passion, energy and strong will. People with red auras are often action-oriented, bold and have powerful physical energy reserves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Advanced Features Section */}
        <section className="py-16 bg-gradient-to-br from-primary-dark/5 to-secondary-dark/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">Complete Aura Analysis Features</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Explore the full range of our aura analysis capabilities.
                </p>
              </div>
              
              <div className="my-6 grid md:grid-cols-1 gap-6">
                <Card className="relative overflow-hidden border-2 border-primary/20">
                  <div className="absolute top-0 right-0 bg-green-100 px-3 py-1 rounded-bl-md">
                    <span className="text-sm font-medium text-green-800">All Features Included</span>
                  </div>
                  <CardHeader>
                    <CardTitle>Complete Aura Analysis</CardTitle>
                    <CardDescription>Discover the colors and energy patterns of your aura with our comprehensive analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">Includes:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Basic aura color identification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Primary personality traits</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Energy level assessment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Basic chakra activity visualization</span>
                        </li>
                      </ul>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Advanced multi-layer aura color analysis</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Detailed chakra balancing recommendations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Personalized spiritual practice suggestions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>Temporal aura pattern tracking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>30-day aura energy forecast</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Healers Connection Section */}
        {result && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="relative mb-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">CONNECT WITH HEALERS</span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4 text-center">Recommended Healers</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto text-center">
                    Based on your aura reading, these certified healers specialize in working with your energy signature and can help guide your spiritual journey.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Healer 1 */}
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="h-40 bg-gradient-to-br from-purple-200 to-indigo-100 relative">
                      <div className="absolute inset-0 bg-center bg-cover opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80')" }}></div>
                      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        <span className="font-medium">Specializes in:</span> Energy Balancing
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg">Sarah Johnson</h3>
                      <p className="text-sm text-gray-600 mb-2">Reiki Master & Spiritual Coach</p>
                      <div className="flex items-center text-amber-500 mb-4">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <span className="ml-1 text-xs">(48 reviews)</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">$85 / session</span>
                        <Button size="sm" variant="outline">View Profile</Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Healer 2 */}
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="h-40 bg-gradient-to-br from-blue-200 to-indigo-100 relative">
                      <div className="absolute inset-0 bg-center bg-cover opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541576980233-97577392db9a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80')" }}></div>
                      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        <span className="font-medium">Specializes in:</span> Chakra Alignment
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg">Michael Chen</h3>
                      <p className="text-sm text-gray-600 mb-2">Energy Healer & Meditation Guide</p>
                      <div className="flex items-center text-amber-500 mb-4">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <span className="ml-1 text-xs">(36 reviews)</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">$75 / session</span>
                        <Button size="sm" variant="outline">View Profile</Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Healer 3 */}
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="h-40 bg-gradient-to-br from-amber-200 to-orange-100 relative">
                      <div className="absolute inset-0 bg-center bg-cover opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=922&q=80')" }}></div>
                      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        <span className="font-medium">Specializes in:</span> Aura Cleansing
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg">Jessica Rivera</h3>
                      <p className="text-sm text-gray-600 mb-2">Spiritual Mentor & Intuitive Guide</p>
                      <div className="flex items-center text-amber-500 mb-4">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <span className="ml-1 text-xs">(52 reviews)</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">$95 / session</span>
                        <Button size="sm" variant="outline">View Profile</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button>
                    View All Healers
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    All healers on our platform are certified and have undergone background checks
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}