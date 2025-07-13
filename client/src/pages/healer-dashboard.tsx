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
  X
} from "lucide-react";
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

// Comprehensive Aura Reading Card Component with Full Analysis
function DetailedAuraReadingCard({ reading }: { reading: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(reading.healerNotes || "");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

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

  // Comprehensive PDF Download Function - matches actual aura analysis PDF
  const downloadPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    let yPosition = 30;
    
    // HEADER
    pdf.setFontSize(24);
    pdf.setTextColor(75, 85, 99);
    pdf.text('Aura and Chakra Alignment Report', 20, yPosition);
    yPosition += 20;
    
    // Reading Details
    pdf.setFontSize(14);
    pdf.setTextColor(55, 65, 81);
    pdf.text(`Name: ${reading.name}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Date: ${format(new Date(reading.createdAt), "MMMM d, yyyy 'at' h:mm a")}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Energy Level: ${reading.energyLevel}/10`, 20, yPosition);
    yPosition += 20;
    
    // AURA COLORS SECTION
    pdf.setFontSize(18);
    pdf.setTextColor(75, 85, 99);
    pdf.text('Your Aura Color Analysis', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(55, 65, 81);
    pdf.text(`Personality Color: ${reading.personalityColor}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Giving Energy Color: ${reading.givingColor}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Receiving Energy Color: ${reading.receivingColor}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Thinking Energy Color: ${reading.thinkingColor}`, 20, yPosition);
    yPosition += 15;
    
    // COLOR MEANINGS
    if (Object.keys(colorMeanings).length > 0) {
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Color Meanings & Interpretations', 20, yPosition);
      yPosition += 15;
      
      Object.entries(colorMeanings).forEach(([color, meaning]) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99);
        pdf.text(`${color} Energy:`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        const meaningLines = pdf.splitTextToSize(String(meaning), pageWidth - 40);
        pdf.text(meaningLines, 20, yPosition);
        yPosition += meaningLines.length * 5 + 10;
      });
    }
    
    // CHAKRA ACTIVITY SECTION
    if (Object.keys(chakraActivity).length > 0) {
      if (yPosition > 180) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('8-Chakra Energy System', 20, yPosition);
      yPosition += 15;
      
      // Chakra scores
      Object.entries(chakraActivity).forEach(([chakra, score]) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        const chakraName = chakra.charAt(0).toUpperCase() + chakra.slice(1).replace(/([A-Z])/g, ' $1');
        pdf.text(`${chakraName} Chakra: ${score}/10 (${score * 10}%)`, 20, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
    }
    
    // SPIRITUAL GUIDANCE
    if (reading.spiritualGuidance) {
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Spiritual Guidance', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      const guidanceLines = pdf.splitTextToSize(reading.spiritualGuidance, pageWidth - 40);
      pdf.text(guidanceLines, 20, yPosition);
      yPosition += guidanceLines.length * 5 + 15;
    }
    
    // DETAILED ANALYSIS
    if (reading.detailedAnalysis) {
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Detailed Analysis', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      const analysisLines = pdf.splitTextToSize(reading.detailedAnalysis, pageWidth - 40);
      pdf.text(analysisLines, 20, yPosition);
      yPosition += analysisLines.length * 5 + 15;
    }
    
    // PERSONALITY TRAITS
    if (Array.isArray(personalityTraits) && personalityTraits.length > 0) {
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Personality Traits', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      const traitsText = personalityTraits.join(', ');
      const traitsLines = pdf.splitTextToSize(traitsText, pageWidth - 40);
      pdf.text(traitsLines, 20, yPosition);
      yPosition += traitsLines.length * 5 + 15;
    }
    
    // HEALER NOTES
    if (reading.healerNotes) {
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(18);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Professional Healer Notes', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      const notesLines = pdf.splitTextToSize(reading.healerNotes, pageWidth - 40);
      pdf.text(notesLines, 20, yPosition);
    }
    
    // Save PDF
    const timestamp = format(new Date(reading.createdAt), "yyyy-MM-dd");
    pdf.save(`aura-chakra-alignment-report-${reading.name}-${timestamp}.pdf`);
    
    toast({
      title: "PDF Downloaded Successfully",
      description: "Your complete Aura and Chakra Alignment Report has been saved",
    });
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
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
    }
  });

  const saveNotes = () => {
    updateReadingMutation.mutate(editedNotes);
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          </Button>
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
    queryKey: ["/api/numerology-readings"],
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