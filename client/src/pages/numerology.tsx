import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useBadgeContext } from "@/hooks/use-badge-context";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calculator, Sparkles, Save, Download, FileText, Crown } from "lucide-react";
import { calculateNumerology, NumerologyResult } from "@/lib/openai";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import V2010 from "twilio/lib/rest/api/V2010";

const numerologySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  birthDate: z.string().min(1, "Birth date is required"),
});

type NumerologyFormData = z.infer<typeof numerologySchema>;

// Monthly remedies based on numerological numbers (from Fortune Reader remedies PDF)
const getMonthlyRemedy = (number: number) => {
  const remedies = {
    1: {
      color: "Yellow (Solar Plexus)",
      mantra: "RAM (45 times/day)",
      crystal: "Citrine, Tiger's Eye",
      sacredCode: "451 (45 times/day)"
    },
    2: {
      color: "Green/Pink (Heart)",
      mantra: "YAM (45 times/day)",
      crystal: "Rose Quartz, Green Aventurine",
      sacredCode: "741 (45 times/day)"
    },
    3: {
      color: "Violet/White (Crown)",
      mantra: "AUM (45 times/day)",
      crystal: "Clear Quartz, Selenite",
      sacredCode: "204 (45 times/day)"
    },
    4: {
      color: "Brown/Black (Earth Star)",
      mantra: "LAM (45 times/day)",
      crystal: "Smoky Quartz, Hematite",
      sacredCode: "264 (45 times/day)"
    },
    5: {
      color: "Blue (Throat)",
      mantra: "HAM (45 times/day)",
      crystal: "Blue Lace Agate, Lapis Lazuli",
      sacredCode: "986 (45 times/day)"
    },
    6: {
      color: "Orange (Sacral)",
      mantra: "VAM (45 times/day)",
      crystal: "Carnelian, Moonstone",
      sacredCode: "760 (45 times/day)"
    },
    7: {
      color: "Gold/White (Soul Star)",
      mantra: "OM SO HUM (45 times/day)",
      crystal: "Selenite, Angelite",
      sacredCode: "56 (45 times/day)"
    },
    8: {
      color: "Indigo (Third Eye)",
      mantra: "OM (45 times/day)",
      crystal: "Amethyst, Fluorite",
      sacredCode: "505 (45 times/day)"
    },
    9: {
      color: "Red (Root)",
      mantra: "LAM (45 times/day)",
      crystal: "Red Jasper, Black Tourmaline",
      sacredCode: "996 (45 times/day)"
    }
  };
  
  return remedies[number as keyof typeof remedies] || remedies[1];
};

// Parse URL params synchronously to avoid race condition
const getInitialHealerData = () => {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  const healerName = urlParams.get('healerName');
  const healerBirthDate = urlParams.get('healerBirthDate');
  const fromHealer = urlParams.get('fromHealer');
  
  if (healerName && healerBirthDate && fromHealer === 'true') {
    return {
      name: healerName,
      birthDate: healerBirthDate,
      fromHealer: true
    };
  }
  return null;
};

export default function NumerologyPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { checkBadges, showBadges } = useBadgeContext();
  const [healerNotes, setHealerNotes] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Initialize healer data synchronously from URL params (no race condition)
  const [healerData, setHealerData] = useState<any>(getInitialHealerData);

  // Use healer data if available, otherwise use user data
  const targetName = healerData?.name || user?.username || "";
  const targetBirthDate = healerData?.birthDate || user?.birthDate || "";

  const form = useForm<NumerologyFormData>({
    resolver: zodResolver(numerologySchema),
    defaultValues: {
      name: targetName,
      birthDate: targetBirthDate,
    },
  });

  // Update form when target data changes
  useEffect(() => {
    form.reset({
      name: targetName,
      birthDate: targetBirthDate,
    });
  }, [targetName, targetBirthDate, form]);

  // Check if user has numerology readings
  const { data: numerologyReadings = [] } = useQuery({
    queryKey: ["/api/numerology-readings"],
    enabled: !!user && user.userType === "client",
  });

  // Get numerology analysis - use healer data if available
  const {
    data: numerology,
    isLoading: isLoadingNumerology,
    error: numerologyError,
    refetch: refetchNumerology
  } = useQuery<NumerologyResult>({
    queryKey: ["/api/numerology", targetName, targetBirthDate],
    queryFn: () => calculateNumerology(targetName, targetBirthDate),
    enabled: !!(targetBirthDate && targetName),
  });

  // Show upgrade prompt if user is a client with no previous readings
  useEffect(() => {
    if (user?.userType === "client" && Array.isArray(numerologyReadings) && numerologyReadings.length === 0 && numerology) {
      setShowUpgradePrompt(true);
    }
  }, [user, numerologyReadings, numerology]);

  // Store reading ID when numerology is calculated
  const [currentReadingId, setCurrentReadingId] = useState<number | null>(null);

  // Capture reading ID from numerology result when available
  useEffect(() => {
    if (numerology?.readingId) {
      setCurrentReadingId(numerology.readingId);
    }
  }, [numerology?.readingId]);

  // Save healer notes mutation
  const saveNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      // For now, we'll create a new reading and update it with notes
      // This is a temporary solution until we modify the API to return reading ID
      const response = await fetch('/api/healer-numerology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: targetName, 
          birthDate: targetBirthDate,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create numerology reading');
      }
      
      const readingData = await response.json();
      setCurrentReadingId(readingData.id);
      
      // Now update with notes
      const notesResponse = await fetch(`/api/numerology-readings/${readingData.id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ healerNotes: notes }),
      });
      
      if (!notesResponse.ok) {
        throw new Error('Failed to save notes');
      }
      
      return notesResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Notes Saved",
        description: "Your healer notes have been saved successfully.",
      });
      setIsSavingNotes(false);
    },
    onError: (error) => {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
      setIsSavingNotes(false);
    },
  });

  // Generate PDF with numerology results and healer notes
  const generatePDF = async () => {
    if (!numerology) return;
    
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = 210;
      const margin = 20;
      const lineHeight = 6;
      let currentY = margin;

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        
        lines.forEach((line: string) => {
          if (currentY > 280) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += lineHeight;
        });
        currentY += 2; // Extra spacing
        pdf.setTextColor(0, 0, 0); // Reset to black
      };

      const addSection = (title: string) => {
        if (currentY > 260) {
          pdf.addPage();
          currentY = margin;
        }
        currentY += 3;
        addText(title, 14, true, [75, 85, 99]);
        currentY += 2;
      };

      const addBulletPoint = (text: string, fontSize: number = 9, color: [number, number, number] = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        const bulletX = margin;
        const textX = margin + 5;
        
        if (currentY > 280) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.text('•', bulletX, currentY);
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin - 5);
        lines.forEach((line: string, index: number) => {
          if (currentY > 280) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, index === 0 ? textX : textX, currentY);
          currentY += lineHeight;
        });
        pdf.setTextColor(0, 0, 0);
      };

      // Title
      addText("NUMEROLOGY ANALYSIS REPORT", 20, true, [88, 28, 135]);
      currentY += 3;
      addText(`Generated for: ${targetName}`, 14, true);
      addText(`Birth Date: ${targetBirthDate}`, 12);
      addText(`Report Date: ${new Date().toLocaleDateString()}`, 12);
      if (healerData?.fromHealer) {
        addText(`Generated by Professional Healer`, 12, false, [234, 179, 8]);
      }
      currentY += 8;

      // Personalized Introduction Note
      addText(`Dear ${targetName},`, 11, false);
      currentY += 2;
      addText(`This personalized AuraEye™ report has been thoughtfully prepared for you by your Licensed Healer. Anytime you wish to connect with them you can reach out on their contact information provided separately.`, 10);
      currentY += 2;
      addText(`How to Use Your AuraEye(™) Numerology, Chakra & Aura Report

Welcome to your AuraEye™ Numerology & Energy Guidance Report.
This personalized AuraEye™ report has been thoughtfully prepared for you by your Licensed Healer. Anytime you wish to connect with them you can reach out on their contact information provided separately.

This report reflects the current state of your energetic field — a living snapshot of your emotions, thoughts,
and vibrational balance at this moment. Each number resonates to a particular planet and specific chakra in your energy body. The colours of the chakra, aura colours and planets might not resonate in classical astrology or numerological sense to you but the qualities of each planet will when you understand the correlation of them with the 9 chakras in the spiritual body.

Please remember: this report is not a medical or psychological diagnosis. Instead, it is a tool for
self-awareness, empowerment, and energetic guidance — designed to help you understand where your
energy flows freely and where it seeks harmony.
This report is designed as a self-awareness and alignment tool, not a prediction of fate. It helps you understand how numbers, chakras, and aura patterns reflect your current energetic tendencies—and how you can consciously work with them.
Numerology
 
 Numerology is based on the idea that numbers carry symbolic patterns of energy. Your birth date generates specific numbers that describe:
-	How you express yourself
-	How you make decisions
-	What lessons repeat in your life
-	Which energies feel natural or challenging to you

These numbers do not control your life. They simply highlight tendencies—much like a personality map.
Chakras & Aura
 
 Chakras are energy centers associated with emotions, behavior, and focus areas in life.
 Your aura reflects how balanced or stressed these centers are right now.

Just like your heart rate or mood changes daily, your aura and chakra balance also changes with:
-	Thoughts
-	Emotions
-	Habits
-	Actions (karma)
This is why the report is a snapshot, not a fixed identity.
________________________________________

How to Use This Report Practically
1. Use it as a mirror, not a label
 Read each section as feedback—not judgment.
 If something resonates, observe it.
 If something doesn’t, ignore it without forcing belief.

2. Follow the Monthly Guidance
 Your Personal Month sections show what type of energy is most active during that month.
-	Some months support action
-	Some support reflection
-	Some support healing or completion
Work with the month instead of resisting it.

3. Apply the Remedies Gently
 Remedies (colors, mantras, crystals, journaling, affirmations) are:
-	Tools to support focus and awareness
-	Not magical shortcuts
-	Not compulsory
Choose 1–2 remedies per month and practice them consistently rather than doing everything.

4. Yearly vs Monthly Use
-	Yearly theme > sets the broader focus
-	Monthly themes > guide your short-term actions and mindset
Think of the year as the climate and the months as the weather.
________________________________________

A Very Important Reminder
This report does not decide your future.
Your results depend on:
-	Your actions
-	Your choices
-	Your discipline
-	Your effort
-	Your karma (what you repeatedly do)

Numerology and chakra insights can support your journey—but they cannot replace action.
Awareness without effort changes nothing. Effort aligned with awareness changes everything.

Use this report as:
-	A compass, not a command
-	A support system, not a dependency
-	A guide, not a guarantee

Your growth is ultimately created by what you choose to do next.
With awareness and responsibility,
 


`, 10);
      currentY += 2;
      addText(`Team AuraEye™
 Your Energy, Made Visible.`, 10, true);
      currentY += 2;
      
      currentY += 2;
      addText(`Disclaimer: This AuraEye™ report and any guidance provided by AuraEye™, its platform, or its licensed healers is intended solely for self-awareness, personal reflection, and spiritual or wellness support. It does not constitute and should not be considered a prediction, guarantee, diagnosis, treatment, or professional advice of any kind, including but not limited to medical, psychological, psychiatric, legal, or financial advice. AuraEye™ does not claim to diagnose, treat, cure, or prevent any condition. All insights are symbolic and interpretive in nature, and outcomes depend entirely on the user’s free will, personal choices, actions, and efforts. Users are advised to consult qualified professionals for any medical, mental health, legal, or financial concerns.`, 10);
      currentY += 4;
      
      currentY += 8;

      // Core Numbers Section
      addSection("");
      addText("Your core numbers",20, true, [88, 28, 135])
      // Life Path Number
      addText(`Life Path Number: ${numerology.lifePathNumber}`, 12, true);
      const lifePathMeaning = getLifePathMeaning(numerology.lifePathNumber);
      addText(lifePathMeaning, 9);
      currentY += 3;
      
      // Destiny Number
      addText(`Destiny Number: ${numerology.destinyNumber}`, 12, true);
      addText(getDestinyMeaning(numerology.destinyNumber), 9);
      currentY += 3;
      
      // Soul Urge Number
      addText(`Soul Urge Number: ${numerology.soulUrgeNumber}`, 12, true);
      addText(getNumberMeaning(numerology.soulUrgeNumber, 'soulUrge').description, 9);
      currentY += 3;
      
      // Personality Number (Decision-Making Chakra)
      addText(`Personality Number (Decision-Making Chakra): ${numerology.personalityNumber}`, 12, true);
      addText("Most of your decisions will be based on the qualities of this chakra", 9);
      currentY += 3;
      
      // Dominant Soul Chakra
      const dominantSoulNumber = calculateDominantSoulChakra(targetBirthDate);
      addText(`Dominant Soul Chakra: ${dominantSoulNumber}`, 12, true);
      addText("Your soul wants you to operate from the positive and balanced qualities of this chakra. This is your greatest challenge area.", 9);
      currentY += 5;

      // Chakra-Planet Analysis
      addText("CHAKRA-PLANET ANALYSIS", 20, true, [88, 28, 135]);
      
      // Decision-Making Chakra Analysis
      const personalityInfo = getChakraPlanetInfo(numerology.personalityNumber);
      addText("Decision-Making Chakra:", 11, true);
      addText(`Number ${numerology.personalityNumber}: ${personalityInfo.chakra} • ${personalityInfo.planet}`, 10, false);
      addText(personalityInfo.description, 9);
      addText("Recommended Remedies:", 10, true);
      personalityInfo.remedies.forEach(remedy => {
        addText(`• ${remedy}`, 9);
      });
      currentY += 3;
      
      // Dominant Soul Chakra Analysis
      const soulInfo = getChakraPlanetInfo(dominantSoulNumber);
      addText("Dominant Soul Chakra:", 11, true);
      addText(`Number ${dominantSoulNumber}: ${soulInfo.chakra} • ${soulInfo.planet}`, 10, false);
      addText(soulInfo.description, 9);
      addText("Healing Remedies:", 10, true);
      soulInfo.remedies.forEach(remedy => {
        addText(`• ${remedy}`, 9);
      });
      currentY += 5;

      // Vibration Qualities
      addText("VIBRATION QUALITIES", 20, true, [88, 28, 135]);
      addText(`Life Path (${numerology.lifePathNumber}):`, 10, true);
      addText(getVibrationQualities(numerology.lifePathNumber).join(', '), 9);
      currentY += 2;
      
      addText(`Destiny (${numerology.destinyNumber}):`, 10, true);
      addText(getVibrationQualities(numerology.destinyNumber).join(', '), 9);
      currentY += 2;
      
      addText(`Soul Urge (${numerology.soulUrgeNumber}):`, 10, true);
      addText(getVibrationQualities(numerology.soulUrgeNumber).join(', '), 9);
      currentY += 2;
      
      addText(`Personality (${numerology.personalityNumber}):`, 10, true);
      addText(getVibrationQualities(numerology.personalityNumber).join(', '), 9);
      currentY += 5;

      // Color Associations
      addText("COLOR VIBRATIONS", 20, true, [88, 28, 135]);
      addText(`Life Path: ${getNumberColorAssociation(numerology.lifePathNumber)}`, 10);
      addText(`Destiny: ${getNumberColorAssociation(numerology.destinyNumber)}`, 10);
      addText(`Soul Urge: ${getNumberColorAssociation(numerology.soulUrgeNumber)}`, 10);
      addText(`Personality: ${getNumberColorAssociation(numerology.personalityNumber)}`, 10);
      addText(`Soul Chakra: ${getNumberColorAssociation(dominantSoulNumber)}`, 10);
      currentY += 5;

      // Personal Year Analysis
      const personalYear = calculatePersonalYear(targetBirthDate);
      const personalYearInfo = getPersonalYearMeaning(personalYear);
      
      addSection(``);
      addText("PERSONAL YEAR 2026", 20, true, [88, 28, 135]);
      addText(personalYearInfo.title, 12, true);
      addText(personalYearInfo.description, 9);
      currentY += 2;
      addText("Focus Areas for 2026:", 10, true);
      personalYearInfo.focus.forEach(item => {
        addText(`• ${item}`, 9);
      });
      currentY += 3;
      
      // Personal Year Calculation Explanation
      

      // Personal Month Forecast
      addSection("");
      addText("PERSONAL MONTHS", 20, true, [88, 28, 135])
      const months = [
        { name: "January", number: 1 }, { name: "February", number: 2 },
        { name: "March", number: 3 }, { name: "April", number: 4 },
        { name: "May", number: 5 }, { name: "June", number: 6 },
        { name: "July", number: 7 }, { name: "August", number: 8 },
        { name: "September", number: 9 }, { name: "October", number: 10 },
        { name: "November", number: 11 }, { name: "December", number: 12 }
      ];
      
      months.forEach(month => {
        const personalMonth = calculatePersonalMonth(personalYear, month.number);
        const monthInfo = getPersonalMonthMeaning(personalMonth);
        const remedy = getMonthlyRemedy(personalMonth);
        
        addText(`${month.name} (Personal Month ${personalMonth})`, 14, true);
        addText(`${monthInfo.title} - ${monthInfo.theme}`, 12);
        addText(monthInfo.description, 12, true);
        addText(`Monthly Remedy: Color - ${remedy.color}, Mantra - ${remedy.mantra}, Crystal - ${remedy.crystal}, Sacred Code - ${remedy.sacredCode}`, 10);
        currentY += 2;
      });
      currentY += 3;

      // Complete Interpretation
      addSection("DETAILED INTERPRETATION");
      addText(numerology.interpretation, 9);
      currentY += 5;

      // Tab-Based Profile Information
      
      
      // Life Path Detailed Section
      
      
      // Destiny Detailed Section
      
      // Soul Urge Detailed Section
      
      
      // Personality Detailed Section
      

      // Spiritual Guidance
      addSection("SPIRITUAL GUIDANCE");
      addText(`Focus on harmonizing the ${getNumberColorAssociation(numerology.lifePathNumber)} and ${getNumberColorAssociation(numerology.destinyNumber)} energies in your numerological blueprint for optimal growth and spiritual development.`, 9);
      currentY += 3;
      addText("Key Strengths:", 10, true);
      addBulletPoint(`Natural ${getNumberColorAssociation(numerology.lifePathNumber)} energy enhances your leadership abilities`, 9, [34, 197, 94]);
      addBulletPoint(`Your ${getNumberColorAssociation(numerology.destinyNumber)} vibration amplifies your communication skills`, 9, [34, 197, 94]);
      addBulletPoint(`The ${getNumberColorAssociation(numerology.soulUrgeNumber)} influence strengthens your intuitive abilities`, 9, [34, 197, 94]);
      currentY += 3;
      
      addText("Potential Challenges:", 10, true);
      addBulletPoint(`Balancing ${getNumberColorAssociation(numerology.lifePathNumber)} intensity in daily interactions`, 9, [245, 158, 11]);
      addBulletPoint(`Integrating ${getNumberColorAssociation(numerology.destinyNumber)} energy with practical matters`, 9, [245, 158, 11]);
      addBulletPoint(`Managing the sensitivity that comes with ${getNumberColorAssociation(numerology.soulUrgeNumber)} vibrations`, 9, [245, 158, 11]);
      currentY += 5;

      // Strengths and Challenges (if available)
      if (numerology.strengths && numerology.strengths.length > 0) {
        addSection("YOUR STRENGTHS");
        numerology.strengths.forEach(strength => {
          addBulletPoint(strength, 9);
        });
        currentY += 3;
      }
      
      if (numerology.challenges && numerology.challenges.length > 0) {
        addSection("AREAS FOR GROWTH");
        numerology.challenges.forEach(challenge => {
          addBulletPoint(challenge, 9);
        });
        currentY += 3;
      }
      
      // Additional Guidance (if available)
      if (numerology.guidance) {
        addSection("ADDITIONAL SPIRITUAL GUIDANCE");
        addText(numerology.guidance, 9);
        currentY += 3;
      }
      
      // Color Associations Section
      if (numerology.colorAssociations) {
        addSection("ENERGY COLOR ASSOCIATIONS");
        if (numerology.colorAssociations.lifePathColor) {
          addText(`Life Path Color: ${numerology.colorAssociations.lifePathColor}`, 10);
        }
        if (numerology.colorAssociations.destinyColor) {
          addText(`Destiny Color: ${numerology.colorAssociations.destinyColor}`, 10);
        }
        if (numerology.colorAssociations.soulUrgeColor) {
          addText(`Soul Urge Color: ${numerology.colorAssociations.soulUrgeColor}`, 10);
        }
        if (numerology.colorAssociations.personalityColor) {
          addText(`Personality Color: ${numerology.colorAssociations.personalityColor}`, 10);
        }
        currentY += 3;
      }
      
      // Healer Notes (if any)
      if (healerNotes.trim()) {
        addSection("PROFESSIONAL HEALER NOTES");
        addText(healerNotes, 9);
      }

      // Get base64 data for storage before saving locally
      const pdfBase64 = pdf.output('datauristring');
      
      pdf.save(`numerology-analysis-${targetName.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`);
      
      // Save PDF data to database if we have a reading ID
      if (currentReadingId) {
        try {
          await fetch(`/api/numerology-readings/${currentReadingId}/pdf`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pdfData: pdfBase64 }),
          });
          
          // Invalidate healer numerology readings query so dashboard updates immediately
          queryClient.invalidateQueries({ queryKey: ['/api/healer-numerology-readings'] });
        } catch (saveError) {
          console.error("Error saving PDF to database:", saveError);
        }
      }
      
      toast({
        title: "PDF Downloaded",
        description: "Your comprehensive numerology analysis PDF has been downloaded and saved to your dashboard.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const saveNotes = () => {
    setIsSavingNotes(true);
    saveNotesMutation.mutate(healerNotes);
  };

  const onSubmit = async (data: NumerologyFormData) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access numerology analysis.",
        variant: "destructive",
      });
      // Redirect to login page
      window.location.href = "/api/login";
      return;
    }

    if (!data.name.trim() || !data.birthDate.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and birth date for analysis.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await calculateNumerology(data.name, data.birthDate);
      
      // Capture the reading ID from the result for PDF saving
      if (result.readingId) {
        setCurrentReadingId(result.readingId);
      }
      
      // Trigger a refetch with the new data
      refetchNumerology();
      setShowForm(false);
      
      // Invalidate queries to refresh user's reading history immediately
      queryClient.invalidateQueries({ queryKey: ['/api/numerology-readings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/credits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/badge-progress'] });
      
      toast({
        title: "Analysis Complete",
        description: "Your numerology analysis has been updated.",
      });
      
      // Check for new badges as fallback
      await checkBadges();
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    }
  };

  const chakraColors = {
    root: "#E53E3E",
    sacral: "#FF8C00", 
    solarPlexus: "#FFD700",
    heart: "#38A169",
    throat: "#3182CE",
    thirdEye: "#805AD5",
    crown: "#B794F6",
    earthstar: "#A0AEC0",
    soulstar: "#718096",
  };

  const parseLifePathText = (text: string): Array<{heading: string; content: string}> => {
    const sections: Array<{heading: string; content: string}> = [];
    const headingPatterns = /^(Colour|COLOUR|Color|COLOR|CHAKRA|Chakra|Planet|PPI|Concept|Research|How to Use|Example Technique|Angel\/Archangel|Karmic Lesson|Healing Method|Remedies|Color Therapy|Mantra Chanting|Crystal Therapy|Aroma Therapy|Affirmations|Sacred Code|Bach Flower Remedies|Prayer to Archangel|Deity Connection|Self-Healing Technique|Rudraksha Remedy|Positive Psychology):/i;
    
    // Split by heading keywords - look for "Keyword: content"
    let currentSection = '';
    let currentHeading = '';
    
    // Replace multiple spaces and split intelligently
    const cleanText = text.replace(/([A-Z][a-z\s]+:)/g, '\n$1').trim();
    const lines = cleanText.split('\n');
    
    for (const line of lines) {
      const match = line.match(headingPatterns);
      if (match) {
        // Found a heading
        if (currentHeading && currentSection) {
          sections.push({
            heading: currentHeading,
            content: currentSection.trim().substring(0, 250)
          });
        }
        currentHeading = match[1];
        currentSection = line.substring(match[0].length).trim();
      } else {
        // Continue with current section
        if (currentHeading) {
          currentSection += ' ' + line.trim();
        }
      }
    }
    
    // Add final section
    if (currentHeading && currentSection) {
      sections.push({
        heading: currentHeading,
        content: currentSection.trim().substring(0, 250)
      });
    }
    
    // Fallback if no sections parsed
    if (sections.length === 0) {
      // Try simple split by colon
      const colonParts = text.split(/([A-Z][^:]*):/).filter(p => p.trim());
      for (let i = 0; i < colonParts.length; i += 2) {
        if (colonParts[i] && colonParts[i + 1]) {
          sections.push({
            heading: colonParts[i].trim(),
            content: colonParts[i + 1].trim().substring(0, 250)
          });
        }
      }
    }
    
    // Final fallback
    if (sections.length === 0) {
      sections.push({
        heading: 'Life Path Information',
        content: text.substring(0, 1000)
      });
    }
    
    return sections;
  };

  const getLifePathMeaning = (number: number): string => {
    const meanings: { [key: number]: string } = {
      1: "Colour: Yellow, Chakra: Solar plexus. Leadership and independence. Planet: Sun Chakra: Solar Plexus Chakra (between ribs and navel) PPI: Goal Setting and Achievement Positive Psychology Interventions: PPI Concept: Goal setting fosters independence and self-confidence. Research: Locke & Latham (2002) demonstrated that specific and challenging goals significantly enhance motivation and achievement. How to Use: Set 3 short-term and 1 long-term goal weekly. Use SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound). Celebrate small wins to build momentum. Example Technique: Short-Term Goal: Complete one self-help book this week. Long-Term Goal: Start a blog on personal development. Write down steps, track progress daily, and celebrate milestones.   Angel/Archangel: Archangel Michael Karmic Lesson: Personal power, confidence, and willpower. Healing Method: Overcome self-doubt and claim inner strength.    Remedies: Color Therapy: Yellow. Wear or visualize yellow light.   Mantra Chanting: RAM 45 times/day.Crystal Therapy: Citrine, Tiger’s Eye. Aroma Therapy: Lemon, Bergamot, Ginger. Affirmations: I am confident and powerful I take charge of my life. Sacred Code: Chant 451 45 times/day. (chant numbers individually) Four Five One Bach Flower Remedies: Larch (self-doubt), Wild Oat (direction), Mustard (low energy). How to use: In a bottle of water, add 4-5 drops of each remedy. Drink throughout the day. Prayer to Archangel Michael: Archangel Michael, give me strength and confidence to shine my light. Guide me to my highest purpose. Amen. Deity Connection:Solar Plexus Chakra (Sun): Lord Surya and Lord Rama Om Suryaya Namah. Shri Ram Jai Ram Jai Jai Ram. Radiant Lord Surya, empower my inner strength and confidence. Guide me to take charge of my destiny and fill my solar plexus chakra with your golden light. Self-Healing Technique: Rub your palms, fill your body with white light, and say: I invoke the light of God within me. I am a clear and perfect channel; light is my guide. Focus on the heart chakra as a bridge. Call Archangel Michael or Lord Surya with this prayer:Archangel Michael, fill me with strength and confidence. Lord Surya, empower me with light and power. Create a yellow energy ball in your palms, visualize code 451 in its center, and state your intention. Absorb the ball into your solar plexus chakra for confidence and willpower or send it into the universe for manifestation. Planet: Sun Rudraksha Remedy: Wear 12 Mukhi or 1 Mukhi Nepal Sawar Bead or 1 Mukhi Indonesian Premium Energized Rudraksha.",
      2: "COLOUR: Green and pink, CHAKRA: Heart Chakra. Cooperation and harmony Planet: Moon Chakra: Heart Chakra (center of the chest) PPI: Gratitude Practice Concept: Expressing gratitude strengthens relationships and reduces emotional sensitivity. Research: Emmons & McCullough (2003) found that gratitude journaling increases happiness and reduces depressive symptoms. How to Use: Write 3 things you are grateful for daily. Share one gratitude message or voice note with someone weekly. Example Technique: Daily gratitude journal: I am grateful for my supportive friend, my health, and today’s sunny weather. Angel/Archangel: Archangel Raphael Karmic Lesson: Emotional balance and self-love. Healing Method: Open your heart to unconditional love and heal emotional wounds. Remedies: Color Therapy: Green (more on the physical body) or pink (emotional colour of love). Mantra Chanting: YAM 45 times/day. Crystal Therapy: Rose Quartz, Green Aventurine,Rhodocrosite, Rhodonite. Aroma Therapy: Rose, Lavender, Eucalyptus. Affirmations: I give and receive love freely.I forgive myself and others.Sacred Code: Chant 741 45 times/day. (seven four one) Bach Flower Remedies: Holly (jealousy), Willow (resentment), Agrimony (hidden pain). Prayer to Archangel Raphael: Archangel Raphael, open my heart to love and forgiveness. Heal my emotional wounds and guide me in nurturing harmonious relationships. Amen.Deity Connection:  Heart Chakra (Moon): Goddess Parvati Om Dum Durgayei Namah. Divine Mother Parvati, open my heart to unconditional love and forgiveness. Self-Healing Technique: Rub your palms, fill your body with white light, and say: I invoke the light of God within me. I am a clear and perfect channel; light is my guide. Focus on the heart chakra as a bridge. Call Archangel Raphael or Goddess Parvati with this prayer: Archangel Raphael, open my heart to love and forgiveness. Goddess Parvati, nurture me with unconditional love. Create a green or pink energy ball in your palms, visualize code 741 in its center, and state your intention. Absorb the ball into your heart chakra for love and healing or send it into the universe to foster compassion. Planet: Moon Rudraksha Remedy: Wear 2 Mukhi Nepal Premium or any premium Gauri Shankar Energized Rudraksha",
      3: "Colour: Violet, Chakra: Crown Chakra. Creativity and expression Planet: Jupiter Chakra: Crown Chakra (top of the head) PPI: Expressive Writing Concept: Writing about emotional experiences enhances creativity and reduces stress. Research:Pennebaker (1997) found that expressive writing helps process emotions and reduces psychological distress. How to Use: Write for 10 minutes daily about a challenge and conclude with a positive takeaway. Example Technique: Today, I felt stressed at work. I realized I need to delegate tasks and set boundaries. Angel/Archangel: Archangel Metatron Karmic Lesson: Spiritual connection and enlightenment. Healing Method: Let go of ego and embrace divine guidance. Remedies: Color Therapy: Violet or white.  Mantra Chanting: AUM 45 times/day. Crystal Therapy: Clear Quartz, Selenite, Lepidolite. Aroma Therapy: Lavender, Myrrh, Rosewood. Affirmations:I am divinely guided.I am connected to universal energy. Sacred Code: Chant 204 45 times/day. Bach Flower Remedies: Wild Rose (apathy), Aspen (fear of unknown), Olive (exhaustion). Prayer to Archangel Metatron: Archangel Metatron, connect me to divine wisdom and purpose. Guide me to my higher truth. Amen. Deity Connection: Crown Chakra (Jupiter): Lord Vishnu and Goddess Gayatri Om Namo Narayanaya, Om Gayatriye Namah. Oh divine gods connect me to the divine source. Self-Healing Technique: Rub your palms, fill your body with white light, and say: I invoke the light of God within me. I am a clear and perfect channel; light is my guide. 2. Focus on the heart chakra as a bridge. 3. Call Archangel Metatron or Goddess Gayatri with this prayer: Archangel Metatron, connect me to divine wisdom. Goddess Gayatri, bless me with enlightenment and spiritual clarity.Create a violet or white energy ball in your palms, visualize code 204 in its center, and state your intention. Absorb the ball into your crown chakra for divine connection or send it int the universe to manifest spiritual goals. Planet : Jupiter Rudraksha Remedy:Wear 10 Mukhi or 5 Mukhi Nepal Premium Energized Rudraksha.",
      4: "Colour: Crimson Chakra: Earth Star Chakra. Stability and hard work Planet: Rahu Chakra: Earth Star Chakra (6 inches below the feet) PPI: Mindfulness Meditation Concept: Mindfulness improves focus, reduces stress, and fosters emotional stability. Research: Kabat-Zinn (1990) demonstrated that mindfulness-based stress reduction (MBSR) enhances mental and physical well-being. How to Use: Practice 10 minutes of mindfulness meditation daily or pranayam. Focus on your breath and observe thoughts without judgment.Example Technique: Sit comfortably, focus on your breath, and bring attention back whenever it wanders. Angel/Archangel: Archangel Ariel Karmic Lesson: Deep grounding, responsibility, and trust in life. Healing Method: Embrace stability and create strong foundations. Remedies: Color Therapy: Brown or black. Visualize grounding light. Mantra Chanting: LAM 45 times/day. Crystal Therapy: Smoky Quartz, Hematite, Red Jasper, Pyrite. Aroma Therapy: Cedarwood, Vetiver, Patchouli. Affirmations: I am deeply rooted and stable.I trust the support of the Earth. Sacred Code: Chant 264 45 times/day. Bach Flower Remedies: Oak (overwork), Centaury (weak boundaries),Gentian (discouragement).Prayer to Archangel Ariel:Archangel Ariel, ground me deeply in Earth’s energy and guide me to stabilityand peace. Amen.Deity Connection: Earth Star Chakra (Rahu): Bhudevi (Earth Goddess) Om Vasundharaye Namah. Bhudevi, anchor me to your grounding energy and support my path. Self-Healing Technique: 1. Rub your palms, fill your body with white light, and say: I invoke the light of God within me. I am a clear and perfect channel; light is my guide.Focus on the heart chakra as a bridge. Call Archangel Ariel or Bhudevi (Earth Goddess) with this prayer: Archangel Ariel, ground me in Earth’s energy. Bhudevi, anchor me in stability 4. Create a brown or black energy ball in your palms, visualize code 264 in its center, and state your intention. 5. Absorb the ball into your Earth star chakra for grounding or send it into the universe to anchor stability. Planet: Rahu Rudraksha Remedy: Wear 8 Mukhi Nepal Premium Energized Rudraksha",
      5: "Colour: Blue Chakra:Throat Chakra. Freedom and adventure Planet: Mercury Chakra: Throat Chakra (center of the throat) PPI: Random Acts of Kindness Concept: Acts of kindness enhance well-being and foster adaptability through connection. Research: Lyubomirsky et al. (2005) found that random acts of kindness boost happiness and emotional flexibility. How to Use: Perform one act of kindness daily (e.g., a compliment, a small gift). Reflect on how it feels to help others. Example Technique:Compliment a stranger or buy coffee for someone in line.Angel/Archangel: Archangel ZadkielKarmic Lesson: Authentic communication and adaptability.Healing Method: Speak your truth and listen with compassion. Remedies:Color Therapy: Blue. Visualize or wear blue light.Mantra Chanting: HAM 45 times/day.Crystal Therapy: Blue Lace Agate, Lapis Lazuli, Aquamarine. Aroma Therapy: Peppermint, Chamomile, Spearmint.Affirmations: I express myself clearly and truthfully.I listen with empathy and understanding.Sacred Code: Chant 986 45 times/day.Bach Flower Remedies: Cerato (self-trust), Heather (over-talkative),Beech (criticism).Prayer to Archangel Zadkiel:Archangel Zadkiel, help me express my truth with clarity and compassion. Guidemy words and thoughts. Amen.Deity Connection:Throat Chakra (Mercury): Lord Krishna and Goddess Saraswati Om Namo Bhagavate Vasudevaya. Om Aim Saraswati Namah. Bless me with the clarity of speech and the wisdom to express it. Self-Healing Technique: 1. Rub your palms, fill your body with white light, and say: I invoke the light of God within me. I am a clear and perfect channel; light is my guide.2. Focus on the heart chakra as a bridge.3. Call Archangel Zadkiel or Lord Krishna with this prayer: Archangel Zadkiel, guide me to express my truth with clarity. Lord Krishna, bless me with wisdom and eloquence. 4. Create a blue energy ball in your palms, visualize code 986 in its center, and state your intention.5. Absorb the ball into your throat chakra for clear communication or send it into the universe to enhance your voice. Planet: Mercury Rudraksha Remedy: Wear 4 Mukhi Nepal Premium Energized Rudraksh",
      6: "Colour: Orange Chakra:Sacral Chakra. Nurturing and responsibility Planet: VenusChakra: Sacral Chakra (three fingers below the navel) PPI: Strengths-Based Reflection Concept: Using personal strengths nurtures self-esteem and builds resilience. Research: Seligman et al. (2005) found that identifying and using character strengths increases life satisfaction. How to Use: Identify your top strengths and reflect on how you use them. Apply one strength to a challenge each week.Example Technique:I am empathetic. I supported a friend in need and will volunteer this week.Angel/Archangel: Archangel Gabriel Karmic Lesson: Emotional flow, creativity, and joy. Healing Method: Release guilt and embrace self-expression. Remedies: Color Therapy: Orange. Wear or visualize orange light  Mantra Chanting: VAM 45 times/day.  Crystal Therapy: Carnelian, Moonstone, Orange Calcite. Aroma Therapy: Ylang-Ylang, Sandalwood, Clary Sage. Affirmations: I embrace my creativity and joy. I release guilt and allow myself to flow.Sacred Code: Chant 760 45 times/day.Bach Flower Remedies: Star of Bethlehem (trauma), Pine (guilt),Honeysuckle (nostalgia). Prayer to Archangel Gabriel: Archangel Gabriel, bless me with creativity and emotional flow. Guide me to express myself fully and joyfully. Amen.Deity Connection: Sacral Chakra (Venus): Goddess Lakshmi Om Shreem Maha Lakshmyai Namah. Guide me to embrace abundance and joy in all aspects of my life.Self-Healing Techniqu: 1. Rub your palms, fill your body with white light, and say: I invoke the light of God within me. I am a clear and perfect channel; light is my guide. 2. Focus on the heart chakra as a bridge. 3. Call Archangel Gabriel or Goddess Lakshmi with this prayer: Archangel Gabriel, awaken my creativity and emotional flow. Goddess Lakshmi, bless me with abundance and joy. 4. Create an orange energy ball in your palms, visualize code 760 in its center, and state your intention. 5. Absorb the ball into your sacral chakra for healing emotions and enhancing creativity or send it into the universe for abundance. Planet: Venus Rudraksha Remedy Wear 13 Mukh",
      7: "Colour: Silver Chakra:Soul Star Chakra. Spirituality and analysis Planet: Ketu Chakra: Soul Star Chakra (6 inches above the head) PPI: Self-Compassion PracticeConcept: Self-compassion fosters wisdom, reduces self-criticism, and enhances emotionalresilience. Research: Neff (2003) found that self-compassion improves mental health and reducesanxiety. How to Use: Practice 3 components of self-compassion: Be kind to yourself. Recognize common humanity. Stay mindful without over-identifying with emotions. Example Technique: Affirmation: I am enough as I am, and I forgive myself for past mistakes. Angel/Archangel: Archangel Sandalphon Karmic Lesson: Transcendence, releasing past karma, and spiritual alignment. Healing Method: Connect to divine purpose and let go of karmic burdens. Remedies: Color Therapy: Gold or white. Visualize divine light above your head.  Mantra Chanting: OM SO HUM 45 times/day. Crystal Therapy: Selenite, Clear Quartz, Angelite.  Aroma Therapy: Lotus, Neroli, Angelica.  Affirmations:  I align with my soul's purpose. I transcend all karmic burdens. Sacred Code: Chant 56 45 times/day. Bach Flower Remedies: Walnut (transition), Heather (overwhelm), Water Violet (detachment). Prayer to Archangel Sandalphon: Archangel Sandalphon, guide me to release karmic ties and align with my higher purpose. Amen. Deity Connection: Soul Star Chakra (Ketu): Goddess Kali Jai Kali Ma. Guide me in transcending karma and embracing divine alignment. Self-Healing Technique: 1. Rub your palms, fill your body with white light, and say: I invoke the light of God within me. I am a clear and perfect channel; light is my guide. Focus on the heart chakra as a bridge. Call Archangel Sandalphon or Lord Hanuman with this prayer: Archangel Sandalphon, align me with my soul’s purpose. Maha Kali Maa, guide me to resolve my pending karma in a safe and controlled manner. 4. Create a gold or white energy ball in your palms, visualize code 56 in its center, and state your intention.5. Absorb the ball into your soul star chakra for karmic healing or send it into the universe for spiritual growth. Planet: Ketu Rudraksha Remedy: Wear 9 Mukhi Nepal Premium Energized Rudraksha.",
      8: "Colour: Indigo, Chakra: Third Eye Chakra. Material success and power Planet: Saturn Chakra: Third Eye Chakra (between the eyebrows) PPI: Visualization and Affirmations Concept: Visualization builds a positive mindset and attracts abundance through optimism. Research: Taylor et al. (1998) showed that mental imagery enhances performance and emotional regulation. How to Use: Visualize a goal for 5 minutes daily. Pair it with affirmations like I am abundant and powerful.Example Technique: Visualize delivering a successful presentation and being praised. Angel/Archangel: Archangel Raziel Karmic Lesson: Seeing truth, balancing karma, and understanding spiritual lessons. Healing Method: Trust your intuition and embrace clarity. Remedies: Color Therapy: Indigo. Visualize or wear indigo light. Mantra Chanting: OM 45 times/day. Crystal Therapy: Amethyst, Fluorite, Sodalite. Aroma Therapy: Sandalwood, Frankincense, Juniper. Affirmations: I trust my intuition. I see clearly and align with my truth. Sacred Code: Chant 505 45 times/day. Bach Flower Remedies: Clematis (daydreaming), White Chestnut (racing thoughts), Chestnut Bud (repeating mistakes). Prayer to Archangel Raziel: Archangel Raziel, open my third eye to divine clarity and wisdom. Guide me to see the truth. Amen. Deity Connection Third Eye Chakra (Saturn): Lord Shiva Om Namah Shivaya. Lord Shiva, guide me to clarity and truth, and help me align with spiritual wisdom. Self-Healing Technique: 1. Rub your palms, fill your body with white light, and say: I invoke the light of God within me. I am a clear and perfect channel; light is my guide.2. Focus on the heart chakra as a bridge. 3. Call Archangel Raziel or Lord Shiva with this prayer: Archangel Raziel, open my third eye to divine clarity. Lord Shiva, guide me to truth and wisdom. 4. Create an indigo energy ball in your palms, visualize code 505 in its center, and state your intention. 5. Absorb the ball into your third eye chakra for intuition and clarity or send it into the universe to see the truth. Planet: Saturn Rudraksha Remedy: Wear 14 Mukhi Gauri Shankar or 7 Mukhi Nepal Premium Energized Rudraksha",
      9: "Colour: Red, Chakra: Root Chakra. Humanitarian service Planet: Mars Chakra: Root Chakra (base of the spine) PPI: Forgiveness Practice Concept: Forgiveness reduces emotional burdens and fosters compassion for yourself and others. Research: Worthington et al. (2007) showed that forgiveness interventions improve emotional well-being and reduce stress.How to Use: Write a forgiveness letter (to yourself or others). Meditate on letting go of pain and resentment. Example Technique: Dear [Name], I forgive you for [Event]. I release this resentment for my peace and healing. Angel/Archangel: Archangel Uriel Karmic Lesson: Stability, grounding, and releasing fears. Healing Method: Embrace courage and let go of control. Remedies: Color Therapy: Red. Visualize or wear red light. Mantra Chanting: LAM 45 times/day. Crystal Therapy: Red Jasper, Hematite, Black Tourmaline. Aroma Therapy: Vetiver, Cedarwood, Patchouli. Affirmations: I am safe and grounded. I let go of fear and embrace stability. Sacred Code: Chant 996 45 times/day. Bach Flower Remedies: Mimulus (fear), Rock Rose (panic), Elm (overwhelm). Prayer to Archangel Uriel: Archangel Uriel, ground me in stability and strength. Help me release fears and trust in life. Amen. Deity Connection: Root Chakra (Mars): Lord Ganesha and Goddess Durga Om Gam Ganapataye Namah. Jai Mata Durga. Bless me with courage,stability, and strength. Self-Healing Technique: Rub your palms, fill your body with white light, and say: I invoke the light of God within me. I am a clear and perfect channel; light is my guide. Focus on the heart chakra as a bridge. Call Archangel Uriel or the deity (Lord Ganesha or Goddess Durga) with this prayer: Archangel Uriel, ground me in stability and strength. Lord Ganesha, Jai Maa Durga, remove my obstacles. Jai Mata Durga, fill me with courage. Create a red energy ball in your palms, visualize code 996 in its center,and state your intention. Absorb the ball into your root chakra for grounding and stability or send it into the universe to manifest security and strength. Planet: MarsRudraksha Remedy:Wear 11 Mukhi or 3 Mukhi Nepal Premium Energized Rudraksha."
    }
    return meanings[number] || "Unique spiritual path";
  };

  const getDestinyMeaning = (number: number): string => {
    const meanings: { [key: number]: string } = {
      1: "Planet:Sun Chakra:Solar Plexus Color:Yellow.You are a Pioneer and innovator Core Lesson:Confidence,Self Worth, Self Esteem, Will Power, Abundance",
      2: "Planet:Moon Chakra:Heart Color:Green & Pink. You are a Diplomat and peacemaker Core Lessons:Love Compassion,Forgiveness, Connection, Ability to give and recieve",
      3: "Planet:Jupiter Chakra:Crown Color:Yellow. You are a Artist and communicator Core lessons:Wisdom, Divine connection, Guidance, Receptivity, Spirtuality, Knowledge",
      4: " Planet:Rahu Chakra:Rarth star Color:Brown. You are a Builder and organizer Core Lessons: Manifestation, Suppourt system from earth, Abundance and growth, Money energy, Ability to make things happen",
      5: "Planet:Mercury Chakra:Throat Color:Blue. You are a Explorer and freedom seeker Core lessons:Self expression, Communication, Speaking the truth, Honesty, Purity of speech",
      6: "Planet:Venus Chakra:Sacral Color:Orange. You are a You are a Healer and caretaker Core lessons: Sexuality, creativity, balance, passion, feel emotion",
      7: "Planet:Ketu Chakra:Soul star Color:Silver. You are a Seeker of truth and wisdom core lessons:Soul GPS, Clarity and direction, Scynronicity, Life purpose, Karmic alignment, Inner knowing",
      8: "Planet:Saturn Chakra:Third Eye Color:Indigo. You are a Executive and achiever Core lessons: Intution, Trust, Insight, Wisdowm, Seeking truth",
      9: "Planet:Mars Chakra:Root Color:Red. You are a Humanitarian and server Core lessons: Action Stability, security, passion, decisions"
    };
    return meanings[number] || "Special destiny path";
  };

  const calculatePersonalYear = (birthDate: string): number => {
    const parts = birthDate.split('-');
    if (parts.length !== 3) return 5; // Default fallback
    
    const month = parts[1]; // MM (birth month)
    const day = parts[2];   // DD (birth day)
    const currentYear = "2026"; // Current year 2026
    
    let sum = 0;
    
    // Sum all digits from birth month
    for (const digit of month) {
      sum += parseInt(digit);
    }
    
    // Sum all digits from birth day
    for (const digit of day) {
      sum += parseInt(digit);
    }
    
    // Sum all digits from current year (2026)
    for (const digit of currentYear) {
      sum += parseInt(digit);
    }
    
    // Reduce to single digit
    return reduceToSingleDigit(sum);
  };

  const calculatePersonalMonth = (personalYear: number, month: number): number => {
    const sum = personalYear + month;
    return reduceToSingleDigit(sum);
  };

  const reduceToSingleDigit = (num: number): number => {
    while (num > 9) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  const calculateDominantSoulChakra = (birthDate: string): number => {
    // Sum all digits in birth date (e.g., 01/01/1901 = 0+1+0+1+1+9+0+1 = 13 = 1+3 = 4)
    const dateStr = birthDate.replace(/\D/g, ''); // Remove non-digits
    let sum = 0;
    
    for (const digit of dateStr) {
      sum += parseInt(digit);
    }
    
    // Reduce to single digit
    while (sum > 9) {
      sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
    }
    
    return sum;
  };

  const getPersonalYearMeaning = (year: number): { title: string; description: string; focus: string[] } => {
    const meanings: { [key: number]: { title: string; description: string; focus: string[] } } = {
      1: {
        title: "New Beginnings and Leadership",
        description: "Personal Year 1 is the beginning of a new 9-year cycle. Focus on independence, self-discovery, and asserting your personal power through the Solar Plexus Chakra.New Beginnings and Leadership Planet: Sun Chakra: Solar Plexus Chakra Definition and Impact: Personal Year 1 is the beginning of a new 9-year cycle, a time of fresh starts, self-discovery, and asserting independence. It’s an energetic reset where you’re encouraged to focus on yourself, your goals, and your dreams. Ruled by the Sun, this year amplifies confidence, ambition, and a desire to lead. The Solar Plexus Chakra plays a pivotal role in this year, fueling your personal power, determination, and ability totake initiative.This year demands courage as you step into uncharted territories. Whether you’re starting a new career, moving to a new city, or redefining your personal identity, the energy supports bold action. It’s not always easy—this year asks you to break free from old patterns and embrace new opportunities. How It Affects Us:Positive: You feel a surge of energy, ready to take charge of your life. New ideas flow easily, and you find clarity in your purpose. Leadership opportunities may arise, and you’ll feel empowered to pursue them. Negative: If unbalanced, you may feel overwhelmed by the weight of responsibility. Overconfidence or impatience might cause you to act impulsively, while self-doubt may lead to stagnation. Real-Life Relatability: Imagine you’ve been stuck in the same job for years but always dreamt of starting your own business. This year nudges you to take that leap of faith. You’ll notice doors opening—an investor might show interest, or you may stumble upon the resources you need. However, fear might creep in, making you doubt your capabilities. Advice for Balance: Focus on building a strong foundation for the future. This is a year to prioritize action but also to ensure you don’t burn out. Balance is key. Practice mindfulness to stay grounded and avoid overextending yourself. Use affirmations like “I am confident, capable, and ready to lead” to align your Solar Plexus Chakra. Practical Steps: 1. Set clear, achievable goals. Break them into smaller tasks to maintain focus. 2. Say yes to opportunities but evaluate them carefully—don’t spread yourself too thin.3. Take care of your health; physical vitality will fuel your drive.Chakra Insight:The Solar Plexus Chakra governs self-esteem and personal power. To maintain balance, practice yellow light meditations and chant the mantra RAM daily. Visualize your goals while basking in this radiant energy",
        focus: ["Set clear, achievable goals", "Say yes to new opportunities", "Focus on personal health and vitality"]
      },
      2: {
        title: "Relationships, Sensitivity, and Patience", 
        description: "Personal Year 2 emphasizes cooperation, collaboration, and harmony through the Heart Chakra. Focus on building meaningful connections. Planet: Moon Chakra: Heart Chakra Definition and Impact: Personal Year 2 is about connection, collaboration, and harmony. After the dynamic energy of Year 1, this year softens the focus on independence and encourages you to nurture relationships. Ruled by the Moon, it’s a deeply emotional year, where the Heart Chakra becomes your guide. The Moon heightens intuition and emotional sensitivity, helping you form meaningful connections. However, this heightened awareness can sometimes make you feel vulnerable or overwhelmed. This is a year of duality. While you’ll find immense joy in working with others and building bonds, challenges may arise in the form of miscommunication or emotional conflicts. It’s also a year of patience—progress may seem slower than expected, but it’s because you’re being asked to focus on the foundations of trust and understanding. How It Affects Us: Positive: You’ll develop stronger relationships, deepen emotional bonds, and improve teamwork. Emotional intelligence is heightened, making it easier to empathize and collaborate. Negative: Over-sensitivity may lead to emotional burnout or conflict. You might feel overly dependent on others for validation or struggle with setting boundaries. Real-Life Relatability: Imagine you’ve started a new job. While Year 1 may have been about getting the job, Year 2 focuses on building rapport with your team. You’ll find yourself navigating different personalities and balancing your own needs with the group’s goals. Advice for Balance: Be patient with yourself and others. Take time to understand your emotions and what triggers them. Focus on self-care to avoid becoming emotionally depleted. Practice gratitude—it helps you find peace during challenges.] Practical Steps:1. Practice active listening in conversations. 2. Journaling daily about your emotions helps you process them constructively. 3. Don’t hesitate to communicate your boundaries with loved ones or colleagues. Chakra Insight: The Heart Chakra governs love, compassion, and forgiveness. Keep it balanced by visualizing green light and chanting the mantra YAM. Engage in acts of kindness to nurture this energy center",
        focus: ["Practice, active listening", "Journal about emotions daily,Communicate boundaries clearly"]},
      3: {
        title: "Creativity, Expression, and Growth",
        description: "Personal Year 3 brings vibrant self-expression and creativity through the Crown Chakra. Time to share your ideas with the world.",
        focus: ["Set weekly creative goals", "Surround yourself with inspiration", "Prioritize meaningful pursuits"]
      },
      4: {
        title: "Stability, Discipline, and Building Foundations", 
        description: "Personal Year 4 emphasizes hard work and structure through the Earth Star Chakra. Focus on building solid foundations.",
        focus: ["Create clear action plans", "Establish productive routines", "Practice gratitude for progress"]
      },
      5: {
        title: "Freedom and Adaptability",
        description: "Personal Year 5 brings change and adventure through the Throat Chakra. Embrace new experiences and authentic communication.",
        focus: ["Perform daily acts of kindness", "Express yourself truthfully", "Embrace flexibility"]
      },
      6: {
        title: "Responsibility, Nurturing, and Harmony",
        description: "Personal Year 6 focuses on family, home, and caregiving through the Sacral Chakra. Balance giving with self-care.",
        focus: ["Strengthen family bonds", "Engage in creative activities", "Set healthy boundaries"]
      },
      7: {
        title: "Spirituality and Analysis", 
        description: "Personal Year 7 is about introspection and spiritual development through the Soul Star Chakra. Time for inner reflection.",
        focus: ["Take time for meditation", "Seek spiritual practices", "Trust your intuitive guidance"]
      },
      8: {
        title: "Material Success and Power",
        description: "Personal Year 8 brings focus on achievement and material success through the Third Eye Chakra. Act with clarity and vision.",
        focus: ["Set ambitious but realistic goals", "Focus on financial planning", "Trust your business instincts"]
      },
      9: {
        title: "Humanitarian Service",
        description: "Personal Year 9 completes the cycle with service and letting go through the Root Chakra. Focus on what truly matters.",
        focus: ["Release what no longer serves", "Focus on humanitarian causes", "Prepare for new beginnings"]
      }
    };
    return meanings[year] || {
      title: "Universal Energy",
      description: "A year of unique spiritual development",
      focus: ["Trust your inner guidance", "Stay open to possibilities", "Practice mindfulness"]
    };
  };

  const getPersonalMonthMeaning = (month: number): { title: string; description: string; theme: string } => {
    const meanings: { [key: number]: { title: string; description: string; theme: string } } = {
      1: {
        title: "New Beginnings and leadership-Solar Plexus Chakra. Planet:Sun",
        description: "Personal month 1 is the beginning of a new cycle, a time of fresh starts, self-discovery, and asserting independence. It’s an energetic reset where you’re encouraged to focus on yourself, your goals, and your dreams. Ruled by the Sun, this month amplifies confidence, ambition, and a desire to lead. The Solar Plexus Chakra plays a pivotal role in this month, fueling your personal power, determination, and ability to take initiative. This month demands courage as you step into uncharted territories. Whether you’re starting a new career, moving to a new city, or redefining your personal identity, the energy supports bold action. It’s not always easy—this month asks you to break free from old patterns and embrace new opportunities.                                                                  How It Affects Us:                                                                                                                  POSITIVE : You feel a surge of energy, ready to take charge of your life. New ideas flow easily, and you find clarity in your purpose. Leadership opportunities may arise, and you’ll feel empowered to pursue them.                                                      NEGATIVE: If unbalanced, you may feel overwhelmed by the weight of responsibility. Overconfidence or impatience might cause you to act impulsively, while self-doubt may lead to stagnation.                                                                                   Real-Life Relatability: Imagine you’ve been stuck in the same job for months but always dreamt of starting your own business. This month nudges you to take that leap of faith. You’ll notice doors opening—an investor might show interest, or you may stumble upon the resources you need. However, fear might creep in, making you doubt your capabilities. Advice for Balance: Focus on building a strong foundation for the future. This is a month to prioritize action but also to ensure you don’t burn out. Balance is key. Practice mindfulness to stay grounded and avoid overextending yourself. Use affirmations like “I am confident, capable, and ready to lead” to align your Solar Plexus Chakra.",
        theme: "Initiative and Fresh Energy. Practical Steps: 1.	Set clear, achievable goals. Break them into smaller tasks to maintain focus. 2.	Say yes to opportunities but evaluate them carefully—don’t spread yourself too thin. 3.	Take care of your health; physical vitality will fuel your drive. Chakra Insight: The Solar Plexus Chakra governs self-esteem and personal power. To maintain balance, practice yellow light meditations and chant the mantra RAM daily. Visualize your goals while basking in this radiant energy."
      },
      2: {
        title: "Relationships, Sensitivity, and Patience-Heart Chakra. Planet: Moon",
        description: "Definition and Impact: Personal month 2 is about connection, collaboration, and harmony. After the dynamic energy of month 1, this month softens the focus on independence and encourages you to nurture relationships. Ruled by the Moon, it’s a deeply emotional month, where the Heart Chakra becomes your guide. The Moon heightens intuition and emotional sensitivity, helping you form meaningful connections. However, this heightened awareness can sometimes make you feel vulnerable or overwhelmed. This is a month of duality. While you’ll find immense joy in working with others and building bonds, challenges may arise in the form of miscommunication or emotional conflicts. It’s also a month of patience—progress may seem slower than expected, but it’s because you’re being asked to focus on the foundations of trust and understanding.                                                                                              How It Affects Us:	                                                                                                                POSITIVE: You’ll develop stronger relationships, deepen emotional bonds, and improve teamwork. Emotional intelligence is heightened, making it easier to empathize and collaborate.                                                                                            NEGATIVE: Over-sensitivity may lead to emotional burnout or conflict. You might feel overly dependent on others for validation or struggle with setting boundaries.                                                                                                                Real-Life Relatability: Imagine you’ve started a new job. While month 1 may have been about getting the job, this month ruled by number 2 focuses on building rapport with your team. You’ll find yourself navigating different personalities and balancing your own needs with the group’s goals. Advice for Balance: Be patient with yourself and others. Take time to understand your emotions and what triggers them. Focus on self-care to avoid becoming emotionally depleted. Practice gratitude—it helps you find peace during challenges.",
        theme: "Practical Steps: 1.	Practice active listening in conversations. 2.	Journaling daily about your emotions helps you process them constructively. 3.	Don’t hesitate to communicate your boundaries with loved ones or colleagues. Chakra Insight: The Heart Chakra governs love, compassion, and forgiveness. Keep it balanced by visualizing green light and chanting the mantra YAM. Engage in acts of kindness to nurture this energy center."
      },
      3: {
        title: "Creativity, Expression and Growth- Crown Chakra. Planet-Jupiter",
        description: "Definition and Impact: Personal month 3 is a vibrant month of self-expression, social engagement, and creativity. It’s a time to let your ideas flow and share them with the world. Jupiter, the planet of expansion, encourages you to step out of your shell and embrace growth, while the Crown Chakra connects you to higher wisdom and inspiration. This month is ideal for pursuing creative passions or taking risks in areas you’ve been hesitant about. Whether it’s starting an art project, writing a book, or simply embracing joy, the energy is uplifting. However, the flip side of this expansive energy is the tendency to overcommit or lose focus.               How It Affects Us:                                                                                                                 POSITIVE: You’ll feel charismatic and magnetic, attracting opportunities and forming new connections. It’s a month of optimism and exploration.                                                                                                                       NEGATIVE: Over-scheduling or perfectionism may lead to frustration. You might also struggle with staying grounded amid the excitement.  Real Life Relatability: Think of a time when you’ve felt “in the zone”—everything clicks, and creativity flows effortlessly. This month feels like that, but only if you give yourself the space to explore. For example, you may finally start the podcast you’ve been dreaming about, but you’ll need discipline to keep it consistent. Advice for Balance: Focus your creative energy on meaningful pursuits rather than spreading yourself too thin. Schedule time for rest and reflection to avoid burnout.",
        theme: "Practical Steps: 1.	Set weekly creative goals to channel your energy constructively. 2.	Surround yourself with people who inspire and support you. 3.	Journal ideas as they come, then prioritize the ones that align with your long-term vision. Chakra Insight: The Crown Chakra governs spiritual connection and inspiration. Meditate on violet light and chant AUM to stay connected to your higher purpose. "
      },
      4: {
        title: "Stability, Discipline, and Building Foundationsn-Earth Star Chakra. Planet-Rahu",
        description: "Definition and Impact: Personal month 4 is the month of hard work, discipline, and structure. After the dynamic and creative energy of month 3, as it asks you to ground yourself and focus on building a solid foundation for the future. Rahu, the planet of karma and material stability, brings lessons of perseverance and organization, while the Earth Star Chakra grounds you deeply into the physical world. This month emphasizes responsibility and practicality, pushing you to evaluate and strengthen the core aspects of your life, including finances, health, and relationships. The energy is not flashy or quick-moving—it’s about steady progress. You might face challenges that test your patience and commitment but these are necessary for long-term growth.                                          How It Affects Us:	                                                                                                               POSITIVE: You’ll develop a strong sense of discipline and satisfaction from accomplishing meaningful tasks. Projects that have felt stagnant may finally start to move forward as you invest consistent effort.                                                         NEGATIVE: The intense focus on work and responsibility can lead to burnout or frustration if you’re not careful. Resistance to change or an overly rigid mindset may create unnecessary stress.                                                                                     Real-Life Relatability: Think of it as a time when you worked tirelessly to save money for a big purchase or spent countless hours preparing for an important exam. This is the energy of Personal month 4. You might feel like progress is slow, but every step you take now strengthens your future. For example, if you’ve been dreaming of owning a home, this month might be about saving, budgeting, and planning—not glamorous, but essential. Advice for Balance: This month is about finding harmony between effort and self-care. While it’s important to work hard, don’t forget to take breaks and celebrate small wins. Be patient—success is a marathon, not a sprint.",
        theme: "Practical Steps: 1.	Create a clear action plan for your goals and break them into smaller, manageable tasks. 2.	Establish routines that support productivity and balance. 3.	Practice gratitude for the progress you make, no matter how small. Chakra Insight: The Earth Star Chakra connects you to stability, security, and the grounding energy of the Earth. To keep this chakra balanced, visualize brown or black light beneath your feet and chant LAM daily. Engage in grounding activities like walking barefoot on grass or practicing mindfulness meditation."
      },
      5: {
        title: "Freedom and Change and Adaptability- Throat Chakra. Planet-Mercury",
        description: "Definition and Impact: Personal month 5 is all about transformation, freedom, and adventure. Mercury, the planet of communication and adaptability, brings rapid changes, opportunities, and a desire for exploration. The Throat Chakra plays a vital role in helping you express your truth, adapt to new circumstances, and embrace the unknown. It encourages you to step out of your comfort zone. Whether it’s trying a new career, moving to a new city, or pursuing personal growth, you’ll find yourself drawn to experiences that push boundaries. However, the fast-paced energy can also feel chaotic, and without focus you may struggle to keep up with the changes.        How It Affects Us:                                                                                                                 POSITIVE: You’ll feel inspired and open to new opportunities. Flexibility and curiosity allow you to learn and grow in unexpected ways. NEGATIVE: The energy of change might leave you feeling scattered or overwhelmed. Overindulgence in distractions or impulsive decisions could derail progress.                                                                                                                  Real-Life Relatability: Imagine a time when you’ve traveled extensively, met new people, and experienced personal transformation. That’s the energy of month 5. For example, you might take up a new hobby like photography, meet inspiring individuals, or even consider a major life change like switching careers. Advice for Balance: Focus on staying centered amid the whirlwind of change. Embrace opportunities that align with your values and goals, and avoid overcommitting. Remember, freedom isn’t about doing everything—it’s about choosing what truly matters.",
        theme: "Practical Steps: 1.	Practice clear communication in personal and professional relationships. 2.	Stay open-minded but evaluate opportunities carefully before committing. 3.	Engage in creative outlets to channel restless energy productively. Chakra Insight: The Throat Chakra governs self-expression and adaptability. Balance it by visualizing blue light and chanting HAM. Speak your truth clearly and authentically while remaining flexible in your approach to challenges "
      },
      6: {
        title: "Responsibility and Nurturing and Harmony-Sacral Chakra. Planet-Venus",
        description: "Definition and Impact: Personal month 6 is a time of nurturing, responsibility, and cultivating harmony in your relationships and environment. Venus, the planet of love, beauty, and balance, inspires a focus on emotional connections, while the Sacral Chakra enhances your ability to give and receive love. This month often marks  an increased emphasis on family, home, and caregiving responsibilities. The energy encourages you to create a harmonious balance between your personal needs and those of others. While it can be deeply fulfilling this month also tests your ability to set boundaries and avoid overextending yourself emotionally.                     How It Affects Us:	                                                                                                               POSITIVE: You’ll feel a sense of purpose and fulfillment through acts of love and service. Relationships thrive as you invest time and energy into nurturing bonds.                                                                                                      NEGAVTIVE: Taking on too many responsibilities may lead to emotional exhaustion or feelings of being unappreciated. Struggles with boundaries can leave you feeling drained.                                                                                               Real-Life Relatability: Think of a month when you are focused on creating a warm, inviting home or supporting loved ones through challenges. For example, you might help a friend through a tough time, redecorate your living space, or strengthen your relationship with a partner. Advice for Balance: While it’s important to give, remember to prioritize self-care. Create a harmonious balance between nurturing others and nurturing yourself. Embrace creativity and allow yourself moments of joy and relaxation.",
        theme: "Practical Steps: 1.	Strengthen family bonds by spending quality time with loved ones. 2.	Engage in creative activities that bring you joy, like painting or gardening. 3.	Set boundaries to avoid emotional overwhelm. Chakra Insight: The Sacral Chakra governs emotions, creativity, and relationships. Balance it by visualizing orange light and chanting VAM. Practice mindfulness to stay connected to your emotional well-being."
      },
      7: {
        title: "Introspection, Wisdom, and Spiritual Growth-Soul Star Chakra. Planet-Ketu",
        description: "Definition and Impact: Personal month 7 is deeply introspective and spiritual. It’s a time to step back from the busyness of the external world and focus inward. Ketu, the planet of detachment and spiritual enlightenment, encourages you to explore the mysteries of life and your own subconscious. The Soul Star Chakra connects you to your higher self, divine wisdom, and karmic alignment. This month isn’t about material pursuits but rather about personal growth, healing, and understanding your life’s deeper purpose. It will encourage you to explore your cosmic connection with the universe or spirituality. You may feel a strong pull to engage in activities like meditation, journaling, or studying spiritual philosophies. The energy of this month often brings clarity and insight, though it can sometimes feel isolating or overly introspective.                                                                                        How It Affects Us:	                                                                                                                     POSITIVE: You’ll develop a deeper connection with your inner self, uncover hidden talents, and gain wisdom. It’s an excellent time for learning, reflecting, and aligning with your spiritual path.                                                                        NEGAVTIVE: If unbalanced, you may feel isolated, lost in overthinking, or disconnected from the world around you. Avoid using distractions or escapism to avoid confronting your emotions.                                                                                         Real-Life Relatability: Imagine a time when you felt the need to simplify your life, spend more time alone, and seek answers to existential questions. For example, you might take a break from socializing to enroll in a meditation retreat, explore yoga, or finally start therapy to process unresolved emotions. Advice for Balance: Embrace solitude as an opportunity for growth, but avoid cutting yourself off from loved ones entirely. Balance introspection with small, meaningful connections to avoid feelings of isolation.",
        theme: "Practical Steps: 1.	Dedicate time daily to mindfulness practices like meditation or deep breathing. 2.	Journal your thoughts to process emotions and gain clarity. 3.	Read books or attend workshops that expand your spiritual or philosophical understanding. Chakra Insight: The Soul Star Chakra is your link to the divine and your soul’s higher purpose. To balance it, visualize golden light six inches above your head and chant OM SO HUM. This activates your spiritual connection and helps you feel aligned with your purpose."
      },
      8: {
        title: "Power, Manifestation, and Abundance-ThirdEye Chakra. Planet-Saturn",
        description: "Definition and Impact: Personal month 8 is a time of manifestation, material success, and empowerment. It’s a time to reap the rewards of your hard work over the past seven months. Ruled by Saturn, the planet of discipline and karma, this time emphasizes accountability and responsibility. The Third Eye Chakra enhances clarity, vision, and intuition, guiding you to make wise decisions that align with your long-term goals. The energy of this month is intense and focused, making it ideal for career advancements, financial growth, and achieving tangible results. However, it also demands balance—if you overwork yourself or focus solely on material gains, you risk burnout or losing sight of what truly matters.                                                                                      How It Affects Us:                                                                                                                 Positive: You’ll feel confident, ambitious, and ready to take control of your destiny. Success feels within reach as your efforts begin to pay off. 	                                                                                                                         Negative: Overemphasis on work or material success may lead to stress, exhaustion, or a disconnect from your emotional and spiritual needs. Real-Life Relatability: Think of it as a time when you want to be laser-focused on your career, perhaps receiving a promotion or launching a business. For example, you may take on leadership roles or start investments that require strategic thinking and persistence. This is the energy of Personal month 8—a time of progress and achievement. Advice for Balance: While it’s important to work hard, remember to nurture your relationships and personal well-being. Use your intuition to make decisions, and don’t be afraid to delegate tasks when needed.",
        theme: "Practical Steps. 1.	Set specific financial and professional goals, and create actionable plans to achieve them. 2.	Practice gratitude to stay connected to the bigger picture of life. 3.	Take breaks to recharge and avoid burnout. Chakra Insight: The Third Eye Chakra sharpens your vision and clarity. Keep it balanced by visualizing indigo light and chanting OM. Trust your intuition, and let it guide your actions."
      },
      9: {
        title: "Completion Letting Go and Reflection- Root Chakra. Planet- Mars",
        description: "Definition and Impact: Personal month 9 marks the end of a 9-month cycle, a time of closure, reflection, and letting go. Mars, the planet of action and transformation, energizes you to release what no longer serves you—whether it’s relationships, habits, or outdated beliefs. The Root Chakra supports this process by grounding you and helping you feel secure as you prepare for new beginnings. This journey from 1 to 9 if used well can be deeply transformative, offering the opportunity to heal past wounds and tie up loose ends. While it may feel bittersweet to let go, it’s necessary to create space for the fresh opportunities awaiting you in the next cycle.       How It Affects Us:                                                                                                                 Positive: You’ll feel lighter and more aligned as you release old patterns. There’s a sense of fulfillment and readiness for change. Negative: Resistance to letting go may lead to stagnation or emotional struggles. Fear of the unknown might make it challenging to embrace closure.                                                                                                                                 Real-Life Relatability: Imagine a time when you decluttered your home, ended a toxic relationship, or left a job that no longer fulfilled you. For example, you might decide to sell your childhood home, say goodbye to a long-held dream, or reconcile with someone you’ve been estranged from. Advice for Balance: Reflect on your past and acknowledge your growth. Focus on forgiveness—of yourself and others—and trust that endings are the gateway to new beginnings..",
        theme: "Practical Steps: 1.	Journal about areas of your life that need closure and take steps to address them. 2.	Practice forgiveness meditations to release resentment and find peace. 3.	Declutter your physical and emotional space to prepare for the new cycle ahead. Chakra Insight: The Root Chakra anchors you during times of transition. Balance it by visualizing red light and chanting LAM. Engage in grounding activities like walking in nature or practicing yoga to stay connected to the present moment."
      }
    };
    return meanings[month] || {
      title: "Universal Flow",
      description: "A month of balanced energy and spiritual alignment",
      theme: "Harmony and Balance"
    };
  };

  const getNumberColorAssociation = (number: number): string => {
    const colorMap: { [key: number]: string } = {
      1: "Red", 2: "Orange", 3: "Yellow", 4: "Green", 5: "Blue", 
      6: "Indigo", 7: "Violet", 8: "Pink", 9: "Gold"
    };
    return colorMap[number] || "White";
  };

  const getVibrationQualities = (number: number): string[] => {
    const qualitiesMap: { [key: number]: string[] } = {
      1: ["Leadership", "Independence", "Initiative", "Confidence", "Ambition", "Pioneering"],
      2: ["Cooperation", "Sensitivity", "Diplomacy", "Patience", "Harmony", "Partnership"],
      3: ["Creativity", "Expression", "Communication", "Joy", "Artistic", "Inspiration"],
      4: ["Stability", "Practicality", "Organization", "Determination", "Discipline", "Reliability", "Focus", "Loyalty", "Foundation", "Persistence"],
      5: ["Freedom", "Adventure", "Curiosity", "Versatility", "Change", "Communication"],
      6: ["Nurturing", "Responsibility", "Compassion", "Service", "Healing", "Family"],
      7: ["Spirituality", "Introspection", "Analysis", "Wisdom", "Mysticism", "Research"],
      8: ["Authority", "Material Success", "Power", "Business", "Achievement", "Organization"],
      9: ["Humanitarian", "Compassion", "Universal Love", "Completion", "Service", "Wisdom"]
    };
    return qualitiesMap[number] || ["Universal Energy"];
  };

  const getNumberMeaning = (number: number, type: string): { title: string; description: string } => {
    const meanings: { [key: string]: { [key: number]: { title: string; description: string } } } = {
      lifePath: {
        1: { title: "The Leader: Independent, ambitious, pioneering, confident.", description: "Your Life Path number represents the core of who you are, including your traits, challenges, and opportunities. It's calculated from your birth date and is one of the most important numbers in your numerology chart." },
        2: { title: "The Diplomat: Cooperative, sensitive, peaceful, supportive.", description: "Your life path centers around cooperation, diplomacy, and sensitivity to others. You're naturally gifted at bringing people together and creating harmony." },
        3: { title: "The Communicator: Creative, expressive, optimistic, inspiring.", description: "Self-expression, creativity, and joy are the hallmarks of your journey. You're meant to inspire others through your natural creative abilities." },
        4: { title: "The Builder: Practical, trustworthy, disciplined, stable, hardworking.", description: "Your life purpose is aligned with building solid foundations. You excel at creating order, stability, and lasting structures in all areas of life." }
      },
      destiny: {
        1: { title: "Pioneer and innovator destiny", description: "Your destiny involves breaking new ground and leading others toward new possibilities." },
        2: { title: "Diplomat and peacemaker destiny", description: "Your destiny centers around bringing harmony and cooperation to all your endeavors." },
        3: { title: "Creative self-expression destiny, communication and artistic pursuits.", description: "Your Destiny number reveals the goals you're meant to achieve in this lifetime. Derived from your full birth name, it represents your life's work and the contribution you're meant to make to the world." },
        4: { title: "Builder and organizer destiny", description: "Building, organization, and creating order are your destined work. You're meant to create lasting foundations." }
      },
      soulUrge: {
        7: { title: "Mystical and transformative soul desires", description: "Your Soul Urge number reveals your inner desires, motivations, and what your heart truly longs for. It represents your emotional self and inner cravings. This number is calculated from the vowels in your name, representing your inner truth and what drives you at a soul level." }
      },
      personality: {
        8: { title: "Authoritative and capable outer presentation", description: "How others perceive you based on your outward personality and first impressions." }
      }
    };
    
    return meanings[type]?.[number] || { 
      title: "Unique spiritual path", 
      description: "This number carries special significance in your spiritual journey." 
    };
  };

  const getChakraPlanetInfo = (number: number): { chakra: string; planet: string; description: string; remedies: string[] } => {
    const chakraPlanetMap: { [key: number]: { chakra: string; planet: string; description: string; remedies: string[] } } = {
      1: {
        chakra: "Solar Plexus Chakra",
        planet: "Sun",
        description: "Leadership and Independence. Personal power, confidence, and willpower.",
        remedies: ["Yellow color therapy", "RAM mantra 45 times/day", "Citrine crystal", "Lemon aromatherapy", "Sacred code 451"]
      },
      2: {
        chakra: "Heart Chakra", 
        planet: "Moon",
        description: "Relationships and Sensitivity. Emotional balance and self-love.",
        remedies: ["Green/pink color therapy", "YAM mantra 45 times/day", "Rose Quartz crystal", "Rose aromatherapy", "Sacred code 741"]
      },
      3: {
        chakra: "Crown Chakra",
        planet: "Jupiter", 
        description: "Creativity and Communication. Spiritual connection and enlightenment.",
        remedies: ["Violet/white color therapy", "AUM mantra 45 times/day", "Clear Quartz crystal", "Lavender aromatherapy", "Sacred code 204"]
      },
      4: {
        chakra: "Earth Star Chakra",
        planet: "Rahu",
        description: "Stability and Discipline. Deep grounding, responsibility, and trust in life.",
        remedies: ["Brown/black color therapy", "LAM mantra 45 times/day", "Smoky Quartz crystal", "Cedarwood aromatherapy", "Sacred code 264"]
      },
      5: {
        chakra: "Throat Chakra",
        planet: "Mercury",
        description: "Freedom and Adaptability. Authentic communication and adaptability.",
        remedies: ["Blue color therapy", "HAM mantra 45 times/day", "Blue Lace Agate crystal", "Peppermint aromatherapy", "Sacred code 986"]
      },
      6: {
        chakra: "Sacral Chakra",
        planet: "Venus",
        description: "Nurturing and Responsibility. Emotional stability and creative expression.",
        remedies: ["Orange color therapy", "VAM mantra 45 times/day", "Carnelian crystal", "Ylang-ylang aromatherapy", "Sacred code 639"]
      },
      7: {
        chakra: "Soul Star Chakra",
        planet: "Ketu",
        description: "Spirituality and Analysis. Transcendence and karmic healing.",
        remedies: ["Gold/white color therapy", "OM SO HUM mantra 45 times/day", "Selenite crystal", "Lotus aromatherapy", "Sacred code 56"]
      },
      8: {
        chakra: "Third Eye Chakra",
        planet: "Saturn",
        description: "Material Success and Power. Clarity, vision, and decisive action.",
        remedies: ["Indigo color therapy", "OM mantra 45 times/day", "Amethyst crystal", "Frankincense aromatherapy", "Sacred code 852"]
      },
      9: {
        chakra: "Root Chakra",
        planet: "Mars",
        description: "Humanitarian Service. Action, grounding, and completion.",
        remedies: ["Red color therapy", "LAM mantra 45 times/day", "Red Jasper crystal", "Cedarwood aromatherapy", "Sacred code 396"]
      }
    };
    return chakraPlanetMap[number] || {
      chakra: "Universal Energy",
      planet: "Cosmic Force",
      description: "Unique spiritual path",
      remedies: ["Meditation", "White light visualization", "Clear Quartz crystal"]
    };
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Navbar />

      {/* Upgrade Prompt Dialog for First-Time Users */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                Unlock Full Numerology Analysis
              </CardTitle>
              <CardDescription className="text-purple-200">
                You're viewing a basic preview. Upgrade to access the complete analysis!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-400/30">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Premium Features Include:
                </h4>
                <ul className="space-y-2 text-purple-100 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">✓</span>
                    <span>Detailed Life Path & Destiny analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">✓</span>
                    <span>Personal Year & Monthly forecasts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">✓</span>
                    <span>Chakra-Planet alignment insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">✓</span>
                    <span>Downloadable PDF reports</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradePrompt(false)}
                  className="flex-1 border-purple-400 text-purple-200 hover:bg-purple-800"
                >
                  View Basic
                </Button>
                <Link to="/pricing" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">
              <Calculator className="inline-block mr-3 h-10 w-10" />
              {healerData ? `Numerology Analysis for ${healerData.name}` : "Numerology Analysis"}
            </h1>
            <p className="text-xl opacity-90">
              Discover the hidden meanings in your numbers and unlock your spiritual blueprint
            </p>
            {healerData ? (
              <div className="space-y-3">
                <p className="text-l opacity-80 text-yellow-200">
                  Analysis generated by healer for {healerData.name} born on {new Date(healerData.birthDate).toLocaleDateString()}
                </p>
                {numerology && (
                  <Button
                    onClick={generatePDF}
                    disabled={isGeneratingPDF}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Numerology Report
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-l opacity-80 text-black">
                These reading are only for the date provided by you at log in. Please create a profile for another detailed analysis.
              </p>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!targetBirthDate ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>Please provide your birth date to calculate your numerology</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoadingNumerology}>
                    {isLoadingNumerology ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      "Calculate My Numbers"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : isLoadingNumerology ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Calculating Your Numbers</h3>
            <p className="text-gray-600">Analyzing your spiritual blueprint...</p>
          </div>
        ) : numerology ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Core Numbers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  Your Core Numbers
                </CardTitle>
                <CardDescription>The fundamental aspects of your numerological profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Life Path Number - Featured Card */}
                  <div className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white">{numerology.lifePathNumber}</span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-purple-900 text-xl mb-1">Life Path Number {numerology.lifePathNumber}</h3>
                        <p className="text-purple-600 font-medium">Your life's journey and core purpose</p>
                      </div>
                    </div>
                    
                    {/* Quick Summary Grid */}
                    <div className="grid grid-rows-1 md:grid-rows-1">
                      {(() => {
                        const text = getLifePathMeaning(numerology.lifePathNumber);
                        const colorMatch = text.match(/Colour?:\s*([^,]+)/i);
                        const chakraMatch = text.match(/Chakra:\s*([^.]+)/i);
                        const planetMatch = text.match(/Planet:\s*(\w+)/i);
                        const mantraMatch = text.match(/Mantra[^:]*:\s*([^\d]+\d+\s*times\/day)/i);
                        return (
                          <>
                            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                              <div className="text-xs text-gray-500 uppercase mb-1">Color</div>
                              <div className="font-semibold text-purple-800">{colorMatch?.[1]?.trim() || 'N/A'}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                              <div className="text-xs text-gray-500 uppercase mb-1">Chakra</div>
                              <div className="font-semibold text-purple-800">{chakraMatch?.[1]?.trim().split('.')[0] || 'N/A'}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                              <div className="text-xs text-gray-500 uppercase mb-1">Planet</div>
                              <div className="font-semibold text-purple-800">{planetMatch?.[1]?.trim() || 'N/A'}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                              <div className="text-xs text-gray-500 uppercase mb-1">Mantra</div>
                              <div className="font-semibold text-purple-800 text-xs">{mantraMatch?.[1]?.trim().split(' ')[0] || 'N/A'}</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Detailed Info Accordion */}
                    <div className="bg-white rounded-lg border border-purple-100 overflow-hidden">
                      <details className="group">
                        <summary className="px-4 py-3 bg-purple-100 cursor-pointer font-semibold text-purple-800 flex justify-between items-center">
                          View Full Life Path Details
                          <span className="group-open:rotate-180 transition-transform">▼</span>
                          <span className="">PPI=Positive Psychology Intervention</span>
                        </summary>
                        <div className="p-4 max-h-80 overflow-y-auto">
                          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                            {getLifePathMeaning(numerology.lifePathNumber).split(/(?=(?:Planet|Angel|Karmic|Healing Method|Remedies|Prayer|Deity|Self-Healing):)/i).map((section, idx) => {
                              const colonIndex = section.indexOf(':');
                              if (colonIndex === -1 || colonIndex > 30) return <p key={idx}>{section.trim()}</p>;
                              
                              const heading = section.substring(0, colonIndex).trim();
                              const content = section.substring(colonIndex + 1).trim();
                              
                              if (!heading || !content) return null;
                              
                              return (
                                <div key={idx} className="pb-3 border-b border-gray-100 last:border-b-0">
                                  <h5 className="font-bold text-purple-800 text-xs uppercase mb-1">{heading}</h5>
                                  <p className="text-gray-600">{content.substring(0, 1000)}{content.length > 1000 ? '...' : ''}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-white">{numerology.destinyNumber}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-blue-800 mb-1">Destiny Number</h3>
                      <p className="text-sm text-blue-600 mb-1">Your life's mission and calling</p>
                      <p className="text-xs text-blue-500">{getDestinyMeaning(numerology.destinyNumber)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-white">{numerology.personalityNumber}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-green-800 mb-1">Decision-Making Chakra :Personality Number</h3>
                      <p className="text-sm text-green-600 mb-1">Most of your decisions will be based on the qualities of this chakra</p>
                      <p className="text-xs text-green-500">Influences your decision-making patterns</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                    <div className="flex-shrink-0 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-white">{calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-red-800 mb-1">Dominant Soul Chakra</h3>
                      <p className="text-sm text-red-600 mb-1">Your soul wants you to operate from the positive and balanced qualities of that chakra</p>
                      <p className="text-xs text-red-500">Your greatest challenge area</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chakra-Planet Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5 text-white" />
                  Chakra-Planet Analysis
                </CardTitle>
                <CardDescription>Detailed spiritual insights based on your numerological profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Decision-Making Chakra */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Decision-Making Chakra</h3>
                    {(() => {
                      const info = getChakraPlanetInfo(numerology.personalityNumber);
                      return (
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <div className="mb-3">
                            <div className="text-2xl font-bold text-green-600">{numerology.personalityNumber}</div>
                            <div className="text-sm text-green-700">{info.chakra} • {info.planet}</div>
                          </div>
                          <p className="text-sm text-green-800 mb-3">{info.description}</p>
                          <div>
                            <h4 className="font-medium text-green-800 mb-2">Recommended Remedies:</h4>
                            <ul className="text-xs text-green-700 space-y-1">
                              {info.remedies.map((remedy, index) => (
                                <li key={index}>• {remedy}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Dominant Soul Chakra */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Dominant Soul Chakra</h3>
                    {(() => {
                      const dominantSoulNumber = calculateDominantSoulChakra(user?.birthDate || "1990-01-01");
                      const info = getChakraPlanetInfo(dominantSoulNumber);
                      return (
                        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                          <div className="mb-3">
                            <div className="text-2xl font-bold text-red-600">{dominantSoulNumber}</div>
                            <div className="text-sm text-red-700">{info.chakra} • {info.planet}</div>
                          </div>
                          <p className="text-sm text-red-800 mb-3">{info.description}</p>
                          <div>
                            <h4 className="font-medium text-red-800 mb-2">Healing Remedies:</h4>
                            <ul className="text-xs text-red-700 space-y-1">
                              {info.remedies.map((remedy, index) => (
                                <li key={index}>• {remedy}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Interpretation */}
            <Card>
              <CardHeader>
                <CardTitle>Your Numerological Interpretation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white leading-relaxed">{numerology.interpretation}</p>
              </CardContent>
            </Card>

            {/* Tab-Based Numerology Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-indigo-600" />
                  Your Numerology Profile
                </CardTitle>
                <CardDescription>Based on your name and birth date</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="lifePath" className="w-full">
                  <TabsList className="grid w-full grid-rows-2 grid-cols-3 h-30 align-center">
                    <TabsTrigger value="lifePath">Life Path</TabsTrigger>
                    <TabsTrigger value="destiny">Destiny</TabsTrigger>
                    <TabsTrigger value="soulUrge">Soul Urge</TabsTrigger>
                    <TabsTrigger value="personality">Personality</TabsTrigger>
                    <TabsTrigger value="personalYear">Personal Year</TabsTrigger>
                  </TabsList>

                  {/* Life Path Tab */}
                  <TabsContent value="lifePath" className="space-y-6 mt-6">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                           style={{ backgroundColor: getNumberColorAssociation(numerology.lifePathNumber).toLowerCase() === 'green' ? '#22c55e' : '#6366f1' }}>
                        {numerology.lifePathNumber}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Life Path Number: {numerology.lifePathNumber}</h3>
                      <p className="text-white mb-2">Associated Color: <span className="font-medium text-white">{getNumberColorAssociation(numerology.lifePathNumber)}</span></p>
                      <div className="text-sm text-white italic mb-4">
                        {getNumberColorAssociation(numerology.lifePathNumber) === 'Green' && 
                          "Balanced and nurturing, green represents growth, harmony, and practical manifestation. It encourages stability, healing, and the ability to build enduring foundations in life."
                        }
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{getNumberMeaning(numerology.lifePathNumber, 'lifePath').title}</h4>
                      <p className="text-sm text-gray-700">{getNumberMeaning(numerology.lifePathNumber, 'lifePath').description}</p>
                    </div>

                    {/* Vibration Qualities */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Vibration Qualities</h4>
                      <div className="flex flex-wrap gap-2">
                        {getVibrationQualities(numerology.lifePathNumber).map((quality, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {quality}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Interpretation */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <h5 className="font-medium text-purple-800 mb-2">Advanced Life Path Interpretation</h5>
                      <p className="text-sm text-purple-700 mb-2">
                        As a Life Path {numerology.lifePathNumber}, your life purpose is aligned with building solid foundations.
                      </p>
                      <p className="text-sm text-purple-700">
                        The color vibration of {getNumberColorAssociation(numerology.lifePathNumber)} supports your life path by enhancing your natural balance and growth.
                      </p>
                    </div>

                    {/* Dominant Soul Chakra Section */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h5 className="font-medium text-red-800 mb-2">Dominant Soul Chakra</h5>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                          {calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Your greatest challenge area</p>
                          <p className="text-xs text-red-600">Maximum challenges in this chakra</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Destiny Tab */}
                  <TabsContent value="destiny" className="space-y-6 mt-6">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                           style={{ backgroundColor: getNumberColorAssociation(numerology.destinyNumber).toLowerCase() === 'yellow' ? '#eab308' : '#3b82f6' }}>
                        {numerology.destinyNumber}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Destiny Number: {numerology.destinyNumber}</h3>
                      <p className="text-white mb-2">Associated Color: <span className="font-medium text-white">{getNumberColorAssociation(numerology.destinyNumber)}</span></p>
                      <div className="text-sm text-gray-500 italic mb-4">
                        {getNumberColorAssociation(numerology.destinyNumber) === 'Yellow' && 
                          "Bright and uplifting, yellow represents optimism, mental clarity, and self-expression. It encourages intellectual growth, communication skills, and the ability to share ideas with confidence."
                        }
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{getNumberMeaning(numerology.destinyNumber, 'destiny').title}</h4>
                      <p className="text-sm text-gray-700">{getNumberMeaning(numerology.destinyNumber, 'destiny').description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-3">Vibration Qualities</h4>
                      <div className="flex flex-wrap gap-2">
                        {getVibrationQualities(numerology.destinyNumber).map((quality, index) => (
                          <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            {quality}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Dominant Soul Chakra Section */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h5 className="font-medium text-red-800 mb-2">Dominant Soul Chakra</h5>
                      <div className="flex items-center gap-3 text-white">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg text-white">
                          {calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Your greatest challenge area</p>
                          <p className="text-xs text-red-600">Maximum challenges in this chakra</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Soul Urge Tab */}
                  <TabsContent value="soulUrge" className="space-y-6 mt-6">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                           style={{ backgroundColor: getNumberColorAssociation(numerology.soulUrgeNumber).toLowerCase() === 'violet' ? '#8b5cf6' : '#6366f1' }}>
                        {numerology.soulUrgeNumber}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Soul Urge Number: {numerology.soulUrgeNumber}</h3>
                      <p className="text-white mb-2">Associated Color: <span className="font-medium text-white">{getNumberColorAssociation(numerology.soulUrgeNumber)}</span></p>
                      <div className="text-sm text-gray-500 italic mb-4">
                        {getNumberColorAssociation(numerology.soulUrgeNumber) === 'Violet' && 
                          "Mystical and transformative, violet represents spiritual wisdom, introspection, and higher consciousness. It encourages deep analysis, inner knowing, and connection to universal truths."
                        }
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{getNumberMeaning(numerology.soulUrgeNumber, 'soulUrge').title}</h4>
                      <p className="text-sm text-gray-700">{getNumberMeaning(numerology.soulUrgeNumber, 'soulUrge').description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-3">Soul Qualities</h4>
                      <div className="flex flex-wrap gap-2">
                        {getVibrationQualities(numerology.soulUrgeNumber).map((quality, index) => (
                          <Badge key={index} variant="secondary" className="bg-violet-100 text-violet-800 border-violet-200">
                            {quality}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Dominant Soul Chakra Section */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h5 className="font-medium text-red-800 mb-2">Dominant Soul Chakra</h5>
                      <div className="text-center mb-3">
                        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                          {calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}
                        </div>
                        <p className="text-sm text-red-700 font-medium">Universal Energy • Cosmic Force</p>
                      </div>
                      <p className="text-xs text-red-600 text-center">Unique spiritual path</p>
                      
                      <div className="mt-3">
                        <h6 className="font-medium text-red-800 mb-2 text-sm">Healing Remedies:</h6>
                        <ul className="text-xs text-red-700 space-y-1">
                          <li>• Meditation</li>
                          <li>• White light visualization</li>
                          <li>• Clear Quartz crystal</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Personality Tab */}
                  <TabsContent value="personality" className="space-y-6 mt-6">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                           style={{ backgroundColor: getNumberColorAssociation(numerology.personalityNumber).toLowerCase() === 'pink' ? '#ec4899' : '#6366f1' }}>
                        {numerology.personalityNumber}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Personality Number: {numerology.personalityNumber}</h3>
                      <p className="text-white mb-2">Associated Color: <span className="font-medium text-white">{getNumberColorAssociation(numerology.personalityNumber)}</span></p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">{getNumberMeaning(numerology.personalityNumber, 'personality').title}</h4>
                      <p className="text-sm text-gray-700">{getNumberMeaning(numerology.personalityNumber, 'personality').description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-3">Vibration Qualities</h4>
                      <div className="flex flex-wrap gap-2">
                        {getVibrationQualities(numerology.personalityNumber).map((quality, index) => (
                          <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
                            {quality}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Dominant Soul Chakra Section */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h5 className="font-medium text-red-800 mb-2">Dominant Soul Chakra</h5>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                          {calculateDominantSoulChakra(user?.birthDate || "1990-01-01")}
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-medium">Your greatest challenge area</p>
                          <p className="text-xs text-red-600">Maximum challenges in this chakra</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Personal Year Tab */}
                  <TabsContent value="personalYear" className="space-y-6 mt-6">
                    {(() => {
                      // CRITICAL FIX: Use the correct birth date from healer input
                      const birthDateToUse = healerData?.birthDate || targetBirthDate || user?.birthDate || "1990-01-01";
                      const personalYear = calculatePersonalYear(birthDateToUse);
                      const personalYearInfo = getPersonalYearMeaning(personalYear);
                      return (
                        <>
                          <div className="text-center">
                            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                              {personalYear}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Personal Year: {personalYear}</h3>
                            <p className="text-black-600 mb-2">2026 Forecast</p>
                            <div className="text-sm text-black-500 italic mb-4">
                              Based on your birth date and the current year
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
                            <h4 className="font-semibold text-indigo-800 mb-3">{personalYearInfo.title}</h4>
                            <p className="text-sm text-indigo-700 mb-4">{personalYearInfo.description}</p>
                            
                            <div className="bg-white rounded-lg p-4 border border-indigo-100">
                              <h5 className="font-medium text-indigo-800 mb-3">Focus Areas for 2026</h5>
                              <ul className="space-y-2">
                                {personalYearInfo.focus.map((item, index) => (
                                  <li key={index} className="flex items-start text-sm text-indigo-700">
                                    <span className="text-indigo-500 mr-2 mt-1">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Personal Year Calculation */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">How Your Personal Year is Calculated</h4>
                            <div className="text-sm text-gray-700 space-y-2">
                              <p>Personal Year = (Birth Day + Birth Month + Current Year) reduced to single digit</p>
                              {(() => {
                                // CRITICAL FIX: Use the correct birth date from healer input or form data
                                const birthDateToUse = healerData?.birthDate || targetBirthDate || user?.birthDate || "1990-01-01";
                                const birthDate = new Date(birthDateToUse);
                                const day = birthDate.getDate();
                                const month = birthDate.getMonth() + 1;
                                const currentYear = 2026;
                                
                                // CORRECTED CALCULATION: Use actual month and day digits, not just numbers
                                const dayDigits = day.toString().split('').map(d => parseInt(d));
                                const monthDigits = month.toString().split('').map(d => parseInt(d));
                                const yearDigits = currentYear.toString().split('').map(d => parseInt(d));
                                
                                const daySum = dayDigits.reduce((a, b) => a + b, 0);
                                const monthSum = monthDigits.reduce((a, b) => a + b, 0);
                                const yearSum = yearDigits.reduce((a, b) => a + b, 0);
                                const totalSum = daySum + monthSum + yearSum;
                                
                                // CRITICAL FIX: Properly reduce to single digit
                                const reduceToSingleDigit = (num: number): number => {
                                  while (num > 9 && ![11, 22, 33].includes(num)) {
                                    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                                  }
                                  return num;
                                };
                                
                                const reducedPersonalYear = reduceToSingleDigit(totalSum);
                                
                                return (
                                  <div className="bg-white p-3 rounded border">
                                    <p>Day: {dayDigits.join(' + ')} = {daySum} + Month: {monthDigits.join(' + ')} = {monthSum} + Year digits: {yearDigits.join(' + ')} = {yearSum}</p>
                                    <p>Total: {daySum} + {monthSum} + {yearSum} = {totalSum}</p>
                                    {totalSum > 9 ? (
                                      <p>Reduced to single digit: {totalSum.toString().split('').join(' + ')} = <span className="font-medium text-indigo-600">{reducedPersonalYear}</span></p>
                                    ) : (
                                      <p>Final result: <span className="font-medium text-indigo-600">{reducedPersonalYear}</span></p>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Vibration Qualities for Personal Year */}
                          <div>
                            <h4 className="font-semibold text-purple-800 mb-3">2026 Energy Qualities</h4>
                            <div className="flex flex-wrap gap-2">
                              {getVibrationQualities(personalYear).map((quality, index) => (
                                <Badge key={index} variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                                  {quality}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Personal Year Guidance */}
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <h4 className="font-semibold text-purple-800 mb-3">Spiritual Guidance for 2026</h4>
                            <p className="text-sm text-purple-700">
                              This Personal Year {personalYear} invites you to embrace {personalYearInfo.title.toLowerCase()} energy. 
                              Focus on the themes of {getVibrationQualities(personalYear).slice(0, 3).join(', ').toLowerCase()} 
                              as you navigate through 2026. This is a time for {personalYear === 1 ? 'new beginnings' : personalYear === 9 ? 'completion and preparation' : 'steady progress'} 
                              in your spiritual journey.
                            </p>
                          </div>

                          {/* Personal Month Section */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                            <h4 className="font-semibold text-blue-800 mb-4">Personal Month Forecast 2026</h4>
                            <p className="text-sm text-blue-700 mb-4">
                              Each month carries its own energy based on your Personal Year {personalYear}. The monthly cycle progresses from 1-9 and repeats.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {[
                                { name: "January", number: 1 },
                                { name: "February", number: 2 },
                                { name: "March", number: 3 },
                                { name: "April", number: 4 },
                                { name: "May", number: 5 },
                                { name: "June", number: 6 },
                                { name: "July", number: 7 },
                                { name: "August", number: 8 },
                                { name: "September", number: 9 },
                                { name: "October", number: 10 },
                                { name: "November", number: 11 },
                                { name: "December", number: 12 }
                              ].map((month) => {
                                const personalMonth = calculatePersonalMonth(personalYear, month.number);
                                const monthInfo = getPersonalMonthMeaning(personalMonth);
                                const currentMonth = new Date().getMonth() + 1;
                                const isCurrentMonth = month.number === currentMonth;
                                
                                return (
                                  <div 
                                    key={month.name} 
                                    className={`bg-white rounded-lg p-4 border transition-all hover:shadow-md ${
                                      isCurrentMonth ? 'border-blue-400 ring-2 ring-blue-200' : 'border-blue-100'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-blue-800">{month.name}</h5>
                                      {isCurrentMonth && (
                                        <Badge className="bg-blue-100 text-blue-800 text-xs">Current</Badge>
                                      )}
                                    </div>
                                    
                                    <div className="text-center mb-3">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                                        {personalMonth}
                                      </div>
                                      <div className="text-xs text-blue-600 font-medium">{monthInfo.theme}</div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <h6 className="text-sm font-medium text-blue-800">{monthInfo.title}</h6>
                                      <p className="text-xs text-blue-700 leading-relaxed">
                                        {monthInfo.description}
                                      </p>
                                    </div>
                                    
                                    <div className="mt-3 pt-2 border-t border-blue-100">
                                      <div className="text-xs text-blue-600 mb-2">
                                        Personal Year {personalYear} + Month {month.number} = {personalMonth}
                                      </div>
                                      
                                      {/* Monthly Remedy */}
                                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-100">
                                        <h6 className="text-xs font-semibold text-amber-800 mb-2">Monthly Remedy</h6>
                                        <div className="space-y-1">
                                          <div className="text-xs text-amber-700">
                                            <span className="font-medium">Color:</span> {getMonthlyRemedy(personalMonth).color}
                                          </div>
                                          <div className="text-xs text-amber-700">
                                            <span className="font-medium">Mantra:</span> {getMonthlyRemedy(personalMonth).mantra}
                                          </div>
                                          <div className="text-xs text-amber-700">
                                            <span className="font-medium">Crystal:</span> {getMonthlyRemedy(personalMonth).crystal}
                                          </div>
                                          <div className="text-xs text-amber-700">
                                            <span className="font-medium">Sacred Code:</span> {getMonthlyRemedy(personalMonth).sacredCode}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="mt-6 bg-white rounded-lg p-4 border border-blue-100">
                              <h5 className="font-medium text-blue-800 mb-2">How Personal Months Work</h5>
                              <div className="text-sm text-blue-700 space-y-1">
                                <p>• Personal Month = Personal Year + Calendar Month (reduced to single digit)</p>
                                <p>• The cycle flows from 1-9 and repeats throughout the year</p>
                                <p>• Each month brings specific opportunities aligned with its numerological energy</p>
                                <p>• Use these monthly themes to plan important activities and decisions</p>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </TabsContent>

                </Tabs>
              </CardContent>
            </Card>

            {/* Comprehensive Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Comprehensive Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Color Vibrations */}
                  <div>
                    <h4 className="font-semibold text-white mb-3">Color Vibrations</h4>
                    <div className="flex flex-wrap gap-3">
                      <Badge className="bg-green-100 text-green-800">Life Path: {getNumberColorAssociation(numerology.lifePathNumber)}</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">Destiny: {getNumberColorAssociation(numerology.destinyNumber)}</Badge>
                      <Badge className="bg-violet-100 text-violet-800">Soul Urge: {getNumberColorAssociation(numerology.soulUrgeNumber)}</Badge>
                      <Badge className="bg-pink-100 text-pink-800">Personality: {getNumberColorAssociation(numerology.personalityNumber)}</Badge>
                      <Badge className="bg-green-100 text-green-800">Soul Chakra: {getNumberColorAssociation(numerology.soulChakraNumber)}</Badge>
                    </div>
                  </div>

                  {/* Key Strengths and Challenges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-3">Key Strengths</h4>
                      <ul className="space-y-2 text-sm text-white">
                        <li className="flex items-start"><span className="text-green-500 mr-2">•</span>Natural {getNumberColorAssociation(numerology.lifePathNumber)} energy enhances your leadership abilities</li>
                        <li className="flex items-start"><span className="text-green-500 mr-2">•</span>Your {getNumberColorAssociation(numerology.destinyNumber)} vibration amplifies your communication skills</li>
                        <li className="flex items-start"><span className="text-green-500 mr-2">•</span>The {getNumberColorAssociation(numerology.soulUrgeNumber)} influence strengthens your intuitive abilities</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-3">Potential Challenges</h4>
                      <ul className="space-y-2 text-sm text-white">
                        <li className="flex items-start text-white"><span className="text-black-500 mr-2">•</span>Balancing {getNumberColorAssociation(numerology.lifePathNumber)} intensity in daily interactions</li>
                        <li className="flex items-start text-white"><span className="text-black-500 mr-2">•</span>Integrating {getNumberColorAssociation(numerology.destinyNumber)} energy with practical matters</li>
                        <li className="flex items-start text-white"><span className="text-black-500 mr-2">•</span>Managing the sensitivity that comes with {getNumberColorAssociation(numerology.soulUrgeNumber)} vibrations</li>
                      </ul>
                    </div>
                  </div>

                  {/* Spiritual Guidance */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">Spiritual Guidance</h4>
                    <p className="text-sm text-purple-700">
                      Focus on harmonizing the {getNumberColorAssociation(numerology.lifePathNumber)} and {getNumberColorAssociation(numerology.destinyNumber)} energies in your numerological blueprint for optimal growth and spiritual development.
                    </p>
                  </div>

                  {/* Complete Interpretation */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Complete Interpretation</h4>
                    <p className="text-sm text-gray-700">{numerology.interpretation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Associations */}
            {numerology.colorAssociations && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Energy Colors</CardTitle>
                  <CardDescription>Colors that resonate with your numerological vibrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {numerology.colorAssociations.lifePathColor && (
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white shadow-lg" 
                          style={{ backgroundColor: numerology.colorAssociations.lifePathColor.toLowerCase() }}
                        ></div>
                        <div className="font-medium">{numerology.colorAssociations.lifePathColor}</div>
                        <div className="text-sm text-gray-600">Life Path</div>
                      </div>
                    )}
                    {numerology.colorAssociations.destinyColor && (
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white shadow-lg" 
                          style={{ backgroundColor: numerology.colorAssociations.destinyColor.toLowerCase() }}
                        ></div>
                        <div className="font-medium">{numerology.colorAssociations.destinyColor}</div>
                        <div className="text-sm text-gray-600">Destiny</div>
                      </div>
                    )}
                    {numerology.colorAssociations.soulUrgeColor && (
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white shadow-lg" 
                          style={{ backgroundColor: numerology.colorAssociations.soulUrgeColor.toLowerCase() }}
                        ></div>
                        <div className="font-medium">{numerology.colorAssociations.soulUrgeColor}</div>
                        <div className="text-sm text-gray-600">Soul Urge</div>
                      </div>
                    )}
                    {numerology.colorAssociations.personalityColor && (
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white shadow-lg" 
                          style={{ backgroundColor: numerology.colorAssociations.personalityColor.toLowerCase() }}
                        ></div>
                        <div className="font-medium">{numerology.colorAssociations.personalityColor}</div>
                        <div className="text-sm text-gray-600">Personality</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths and Challenges */}
            {(numerology.strengths || numerology.challenges) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {numerology.strengths && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Your Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {numerology.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span className="text-black-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {numerology.challenges && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-600">Areas for Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {numerology.challenges.map((challenge, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Guidance */}
            {numerology.guidance && (
              <Card>
                <CardHeader>
                  <CardTitle>Spiritual Guidance</CardTitle>
                  <CardDescription>Personalized insights for your journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-black-700 leading-relaxed">{numerology.guidance}</p>
                </CardContent>
              </Card>
            )}

            {/* Healer Notes Section - Only for Healers */}
            {numerology && user?.userType === "healer" && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5" />
                    Professional Healer Notes
                  </CardTitle>
                  <CardDescription className="text-white">
                    Add your professional insights and recommendations for this numerology analysis
                  </CardDescription>
                  <CardDescription className="text-white">
                   Download the PDF from the top of the page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your professional notes, insights, and recommendations here..."
                    value={healerNotes}
                    onChange={(e) => setHealerNotes(e.target.value)}
                    rows={6}
                    className="min-h-[120px] border-orange-200 focus:border-orange-400"
                  />
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={saveNotes}
                      disabled={isSavingNotes || !healerNotes.trim()}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {isSavingNotes ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Notes
                    </Button>
                    
                    
                  </div>
                  
                  {healerNotes.trim() && (
                    <div className="text-sm text-orange-600 mt-2">
                      💡 Tip: Save your notes before downloading the PDF to include them in the report
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : numerologyError ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Unable to Calculate Numerology</h3>
            <p className="text-gray-600 mb-4">Please check your birth date and try again.</p>
            <Button onClick={() => setShowForm(true)}>
              Enter Information Again
            </Button>
          </div>
        ) : null}
      </main>
      
      <MobileNavigation />
    </div>
  );
}