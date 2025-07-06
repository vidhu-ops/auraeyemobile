import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  Download
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

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

export default function HealerDashboard() {
  const { user } = useAuth();
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Healer Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}! Manage your practice and connect with clients.</p>
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
                    {healerAuraReadings.slice(0, 3).map((reading) => (
                      <div key={reading.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{reading.name}</h4>
                            <p className="text-sm text-gray-600">
                              {reading.dominantColor} • Energy: {reading.energyLevel}/10
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(reading.createdAt), "MMM d")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {reading.analysis.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                    {healerAuraReadings.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        And {healerAuraReadings.length - 3} more readings...
                      </p>
                    )}
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
                    {healerNumerologyReadings.slice(0, 3).map((reading) => (
                      <div key={reading.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{reading.name}</h4>
                            <p className="text-sm text-gray-600">
                              Life Path: {reading.lifePathNumber} • Destiny: {reading.destinyNumber}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(reading.createdAt), "MMM d")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {reading.interpretation.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                    {healerNumerologyReadings.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        And {healerNumerologyReadings.length - 3} more readings...
                      </p>
                    )}
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
  );
}