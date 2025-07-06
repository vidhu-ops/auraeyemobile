import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  User, 
  Clock, 
  MessageSquare, 
  Users, 
  Activity,
  DollarSign,
  ArrowUpRight,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

export default function HealerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState<HealerBooking | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch healer's bookings
  const { data: bookings = [], isLoading, refetch } = useQuery<HealerBooking[]>({
    queryKey: ["/api/healer-bookings"],
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  // Booking response mutation
  const respondToBookingMutation = useMutation({
    mutationFn: async (data: { bookingId: number; status: string; healerResponse?: string }) => {
      return apiRequest("PATCH", `/api/booking/${data.bookingId}/status`, {
        status: data.status,
        healerResponse: data.healerResponse
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Response Sent",
        description: `Booking ${variables.status} successfully.`,
      });
      setIsDialogOpen(false);
      setResponseMessage("");
      setSelectedBooking(null);
      // Refresh bookings
      queryClient.invalidateQueries({ queryKey: ["/api/healer-bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Response Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');

  const handleBookingResponse = (booking: HealerBooking, status: 'accepted' | 'rejected') => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  const submitResponse = (status: 'accepted' | 'rejected') => {
    if (!selectedBooking) return;
    
    respondToBookingMutation.mutate({
      bookingId: selectedBooking.id,
      status,
      healerResponse: responseMessage
    });
  };

  const renderBookingCard = (booking: HealerBooking) => (
    <Card key={booking.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Booking Request #{booking.id}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            {booking.message && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Client Message:</strong> {booking.message}
                </p>
              </div>
            )}
            
            {booking.healerResponse && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Your Response:</strong> {booking.healerResponse}
                </p>
              </div>
            )}
          </div>
          
          <div className="ml-4">
            <Badge variant={
              booking.status === 'accepted' ? 'default' :
              booking.status === 'rejected' ? 'destructive' :
              'secondary'
            }>
              {booking.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {booking.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={() => handleBookingResponse(booking, 'accepted')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBookingResponse(booking, 'rejected')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-r from-secondary-dark to-primary-dark text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-heading font-bold">Healer Dashboard</h1>
          <p className="opacity-80">Welcome back, {user.username}</p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Requests</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingBookings.length}</p>
                </div>
                <div className="bg-orange-100 p-2 rounded-full">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Accepted Sessions</p>
                  <p className="text-3xl font-bold text-green-600">{acceptedBookings.length}</p>
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
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold">{bookings.length}</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Response Rate</p>
                  <p className="text-3xl font-bold">{bookings.length > 0 ? Math.round(((acceptedBookings.length + rejectedBookings.length) / bookings.length) * 100) : 0}%</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Requests</CardTitle>
            <CardDescription>Manage client booking requests and sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
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

        {/* Response Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedBooking ? 
                  `Respond to Booking #${selectedBooking.id}` : 
                  'Respond to Booking'
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="response">Response Message (Optional)</Label>
                <Textarea
                  id="response"
                  placeholder="Add a personal message to the client..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => submitResponse('accepted')}
                  disabled={respondToBookingMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {respondToBookingMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => submitResponse('rejected')}
                  disabled={respondToBookingMutation.isPending}
                  className="flex-1"
                >
                  {respondToBookingMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline Booking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}