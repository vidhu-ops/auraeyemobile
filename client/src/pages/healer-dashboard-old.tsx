import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
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
                <CardTitle>Session Schedule</CardTitle>
                <CardDescription>Manage your upcoming healing sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Sarah Johnson</p>
                            <p className="text-sm text-gray-500">Chakra Balancing</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Today, 3:00 PM</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Confirmed</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-secondary/10 p-2 rounded-full">
                            <User className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium">Michael Chen</p>
                            <p className="text-sm text-gray-500">Aura Cleansing</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Today, 5:30 PM</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Confirmed</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-accent/10 p-2 rounded-full">
                            <User className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">Olivia Martinez</p>
                            <p className="text-sm text-gray-500">Energy Alignment</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Tomorrow, 2:00 PM</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Pending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="past">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200 p-2 rounded-full">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">James Wilson</p>
                            <p className="text-sm text-gray-500">Chakra Balancing</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Yesterday, 11:00 AM</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Completed</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200 p-2 rounded-full">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">Emily Rodriguez</p>
                            <p className="text-sm text-gray-500">Aura Cleansing</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">2 days ago</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary-dark">
                  <Calendar className="mr-2 h-4 w-4" /> Manage Schedule
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Insights</CardTitle>
                <CardDescription>Collective energy patterns of your clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Dominant Aura Colors</h3>
                    <div className="flex gap-1">
                      <div className="h-24 flex-1 flex flex-col">
                        <div className="flex-grow bg-purple-500 rounded-t-sm"></div>
                        <div className="text-center text-xs py-1">Purple</div>
                        <div className="text-center text-xs text-gray-500">35%</div>
                      </div>
                      <div className="h-24 flex-1 flex flex-col">
                        <div className="flex-grow bg-blue-500 rounded-t-sm" style={{ height: "70%" }}></div>
                        <div className="text-center text-xs py-1">Blue</div>
                        <div className="text-center text-xs text-gray-500">25%</div>
                      </div>
                      <div className="h-24 flex-1 flex flex-col">
                        <div className="flex-grow bg-green-500 rounded-t-sm" style={{ height: "60%" }}></div>
                        <div className="text-center text-xs py-1">Green</div>
                        <div className="text-center text-xs text-gray-500">20%</div>
                      </div>
                      <div className="h-24 flex-1 flex flex-col">
                        <div className="flex-grow bg-yellow-500 rounded-t-sm" style={{ height: "40%" }}></div>
                        <div className="text-center text-xs py-1">Yellow</div>
                        <div className="text-center text-xs text-gray-500">15%</div>
                      </div>
                      <div className="h-24 flex-1 flex flex-col">
                        <div className="flex-grow bg-red-500 rounded-t-sm" style={{ height: "15%" }}></div>
                        <div className="text-center text-xs py-1">Red</div>
                        <div className="text-center text-xs text-gray-500">5%</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Energy Levels Across Clients</h3>
                    <div className="h-40 flex items-end space-x-1">
                      {[65, 80, 90, 75, 85, 70, 60].map((value, i) => (
                        <div 
                          key={i}
                          className="flex-1 bg-gradient-to-t from-secondary to-secondary-light rounded-t"
                          style={{ height: `${value}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Clients</CardTitle>
                <CardDescription>Recent client activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientsSample.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-gray-500">Last session: {client.lastSession}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ 
                          backgroundColor: 
                            client.dominantAura === "Purple" ? "rgb(139, 92, 246)" :
                            client.dominantAura === "Green" ? "rgb(34, 197, 94)" :
                            client.dominantAura === "Blue" ? "rgb(59, 130, 246)" :
                            "rgb(234, 179, 8)"
                        }}></span>
                        <span className="text-xs">{client.dominantAura}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Clients
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Client communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">Sarah Johnson</p>
                      <p className="text-xs text-gray-500">2h ago</p>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">I've been practicing the meditation technique you recommended and already feel more balanced...</p>
                  </div>

                  <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">Michael Chen</p>
                      <p className="text-xs text-gray-500">5h ago</p>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">Quick question about the chakra balancing exercises. Should I focus more on the heart chakra?</p>
                  </div>

                  <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">Olivia Martinez</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">Thank you for the wonderful session yesterday. I'm feeling much more energized!</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" /> Open Messages
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Your healing effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Client Satisfaction</span>
                      <span className="text-sm font-medium">4.9/5</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: "98%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Rebooking Rate</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Session Effectiveness</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}