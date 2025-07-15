import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Loader2,
  User,
  MessageSquare,
  TrendingUp,
  Users,
  Activity,
  Eye,
  Palette,
  Calculator,
  BarChart3,
  Download,
  Edit3,
  Save,
  X,
  Plus,
  FileText
} from "lucide-react";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

interface HealerBooking {
  id: number;
  userId: number;
  healerId: number;
  message?: string;
  status: string;
  healerResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

interface HealerAnalytics {
  totalBookings: number;
  recentBookings: number;
  acceptedBookings: number;
  rejectedBookings: number;
  pendingBookings: number;
  totalClients: number;
  acceptanceRate: number;
}

interface BookingTrend {
  date: string;
  bookings: number;
  accepted: number;
  rejected: number;
  pending: number;
}

interface AuraReading {
  id: number;
  userId: number;
  name: string;
  imageUrl: string;
  dominantColor: string;
  secondaryColor: string;
  energyLevel: number;
  analysis: string;
  createdAt: string;
}

interface NumerologyReading {
  id: number;
  userId: number;
  name: string;
  birthDate: string;
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  interpretation: string;
  createdAt: string;
}

// Healer Numerology Input Component
function HealerNumerologyInput({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and birth date",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/healer-numerology", {
        name: name.trim(),
        birthDate
      });

      if (response.ok) {
        toast({
          title: "Numerology Reading Created",
          description: `Personal numerology reading for ${name} has been generated`,
        });
        
        // Reset form
        setName("");
        setBirthDate("");
        
        // Refresh the readings list
        queryClient.invalidateQueries({ queryKey: ['/api/numerology-readings'] });
        onSuccess();
      } else {
        throw new Error("Failed to create numerology reading");
      }
    } catch (error) {
      console.error("Error creating numerology reading:", error);
      toast({
        title: "Error",
        description: "Failed to create numerology reading. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Person's Name
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            className="w-full"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date
          </label>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full"
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Numerology Reading...
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4 mr-2" />
            Generate Personal Numerology Reading
          </>
        )}
      </Button>
    </form>
  );
}

// Comprehensive Aura Reading Card Component with Full Analysis
function DetailedAuraReadingCard({ reading }: { reading: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(reading.healerNotes || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateReadingMutation = useMutation({
    mutationFn: async (notes: string) => {
      await apiRequest('PATCH', `/api/aura-readings/${reading.id}/notes`, { healerNotes: notes });
    },
    onSuccess: () => {
      toast({
        title: "Notes Updated",
        description: "Your reading notes have been saved successfully."
      });
      setIsEditing(false);
    }
  });

  const saveNotes = () => {
    updateReadingMutation.mutate(editedNotes);
  };

  // Parse JSON fields safely
  const parseJsonField = (field: string) => {
    try {
      return JSON.parse(field || '{}');
    } catch {
      return {};
    }
  };

  const chakraActivity = parseJsonField(reading.chakraActivity);
  const zones = parseJsonField(reading.zones);
  const colorMeanings = parseJsonField(reading.colorMeanings);
  const personalityTraits = parseJsonField(reading.personalityTraits);
  const auraColorSpectrum = parseJsonField(reading.auraColorSpectrum);

  // Color mapping for visualization
  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'Red': 'from-red-400 to-red-600',
      'Orange': 'from-orange-400 to-orange-600',
      'Yellow': 'from-yellow-400 to-yellow-600',
      'Green': 'from-green-400 to-green-600',
      'Blue': 'from-blue-400 to-blue-600',
      'Indigo': 'from-indigo-400 to-indigo-600',
      'Violet': 'from-violet-400 to-violet-600',
      'White': 'from-gray-100 to-gray-300',
      'Black': 'from-gray-800 to-gray-900',
      'Gold': 'from-yellow-300 to-yellow-500',
      'Silver': 'from-gray-300 to-gray-500',
      'Brown': 'from-amber-600 to-amber-800'
    };
    return colorMap[color] || 'from-gray-400 to-gray-600';
  };

  // Enhanced PDF Download Function with Screenshot Capture of All Tabs
  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Get healer name from user
      const healerName = user?.username || 'Professional Healer';
      
      // Create professional header
      pdf.setFontSize(24);
      pdf.setTextColor(147, 51, 234);
      pdf.text('HEALER PROFESSIONAL REPORT', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Healer: ${healerName}`, pageWidth / 2, 35, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setTextColor(30, 41, 59);
      pdf.text(`Client: ${reading.name}`, pageWidth / 2, 45, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Analysis Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy 'at' h:mm a")}`, pageWidth / 2, 55, { align: 'center' });
      
      // Add a horizontal line
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.5);
      pdf.line(20, 65, pageWidth - 20, 65);
      
      // Get the tab container element
      const tabContainer = document.querySelector(`[data-reading-id="${reading.id}"]`);
      if (!tabContainer) {
        throw new Error('Tab container not found');
      }
      
      const tabs = ['overview', 'chakras', 'colors', 'analysis'];
      const tabNames = {
        overview: 'Overview - Aura Colors & Spiritual Guidance',
        chakras: 'Chakra Activity Levels',
        colors: 'Color Meanings & Interpretations',
        analysis: 'Complete Detailed Analysis'
      };
      
      // Add processed aura image if available
      if (reading.processedAuraImage) {
        try {
          pdf.addPage();
          
          pdf.setFontSize(18);
          pdf.setTextColor(147, 51, 234);
          pdf.text('AURA VISUALIZATION', pageWidth / 2, 25, { align: 'center' });
          
          // Add image centered
          const imgWidth = 160;
          const imgHeight = 90; // 16:9 aspect ratio
          const imgX = (pageWidth - imgWidth) / 2;
          
          pdf.addImage(reading.processedAuraImage, 'JPEG', imgX, 35, imgWidth, imgHeight);
          
          pdf.setFontSize(12);
          pdf.setTextColor(107, 114, 128);
          pdf.text('Processed Aura Analysis Visualization', pageWidth / 2, 135, { align: 'center' });
          
        } catch (error) {
          console.error('Error adding aura image to PDF:', error);
        }
      }
      
      // Capture each tab
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const tabName = tabNames[tab];
        
        // Switch to the tab
        setActiveTab(tab);
        
        // Wait for tab to render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find the tab content
        const tabContent = tabContainer.querySelector(`[data-state="active"]`);
        if (!tabContent) {
          console.error(`Tab content not found for ${tab}`);
          continue;
        }
        
        // Capture screenshot of the tab
        const canvas = await html2canvas(tabContent as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: tabContent.scrollWidth,
          height: tabContent.scrollHeight
        });
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');
        
        // Add new page for each tab
        pdf.addPage();
        
        // Add tab title
        pdf.setFontSize(18);
        pdf.setTextColor(147, 51, 234);
        pdf.text(`TAB ${i + 1}: ${tabName.toUpperCase()}`, 20, 25);
        
        // Add subtitle with client info
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        pdf.text(`Client: ${reading.name} | Healer: ${healerName}`, 20, 35);
        
        // Add horizontal line
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.5);
        pdf.line(20, 40, pageWidth - 20, 40);
        
        // Calculate image dimensions to fit page
        const maxWidth = pageWidth - 40;
        const maxHeight = pageHeight - 60;
        
        const imgWidth = Math.min(maxWidth, canvas.width * 0.264583); // Convert pixels to mm
        const imgHeight = Math.min(maxHeight, canvas.height * 0.264583);
        
        // Center the image
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = 50;
        
        // Add the screenshot to PDF
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);
        
        // Add tab number at bottom
        pdf.setFontSize(10);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`Tab ${i + 1} of ${tabs.length}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
      
      // Add healer notes page
      if (reading.healerNotes || editedNotes) {
        pdf.addPage();
        
        pdf.setFontSize(18);
        pdf.setTextColor(147, 51, 234);
        pdf.text('PROFESSIONAL HEALER NOTES', 20, 25);
        
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        pdf.text(`Healer: ${healerName}`, 20, 35);
        pdf.text(`Client: ${reading.name}`, 20, 45);
        
        // Add horizontal line
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.5);
        pdf.line(20, 50, pageWidth - 20, 50);
        
        // Add notes in a styled box
        pdf.setFillColor(254, 252, 232);
        pdf.rect(15, 60, pageWidth - 30, 80, 'F');
        pdf.setDrawColor(251, 191, 36);
        pdf.setLineWidth(1);
        pdf.rect(15, 60, pageWidth - 30, 80, 'S');
        
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        const notes = editedNotes || reading.healerNotes || "No professional notes added yet.";
        const notesLines = pdf.splitTextToSize(notes, pageWidth - 40);
        pdf.text(notesLines, 20, 70);
      }
      
      // Add final footer page
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.setTextColor(147, 51, 234);
      pdf.text('REPORT SUMMARY', pageWidth / 2, 50, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Professional Healer: ${healerName}`, pageWidth / 2, 70, { align: 'center' });
      pdf.text(`Client Analyzed: ${reading.name}`, pageWidth / 2, 85, { align: 'center' });
      pdf.text(`Energy Level: ${reading.energyLevel}/10`, pageWidth / 2, 100, { align: 'center' });
      pdf.text(`Analysis Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy")}`, pageWidth / 2, 115, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text('This report contains complete screenshot captures of all aura analysis tabs', pageWidth / 2, 140, { align: 'center' });
      pdf.text('Generated by Aurfy Professional Healer Dashboard', pageWidth / 2, 150, { align: 'center' });
      
      // Save PDF
      const timestamp = format(new Date(reading.createdAt), "yyyy-MM-dd");
      pdf.save(`healer-${healerName}-client-${reading.name}-complete-aura-report-${timestamp}.pdf`);
      
      toast({
        title: "Complete Screenshot PDF Generated",
        description: `Professional report for ${reading.name} with all tab screenshots has been downloaded`,
      });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-purple-800">{reading.name}</CardTitle>
            <CardDescription className="text-purple-600">
              {format(new Date(reading.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              Energy: {reading.energyLevel}/10
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-reading-id={reading.id}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chakras">Chakras</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Aura Colors Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.personalityColor)}`}></div>
                <p className="text-sm font-medium">Personality</p>
                <p className="text-xs text-gray-600">{reading.personalityColor}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.givingColor)}`}></div>
                <p className="text-sm font-medium">Giving</p>
                <p className="text-xs text-gray-600">{reading.givingColor}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.receivingColor)}`}></div>
                <p className="text-sm font-medium">Receiving</p>
                <p className="text-xs text-gray-600">{reading.receivingColor}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br ${getColorClass(reading.thinkingColor)}`}></div>
                <p className="text-sm font-medium">Thinking</p>
                <p className="text-xs text-gray-600">{reading.thinkingColor}</p>
              </div>
            </div>

            {/* Spiritual Guidance */}
            {reading.spiritualGuidance && (
              <div>
                <h4 className="font-semibold text-lg mb-3">Spiritual Guidance</h4>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 leading-relaxed">{reading.spiritualGuidance}</p>
                </div>
              </div>
            )}

            {/* Personality Traits */}
            {Array.isArray(personalityTraits) && personalityTraits.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-3">Personality Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {personalityTraits.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="chakras" className="space-y-6">
            <h4 className="font-semibold text-lg mb-3">Chakra Activity Levels</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(chakraActivity).map(([chakra, score]) => (
                <div key={chakra} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">{chakra.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-sm font-bold text-indigo-600">{score}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(score / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="space-y-6">
            <h4 className="font-semibold text-lg mb-3">Color Meanings</h4>
            <div className="space-y-4">
              {Object.entries(colorMeanings).map(([color, meaning]) => (
                <div key={color} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColorClass(color)}`}></div>
                    <h5 className="font-medium text-gray-800">{color}</h5>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{String(meaning)}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Complete Analysis</h4>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reading.detailedAnalysis || reading.analysis}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Healer Notes Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-lg mb-3">Professional Notes</h4>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add your professional insights, additional observations, or recommendations..."
                className="min-h-32"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveNotes}
                  disabled={updateReadingMutation.isPending}
                  size="sm"
                >
                  {updateReadingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              {editedNotes || reading.healerNotes ? (
                <p className="text-sm text-gray-700">{editedNotes || reading.healerNotes}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No professional notes added yet. Click edit to add your insights.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Detailed Numerology Reading Card Component
function DetailedNumerologyReadingCard({ reading }: { reading: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(reading.healerNotes || "");
  const { toast } = useToast();
  const { user } = useAuth();

  const queryClient = useQueryClient();
  
  const updateReadingMutation = useMutation({
    mutationFn: async (notes: string) => {
      await apiRequest('PATCH', `/api/numerology-readings/${reading.id}/notes`, { healerNotes: notes });
    },
    onSuccess: () => {
      toast({
        title: "Notes Updated",
        description: "Your reading notes have been saved successfully."
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/healer-numerology-readings"] });
    }
  });

  const saveNotes = () => {
    updateReadingMutation.mutate(editedNotes);
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Numerology Reading Report", 105, 20, { align: "center" });
    
    // Client information
    pdf.setFontSize(12);
    pdf.text(`Client: ${reading.name}`, 20, 40);
    pdf.text(`Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy")}`, 20, 50);
    pdf.text(`Healer: ${user?.username || 'Unknown'}`, 20, 60);
    
    // Core numbers
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Core Numbers", 20, 80);
    
    pdf.setFontSize(11);
    pdf.text(`Life Path Number: ${reading.lifePathNumber}`, 20, 95);
    pdf.text(`Destiny Number: ${reading.destinyNumber}`, 20, 105);
    pdf.text(`Soul Urge Number: ${reading.soulUrgeNumber}`, 20, 115);
    pdf.text(`Personality Number: ${reading.personalityNumber}`, 20, 125);
    
    // Interpretation
    pdf.setFontSize(14);
    pdf.text("Complete Interpretation", 20, 145);
    
    pdf.setFontSize(10);
    const splitText = pdf.splitTextToSize(reading.interpretation, 170);
    pdf.text(splitText, 20, 155);
    
    // Healer notes if available
    if (reading.healerNotes) {
      const notesY = 155 + (splitText.length * 4) + 10;
      pdf.setFontSize(14);
      pdf.text("Healer Notes", 20, notesY);
      
      pdf.setFontSize(10);
      const splitNotes = pdf.splitTextToSize(reading.healerNotes, 170);
      pdf.text(splitNotes, 20, notesY + 10);
    }
    
    // Save the PDF
    pdf.save(`numerology-reading-${reading.name}-${format(new Date(reading.createdAt), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-blue-800">{reading.name}</CardTitle>
            <CardDescription className="text-blue-600">
              {format(new Date(reading.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadPDF}
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Cancel Edit" : "Edit Notes"}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Core Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reading.lifePathNumber}</div>
            <p className="text-sm font-medium">Life Path</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reading.destinyNumber}</div>
            <p className="text-sm font-medium">Destiny</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reading.soulUrgeNumber}</div>
            <p className="text-sm font-medium">Soul Urge</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reading.personalityNumber}</div>
            <p className="text-sm font-medium">Personality</p>
          </div>
        </div>

        {/* Full Interpretation */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Complete Interpretation</h4>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reading.interpretation}</p>
          </div>
        </div>

        {/* Healer Notes Section */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Professional Notes</h4>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add your professional insights, additional observations, or recommendations..."
                className="min-h-32"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveNotes}
                  disabled={updateReadingMutation.isPending}
                  size="sm"
                >
                  {updateReadingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              {editedNotes || reading.healerNotes ? (
                <p className="text-sm text-gray-700">{editedNotes || reading.healerNotes}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No professional notes added yet. Click edit to add your insights.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HealerDashboard() {
  const { user } = useAuth();
  const { credits } = useCredits();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingTab, setBookingTab] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState<HealerBooking | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch healer's bookings with real-time updates
  const { data: bookings = [], isLoading: isLoadingBookings, refetch } = useQuery<HealerBooking[]>({
    queryKey: ["/api/healer-bookings"],
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  // Fetch healer analytics
  const { data: analytics } = useQuery<HealerAnalytics>({
    queryKey: ["/api/healer-analytics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch booking trends
  const { data: trends = [] } = useQuery<BookingTrend[]>({
    queryKey: ["/api/healer-trends"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch healer's own aura readings
  const { data: healerAuraReadings = [] } = useQuery<AuraReading[]>({
    queryKey: ["/api/aura-readings"],
    enabled: !!user,
  });

  // Fetch healer's own numerology readings
  const { data: healerNumerologyReadings = [] } = useQuery<NumerologyReading[]>({
    queryKey: ["/api/healer-numerology-readings"],
    enabled: !!user,
  });

  // Mutation for responding to bookings
  const respondToBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status, healerResponse }: { 
      bookingId: number; 
      status: string; 
      healerResponse?: string 
    }) => {
      return apiRequest("PATCH", `/api/booking/${bookingId}/status`, { status, healerResponse });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking response sent successfully",
      });
      setIsDialogOpen(false);
      setSelectedBooking(null);
      setResponseMessage("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/healer-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/healer-analytics"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to booking",
        variant: "destructive",
      });
    },
  });

  const handleBookingResponse = (booking: HealerBooking, status: 'accepted' | 'rejected') => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
    // Pre-fill response based on status
    if (status === 'accepted') {
      setResponseMessage("Thank you for booking with me! I'll be happy to help you on your spiritual journey.");
    } else {
      setResponseMessage("I appreciate your interest, but I'm currently unable to take on new clients at this time.");
    }
  };

  const submitResponse = () => {
    if (!selectedBooking) return;
    
    const status = responseMessage.toLowerCase().includes('thank you') || 
                  responseMessage.toLowerCase().includes('happy') ? 'accepted' : 'rejected';
    
    respondToBookingMutation.mutate({
      bookingId: selectedBooking.id,
      status,
      healerResponse: responseMessage,
    });
  };

  // Filter bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');

  const renderBookingCard = (booking: HealerBooking) => (
    <Card key={booking.id} className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">Client #{booking.userId}</span>
              <Badge variant={
                booking.status === 'accepted' ? 'default' :
                booking.status === 'rejected' ? 'destructive' : 'secondary'
              }>
                {booking.status}
              </Badge>
            </div>
            
            {booking.message && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  <MessageSquare className="h-3 w-3 inline mr-1" />
                  {booking.message}
                </p>
              </div>
            )}
            
            {booking.healerResponse && (
              <div className="mb-2 p-2 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Your response:</strong> {booking.healerResponse}
                </p>
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              <Clock className="h-3 w-3 inline mr-1" />
              {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
              {booking.respondedAt && (
                <span className="ml-2">
                  • Responded: {format(new Date(booking.respondedAt), "MMM d, yyyy")}
                </span>
              )}
            </p>
            

          </div>
          
          {booking.status === 'pending' && (
            <div className="flex gap-2 ml-4">
              <Button 
                size="sm" 
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => handleBookingResponse(booking, 'accepted')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleBookingResponse(booking, 'rejected')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Healer Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}! Manage your practice and connect with clients.</p>
          </div>
          <div className="flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full">
            <div className="text-violet-600">💳</div>
            <span className="font-medium text-violet-800">{credits} credits</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="readings">My Readings</TabsTrigger>
          <TabsTrigger value="tools">Spiritual Tools</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                    <p className="text-3xl font-bold text-orange-600">{analytics?.pendingBookings || 0}</p>
                  </div>
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Accepted Sessions</p>
                    <p className="text-3xl font-bold text-green-600">{analytics?.acceptedBookings || 0}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Clients</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics?.totalClients || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Acceptance Rate</p>
                    <p className="text-3xl font-bold text-purple-600">{analytics?.acceptanceRate?.toFixed(1) || 0}%</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Booking Requests</CardTitle>
              <CardDescription>Latest client requests for spiritual guidance</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No pending booking requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.slice(0, 3).map(renderBookingCard)}
                  {pendingBookings.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab("bookings")}
                    >
                      View All {pendingBookings.length} Pending Requests
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>Manage client booking requests and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Tabs value={bookingTab} onValueChange={setBookingTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="pending" className="relative">
                      Pending Requests
                      {pendingBookings.length > 0 && (
                        <Badge className="ml-2 bg-orange-500 text-white">
                          {pendingBookings.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="accepted">Accepted</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    <div className="space-y-4">
                      {pendingBookings.length === 0 ? (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No pending booking requests</p>
                        </div>
                      ) : (
                        pendingBookings.map(renderBookingCard)
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="accepted">
                    <div className="space-y-4">
                      {acceptedBookings.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No accepted bookings yet</p>
                        </div>
                      ) : (
                        acceptedBookings.map(renderBookingCard)
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="rejected">
                    <div className="space-y-4">
                      {rejectedBookings.length === 0 ? (
                        <div className="text-center py-8">
                          <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No rejected bookings</p>
                        </div>
                      ) : (
                        rejectedBookings.map(renderBookingCard)
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Statistics</CardTitle>
                <CardDescription>Your practice performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Bookings</span>
                    <span className="font-semibold">{analytics?.totalBookings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recent Bookings (30 days)</span>
                    <span className="font-semibold">{analytics?.recentBookings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Acceptance Rate</span>
                    <span className="font-semibold text-green-600">{analytics?.acceptanceRate?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unique Clients</span>
                    <span className="font-semibold">{analytics?.totalClients || 0}</span>
                  </div>

                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
                <CardDescription>Booking activity over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {format(new Date(trend.date), "MMM d")}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {trend.bookings} total
                        </Badge>
                        {trend.accepted > 0 && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                            {trend.accepted} accepted
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Readings Tab */}
        <TabsContent value="readings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aura Readings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  My Aura Readings
                </CardTitle>
                <CardDescription>Your personal spiritual energy analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {healerAuraReadings.length === 0 ? (
                  <div className="text-center py-8">
                    <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No aura readings yet</p>
                    <Link to="/aura-analysis">
                      <Button>Get Your First Reading</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {healerAuraReadings.map((reading) => (
                      <DetailedAuraReadingCard key={reading.id} reading={reading} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Numerology Readings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-500" />
                  My Numerology Readings
                </CardTitle>
                <CardDescription>Your personal numerological insights</CardDescription>
              </CardHeader>
              <CardContent>
                {healerNumerologyReadings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No numerology readings yet</p>
                    <Link to="/numerology">
                      <Button>Get Your First Reading</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {healerNumerologyReadings.map((reading) => (
                      <DetailedNumerologyReadingCard key={reading.id} reading={reading} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spiritual Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          {/* Personal Numerology Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                Personal Numerology Generator
              </CardTitle>
              <CardDescription>Generate detailed numerology readings for any date - stored privately for your healer account</CardDescription>
            </CardHeader>
            <CardContent>
              <HealerNumerologyInput onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/numerology-readings'] });
                setActiveTab("readings");
              }} />
            </CardContent>
          </Card>

          {/* Spiritual Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Aura Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">Analyze your own spiritual energy and aura colors</p>
                <Link to="/aura-analysis">
                  <Button className="w-full">Start Analysis</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Numerology Reading</h3>
                <p className="text-sm text-gray-600 mb-4">Discover your life path and spiritual numbers</p>
                <Link to="/numerology">
                  <Button className="w-full">Get Reading</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Object Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">Analyze the spiritual energy of objects</p>
                <Link to="/object-analysis">
                  <Button className="w-full">Analyze Object</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Booking Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBooking && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Client Message:</strong>
                </p>
                <p className="text-sm">{selectedBooking.message || "No message provided"}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">Your Response</label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Write your response to the client..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={submitResponse}
                disabled={!responseMessage.trim() || respondToBookingMutation.isPending}
                className="flex-1"
              >
                {respondToBookingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Send Response
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}