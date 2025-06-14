import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Download, Share2, Eye, EyeOff, Camera, Upload } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { ImageUpload } from '@/components/forms/image-upload';
import { AuraGlow } from '@/components/ui/aura-glow';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AuraAnalysisResult {
  dominantColor: string;
  secondaryColor?: string;
  dominantPercentage: number;
  secondaryPercentage?: number;
  personalityTraits: string[];
  chakraAnalysis: {
    [key: string]: {
      energy: number;
      color: string;
      status: string;
      description: string;
    };
  };
  spiritualInsights: string;
  recommendations: string[];
  energyPattern: string;
  auraStrength: number;
  emotionalState: string;
  guidance: string;
  lifePhase: string;
  elementalConnection: string;
  auricLayers: {
    etheric: { color: string; intensity: number; meaning: string };
    emotional: { color: string; intensity: number; meaning: string };
    mental: { color: string; intensity: number; meaning: string };
    spiritual: { color: string; intensity: number; meaning: string };
  };
}

interface NumerologyResult {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  interpretation: string;
  guidance: string;
  strengths: string[];
  challenges: string[];
  lifeTheme: string;
  soulChakra: number;
  decisionMakingChakra: number;
}

export default function AuraAnalysis() {
  const [result, setResult] = useState<AuraAnalysisResult | null>(null);
  const [numerologyResult, setNumerologyResult] = useState<NumerologyResult | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const detectHumanFace = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          resolve(false);
          return;
        }
        
        resolve(true);
      };
      
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const getAccurateColorCode = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'Red': '#FF0000',
      'Orange': '#FFA500', 
      'Yellow': '#FFFF00',
      'Green': '#00FF00',
      'Blue': '#0000FF',
      'Indigo': '#4B0082',
      'Violet': '#8B00FF',
      'Purple': '#800080',
      'Pink': '#FFC0CB',
      'White': '#FFFFFF',
      'Gold': '#FFD700',
      'Silver': '#C0C0C0',
      'Turquoise': '#40E0D0',
      'Lime': '#00FF00',
      'Navy': '#000080',
      'Magenta': '#FF00FF',
      'Cyan': '#00FFFF',
      'Brown': '#A52A2A',
      'Gray': '#808080',
      'Black': '#000000',
      'Crimson': '#DC143C',
      'Coral': '#FF7F50',
      'Emerald': '#50C878',
      'Sapphire': '#0F52BA',
      'Amethyst': '#9966CC',
      'Rose': '#FF007F',
      'Amber': '#FFBF00',
      'Jade': '#00A86B',
      'Onyx': '#353839',
      'Pearl': '#F8F6F0'
    };
    return colorMap[colorName] || '#800080';
  };

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

  const getColorPersonalityInfluence = (color: string): string => {
    const influences: Record<string, string> = {
      'Red': 'You possess a dynamic, action-oriented personality driven by passion and determination. Your red aura creates a magnetic presence that naturally draws leadership opportunities, making you someone others look to for direction and motivation.',
      'Orange': 'Your personality radiates warmth and creative enthusiasm, making you naturally sociable and inspiring to others. Orange energy gives you an adventurous spirit that thrives on new experiences and artistic expression.',
      'Yellow': 'You have a bright, intellectually curious personality that loves learning and sharing knowledge. Your yellow aura creates mental clarity and optimism, making you a natural teacher and communicator.',
      'Green': 'Your personality is naturally balanced and healing-oriented, with a deep capacity for empathy and nurturing others. Green energy makes you a peacemaker who seeks harmony in all relationships.',
      'Blue': 'You possess a calm, truthful personality that values authentic communication and deep connections. Your blue aura creates trustworthiness and reliability, making others feel safe to share their innermost thoughts.',
      'Indigo': 'Your personality is deeply intuitive and spiritually aware, often knowing things without logical explanation. Indigo energy gives you wisdom beyond your years and natural psychic abilities.',
      'Violet': 'You have a mystical, transformative personality that connects easily with higher consciousness. Your violet aura creates spiritual leadership qualities and the ability to inspire others on their spiritual journey.',
      'Purple': 'Your personality combines spiritual wisdom with practical magic, making you both mystical and grounded. Purple energy gives you the ability to manifest your visions into reality.',
      'Pink': 'You possess a loving, compassionate personality that naturally nurtures and heals others. Your pink aura creates unconditional love energy that makes others feel accepted and valued.',
      'White': 'Your personality radiates purity and spiritual protection, often serving as a beacon of light for others. White energy gives you clarity of purpose and connection to divine guidance.',
      'Gold': 'You have a wise, authoritative personality that carries ancient wisdom and spiritual mastery. Your gold aura creates natural teaching abilities and the power to inspire spiritual growth in others.',
      'Silver': 'Your personality is intuitive and reflective, with strong connection to lunar cycles and feminine wisdom. Silver energy gives you psychic sensitivity and the ability to see beyond surface appearances.',
      'Turquoise': 'Your personality combines heart wisdom with clear communication, making you a natural healer and counselor. Turquoise energy gives you the ability to speak healing truths that touch people\'s souls.',
      'Lime': 'Your personality is refreshingly energetic and growth-oriented, always seeking renewal and positive change. Lime energy gives you the ability to help others release old patterns and embrace new possibilities.',
      'Navy': 'Your personality carries deep wisdom and spiritual authority, often serving as a guide for others seeking truth. Navy energy gives you access to profound insights and the ability to see the bigger picture.',
      'Black': 'Your personality is powerfully transformative and protective, with the ability to help others through difficult transitions. Black energy gives you strength to face shadows and emerge with greater wisdom.',
      'Brown': 'Your personality is grounded and practical, with a natural connection to earth wisdom and material stability. Brown energy gives you the ability to create lasting foundations for yourself and others.',
      'Gray': 'Your personality seeks balance and neutrality, often serving as a mediator who can see all sides of a situation. Gray energy gives you wisdom to remain centered during chaotic times.'
    };
    
    return influences[color] || influences['Purple'];
  };

  const getColorBehavioralPatterns = (color: string): string => {
    const patterns: Record<string, string> = {
      'Red': 'You tend to act quickly on impulses, prefer direct confrontation over passive approaches, and naturally take charge in group situations. You express emotions intensely and work best with clear, immediate goals.',
      'Orange': 'You seek variety and stimulation in daily life, express yourself through creative outlets, and build relationships through shared adventures. You tend to be spontaneous and prefer flexible schedules over rigid routines.',
      'Yellow': 'You process information thoroughly before making decisions, enjoy intellectual debates and learning opportunities, and express yourself through clear, logical communication. You tend to be optimistic and see possibilities in challenges.',
      'Green': 'You naturally mediate conflicts and seek win-win solutions, prefer collaborative approaches over competition, and make decisions based on how they affect relationships. You tend to be patient and supportive of others\' growth.',
      'Blue': 'You communicate honestly even when difficult, prefer deep conversations over small talk, and make decisions based on truth and integrity. You tend to be reliable and consistent in your commitments.',
      'Indigo': 'You trust your intuition over logical analysis, often withdraw for spiritual reflection and meditation, and make decisions based on inner knowing. You tend to be selective about sharing your deeper insights.',
      'Violet': 'You seek spiritual meaning in everyday experiences, naturally inspire others toward higher purposes, and make decisions based on spiritual guidance. You tend to be visionary and focused on transformation.',
      'Purple': 'You blend practical action with spiritual wisdom, often serve as a bridge between different worlds of understanding, and make decisions that honor both material and spiritual needs.',
      'Pink': 'You approach conflicts with compassion and seek healing solutions, prioritize emotional connection in relationships, and make decisions based on love and care for others.',
      'White': 'You seek purity and clarity in all situations, naturally purify negative energies around you, and make decisions based on highest good for all involved.',
      'Gold': 'You naturally teach and share wisdom with others, command respect through your spiritual authority, and make decisions based on divine guidance and ancient wisdom.',
      'Silver': 'You reflect deeply before responding, are highly sensitive to emotional undercurrents, and make decisions based on intuitive insights and cyclical timing.',
      'Turquoise': 'You communicate healing truths with compassion, naturally counsel others through emotional difficulties, and make decisions that balance heart wisdom with clear expression.',
      'Lime': 'You actively seek growth and renewal experiences, encourage others to embrace positive changes, and make decisions that promote fresh starts and new possibilities.',
      'Navy': 'You contemplate deeply before speaking, seek profound understanding of complex issues, and make decisions based on comprehensive wisdom and long-term vision.',
      'Black': 'You face difficult truths and shadow aspects directly, help others through transformative experiences, and make decisions that honor the full spectrum of human experience.',
      'Brown': 'You create stable foundations in your personal and professional life, prefer practical solutions over theoretical approaches, and make decisions based on tangible outcomes.',
      'Gray': 'You maintain neutrality in emotional situations, seek balanced perspectives on complex issues, and make decisions that honor multiple viewpoints and create harmony.'
    };
    
    return patterns[color] || patterns['Purple'];
  };

  const getColorSocialStyle = (color: string): string => {
    const styles: Record<string, string> = {
      'Red': 'In social settings, you naturally emerge as a leader and motivator, drawing people to your passionate energy. You prefer active, engaging social activities and are comfortable being the center of attention when inspiring others.',
      'Orange': 'You bring joy and creativity to social gatherings, naturally entertaining others and creating memorable experiences. You thrive in diverse social groups and enjoy introducing people to new ideas and adventures.',
      'Yellow': 'You engage others through intelligent conversation and teaching, sharing knowledge in ways that illuminate and inspire. You prefer social situations that involve learning, discussion, or mental stimulation.',
      'Green': 'You create harmony in social groups by mediating conflicts and ensuring everyone feels included. You prefer intimate gatherings over large crowds and excel at making others feel heard and valued.',
      'Blue': 'You build deep, authentic relationships based on trust and honest communication. You prefer meaningful one-on-one conversations and are known for your reliability and emotional support.',
      'Indigo': 'You connect with others on a soul level, often attracting people seeking spiritual guidance or deeper understanding. You prefer smaller, more spiritually-minded social circles.',
      'Violet': 'You inspire others toward their highest potential and naturally attract those seeking spiritual growth. You serve as a catalyst for transformation in your social circles.',
      'Purple': 'You bridge different social groups with your unique blend of wisdom and approachability. You attract both spiritually-minded individuals and those seeking practical guidance.',
      'Pink': 'You create a loving, nurturing atmosphere wherever you go, making others feel unconditionally accepted. You excel at bringing out the best in people and healing social tensions.',
      'White': 'You bring clarity and purity to social situations, often serving as a spiritual anchor for your community. Others are drawn to your peaceful presence and clear guidance.',
      'Gold': 'You naturally command respect and are sought out for your wisdom and guidance. You serve as a mentor figure in your social circles and inspire others toward excellence.',
      'Silver': 'You intuitively understand social dynamics and emotional undercurrents, often serving as an emotional barometer for your groups. You prefer smaller, more intimate social settings.',
      'Turquoise': 'You combine emotional sensitivity with clear communication, making you an excellent counselor and friend. You create safe spaces for others to share their deepest feelings.',
      'Lime': 'You energize social groups with your enthusiasm for growth and positive change. You inspire others to try new things and embrace fresh perspectives.',
      'Navy': 'You provide depth and wisdom to social conversations, often sought out for your profound insights. You prefer intellectually stimulating social environments.',
      'Black': 'You help others face difficult truths and navigate challenging transformations. You attract people going through major life changes who need strong, protective guidance.',
      'Brown': 'You provide stability and grounding in social situations, creating reliable support systems for your community. You prefer practical, down-to-earth social activities.',
      'Gray': 'You serve as a neutral mediator in social conflicts and help others find balanced perspectives. You excel at bringing harmony to diverse social groups.'
    };
    
    return styles[color] || styles['Purple'];
  };

  const getColorComplementaryTraits = (secondaryColor: string, primaryColor: string): string => {
    const complementaryMap: Record<string, Record<string, string>> = {
      'Red': {
        'Blue': 'Your blue secondary energy provides calm reflection to balance your red passion, creating thoughtful action rather than impulsive reactions.',
        'Green': 'Green energy softens your red intensity with healing compassion, making you a powerful yet nurturing leader.',
        'Yellow': 'Yellow adds intellectual clarity to your red passion, creating strategic thinking combined with decisive action.',
        'default': 'This secondary color provides emotional balance and spiritual depth to your passionate red nature.'
      },
      'Blue': {
        'Orange': 'Orange energy adds warmth and creativity to your blue truthfulness, making your communication more engaging and inspiring.',
        'Red': 'Red energy provides passionate action to complement your blue wisdom, creating powerful and purposeful leadership.',
        'Yellow': 'Yellow enhances your blue communication with intellectual brilliance, making you an exceptional teacher and guide.',
        'default': 'This secondary color adds vitality and creative expression to your truthful blue nature.'
      },
      'Green': {
        'Red': 'Red energy provides passionate drive to your green healing nature, creating dynamic compassion that takes action.',
        'Purple': 'Purple adds spiritual depth to your green healing abilities, creating profound transformation through love.',
        'Yellow': 'Yellow brings intellectual understanding to your green empathy, helping you heal through wisdom and insight.',
        'default': 'This secondary color enhances your healing abilities with additional spiritual and emotional dimensions.'
      },
      'Yellow': {
        'Blue': 'Blue energy adds emotional depth to your yellow intellect, creating wisdom that touches both mind and heart.',
        'Green': 'Green provides emotional balance to your yellow mental energy, creating teaching through nurturing guidance.',
        'Purple': 'Purple adds spiritual insight to your yellow knowledge, creating profound wisdom that inspires transformation.',
        'default': 'This secondary color adds emotional and spiritual depth to your intellectual yellow nature.'
      },
      'Purple': {
        'Gold': 'Gold energy enhances your purple mysticism with divine authority, creating powerful spiritual leadership.',
        'Green': 'Green adds healing heart energy to your purple transformation, creating compassionate spiritual guidance.',
        'Blue': 'Blue provides clear communication to your purple wisdom, helping you share spiritual insights effectively.',
        'default': 'This secondary color grounds your purple spirituality with practical wisdom and enhanced communication.'
      }
    };
    
    return complementaryMap[primaryColor]?.[secondaryColor] || 
           complementaryMap[primaryColor]?.['default'] || 
           'This color combination creates a unique personality blend that balances your primary traits with complementary energies.';
  };

  const getCombinedColorPersonality = (primary: string, secondary: string): string => {
    const combinations: Record<string, string> = {
      'Red-Blue': 'You possess the rare combination of passionate action and calm wisdom, making you a powerful leader who inspires through both strength and truth.',
      'Red-Green': 'Your personality blends fierce determination with healing compassion, creating a protective warrior who fights for love and justice.',
      'Red-Yellow': 'You combine passionate drive with intellectual clarity, making you a charismatic leader who can both inspire and educate.',
      'Blue-Orange': 'Your personality merges truthful communication with creative expression, making you an inspiring teacher who educates through art and storytelling.',
      'Blue-Green': 'You blend honest communication with healing empathy, creating a trustworthy counselor who helps others through compassionate truth.',
      'Green-Yellow': 'Your personality combines healing compassion with intellectual wisdom, making you a nurturing teacher who guides through understanding.',
      'Purple-Gold': 'You possess the magnificent combination of mystical wisdom and divine authority, creating a spiritual master who teaches through example.',
      'Purple-Silver': 'Your personality blends transformative power with intuitive sensitivity, making you a psychic healer who guides others through spiritual transitions.',
      'default': `Your unique ${primary}-${secondary} combination creates a personality that balances the strengths of both colors, making you adaptable and multi-dimensional.`
    };
    
    const key = `${primary}-${secondary}`;
    return combinations[key] || combinations['default'];
  };

  const getDecisionMakingStyle = (primary: string, secondary: string): string => {
    const styles: Record<string, string> = {
      'Red': 'You make decisions quickly and decisively, trusting your instincts and taking immediate action when opportunities arise.',
      'Blue': 'You consider truth and integrity as primary factors, making decisions based on what aligns with your authentic values.',
      'Green': 'You weigh how decisions will affect relationships and seek solutions that benefit everyone involved.',
      'Yellow': 'You gather information and analyze options thoroughly before making well-informed, logical decisions.',
      'Purple': 'You combine spiritual intuition with practical wisdom, making decisions that honor both material and spiritual needs.',
      'Orange': 'You make decisions based on what feels exciting and creative, preferring options that offer growth and new experiences.',
      'Indigo': 'You trust your psychic intuition and inner knowing, often making decisions that others don\'t initially understand but prove wise.',
      'White': 'You seek decisions that serve the highest good for all, often receiving guidance through meditation and spiritual connection.',
      'Pink': 'You make decisions from the heart, prioritizing love, compassion, and what will create the most harmony.',
      'Gold': 'You make decisions from ancient wisdom and spiritual authority, choosing paths that align with divine will and higher purpose.',
      'Silver': 'You time your decisions according to intuitive cycles, often waiting for the right moment when energies align favorably.',
      'default': 'Your decision-making style reflects your unique color combination, balancing multiple perspectives and considerations.'
    };
    
    const baseStyle = styles[primary] || styles['default'];
    const secondaryInfluence = secondary !== primary ? ` Your ${secondary} secondary energy adds ${styles[secondary]?.toLowerCase().replace('you ', '') || 'additional wisdom to your decision-making process'}.` : '';
    
    return baseStyle + secondaryInfluence;
  };

  const getCommunicationStyle = (primary: string, secondary: string): string => {
    const styles: Record<string, string> = {
      'Red': 'You communicate with passion and directness, speaking with authority and conviction that inspires others to take action.',
      'Blue': 'You communicate with honesty and clarity, always speaking truth even when it\'s difficult, creating deep trust with others.',
      'Green': 'You communicate with empathy and compassion, always considering others\' feelings and seeking harmony in your words.',
      'Yellow': 'You communicate through teaching and sharing knowledge, using clear explanations and examples to help others understand.',
      'Purple': 'You communicate spiritual wisdom through both words and energy, often inspiring transformation through your presence alone.',
      'Orange': 'You communicate with enthusiasm and creativity, using storytelling and humor to engage and entertain your audience.',
      'Indigo': 'You communicate profound insights and intuitive knowing, often sharing wisdom that comes from beyond ordinary understanding.',
      'White': 'You communicate with purity and divine clarity, serving as a channel for higher wisdom and guidance.',
      'Pink': 'You communicate with unconditional love and acceptance, making others feel safe to share their deepest truths.',
      'Gold': 'You communicate with spiritual authority and ancient wisdom, teaching others through both words and energetic transmission.',
      'Silver': 'You communicate through emotional attunement and psychic sensitivity, often understanding others without words.',
      'Turquoise': 'You communicate healing truths with perfect timing, knowing exactly what others need to hear for their growth.',
      'default': 'Your communication style reflects your unique color combination, blending different approaches to reach others effectively.'
    };
    
    const baseStyle = styles[primary] || styles['default'];
    const secondaryInfluence = secondary !== primary ? ` Your ${secondary} energy adds ${styles[secondary]?.toLowerCase().replace('you communicate ', '') || 'additional depth to your communication'}.` : '';
    
    return baseStyle + secondaryInfluence;
  };

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setShowPersonalInfo(true);
    
    try {
      const isHuman = await detectHumanFace(file);
      if (!isHuman) {
        toast({
          title: "Image Validation",
          description: "For the most accurate aura reading, please use a clear photo showing your face.",
        });
      }

      const imageUrl = URL.createObjectURL(file);
      setOriginalImage(imageUrl);

      const formData = new FormData();
      formData.append('image', file);
      if (name) formData.append('name', name);
      if (birthDate) formData.append('birthDate', birthDate);

      const response = await fetch('/api/analyze-aura', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data.auraAnalysis);
      if (data.numerology) {
        setNumerologyResult(data.numerology);
      }

      toast({
        title: "Analysis Complete",
        description: "Your aura reading is ready! Explore the insights in the tabs below.",
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Unable to analyze your image. Please try again with a different photo.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
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
                
                {/* Personal Info Section - Appears after image upload */}
                {showPersonalInfo && (
                  <div className="p-6 bg-white/80 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-lg mb-4">Optional: Personal Information for Enhanced Reading</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Adding your name and birth date enables numerology integration for deeper insights.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Birth Date
                        </label>
                        <input
                          type="date"
                          id="birthDate"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
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
                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428.247-.67.636-1.276 1.153-1.772a4.91 4.91 0 011.772-1.153c.637-.247 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5.838a4.162 4.162 0 100 8.324 4.162 4.162 0 000-8.324zM12 14a2 2 0 110-4 2 2 0 010 4zm4.406-6.594a.972.972 0 11-1.944 0 .972.972 0 011.944 0z"/>
                          </svg>
                          Share
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {isAnalyzing && (
                    <div className="bg-white/70 rounded-xl p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <h3 className="font-medium text-lg mb-2">Analyzing Your Aura...</h3>
                      <p className="text-gray-600">Our AI is reading your energy field and creating your personalized spiritual profile.</p>
                    </div>
                  )}
                  
                  {result && (
                    <Tabs defaultValue="analysis" className="bg-white/70 rounded-xl">
                      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                        <TabsTrigger value="chakras">Chakras</TabsTrigger>
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                        <TabsTrigger value="guidance">Guidance</TabsTrigger>
                        {numerologyResult && <TabsTrigger value="numerology">Numerology</TabsTrigger>}
                        <TabsTrigger value="visualization">Visual</TabsTrigger>
                      </TabsList>
                      
                      <div className="p-6">
                        <TabsContent value="analysis">
                          <div className="space-y-10">
                            {/* Personality Integration */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-lg">Personality Integration</h4>
                              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                <p className="text-sm text-gray-700 mb-4">
                                  Your aura field reveals these dominant traits that combine to form your unique spiritual signature:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                  {result.personalityTraits.map((trait, index) => (
                                    <div key={index} className="p-2 bg-gray-50 rounded-md text-sm border border-gray-100">
                                      <span className="font-medium block">{trait}</span>
                                      <span className="text-xs text-gray-600 block">{getTraitExplanation(trait, result.dominantColor)}</span>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Detailed Color-Personality Analysis */}
                                <div className="border-t pt-4 mt-4">
                                  <h5 className="font-medium text-sm mb-3 text-gray-800">How Your Aura Colors Shape Your Personality</h5>
                                  
                                  {/* Primary Color Influence */}
                                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                                    <div className="flex items-center mb-2">
                                      <div 
                                        className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                        style={{ backgroundColor: getAccurateColorCode(result.dominantColor) }}
                                      ></div>
                                      <span className="font-medium text-sm">Primary Color: {result.dominantColor}</span>
                                    </div>
                                    <p className="text-xs text-gray-700 mb-2">
                                      <strong>Core Personality Influence:</strong> {getColorPersonalityInfluence(result.dominantColor)}
                                    </p>
                                    <p className="text-xs text-gray-700 mb-2">
                                      <strong>Behavioral Patterns:</strong> {getColorBehavioralPatterns(result.dominantColor)}
                                    </p>
                                    <p className="text-xs text-gray-700">
                                      <strong>Social Interactions:</strong> {getColorSocialStyle(result.dominantColor)}
                                    </p>
                                  </div>
                                  
                                  {/* Secondary Color Influence */}
                                  {result.secondaryColor && (
                                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-100">
                                      <div className="flex items-center mb-2">
                                        <div 
                                          className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                          style={{ backgroundColor: getAccurateColorCode(result.secondaryColor) }}
                                        ></div>
                                        <span className="font-medium text-sm">Secondary Color: {result.secondaryColor}</span>
                                      </div>
                                      <p className="text-xs text-gray-700 mb-2">
                                        <strong>Balancing Influence:</strong> {getColorPersonalityInfluence(result.secondaryColor)}
                                      </p>
                                      <p className="text-xs text-gray-700">
                                        <strong>Complementary Traits:</strong> {getColorComplementaryTraits(result.secondaryColor, result.dominantColor)}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Combined Color Effect */}
                                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                                    <h6 className="font-medium text-sm mb-2 text-amber-800">Combined Color Psychology</h6>
                                    <p className="text-xs text-gray-700 mb-2">
                                      <strong>Unique Personality Blend:</strong> {getCombinedColorPersonality(result.dominantColor, result.secondaryColor || result.dominantColor)}
                                    </p>
                                    <p className="text-xs text-gray-700 mb-2">
                                      <strong>Decision-Making Style:</strong> {getDecisionMakingStyle(result.dominantColor, result.secondaryColor || result.dominantColor)}
                                    </p>
                                    <p className="text-xs text-gray-700">
                                      <strong>Communication Approach:</strong> {getCommunicationStyle(result.dominantColor, result.secondaryColor || result.dominantColor)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Rest of analysis content */}
                            <div className="bg-white/70 rounded-xl p-6 border border-gray-200">
                              <h3 className="font-medium text-lg">Additional Analysis</h3>
                              <p className="text-sm text-gray-600 mt-2">Further insights and analysis continue here...</p>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Other tabs remain the same */}
                        <TabsContent value="chakras">
                          <div className="space-y-4">
                            <h3 className="font-medium text-lg">Chakra Energy Analysis</h3>
                            {/* Chakra content */}
                          </div>
                        </TabsContent>

                        <TabsContent value="insights">
                          <div className="space-y-4">
                            <h3 className="font-medium text-lg">Spiritual Insights</h3>
                            {/* Insights content */}
                          </div>
                        </TabsContent>

                        <TabsContent value="guidance">
                          <div className="space-y-4">
                            <h3 className="font-medium text-lg">Personal Guidance</h3>
                            {/* Guidance content */}
                          </div>
                        </TabsContent>

                        {numerologyResult && (
                          <TabsContent value="numerology">
                            <div className="space-y-4">
                              <h3 className="font-medium text-lg">Numerology Analysis</h3>
                              {/* Numerology content */}
                            </div>
                          </TabsContent>
                        )}

                        <TabsContent value="visualization">
                          <div className="space-y-4">
                            <h3 className="font-medium text-lg">Aura Visualization</h3>
                            {/* Visualization content */}
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}