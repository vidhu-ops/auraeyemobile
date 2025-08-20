
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Calendar, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

interface Healer {
  id: number;
  name: string;
  specialty: string;
  description: string;
  email: string;
  phone: string;
  imageUrl?: string;
  rating?: number;
  experience?: string;
  location?: string;
}

export default function HealersPage() {
  const [filter, setFilter] = useState("all");
  const [selectedHealer, setSelectedHealer] = useState<Healer | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch healers from database
  const { data: healers = [], isLoading, error } = useQuery<Healer[]>({
    queryKey: ["/api/healers"],
  });
  
  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (data: { healerId: number; message: string }) => {
      return apiRequest("POST", "/api/book-session", data);
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Sent",
        description: "The healer will review your request and contact you soon. 1 credit has been deducted.",
      });
      setIsDialogOpen(false);
      setBookingMessage("");
      // Invalidate user bookings to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user-bookings"] });
      // Refresh credits to show updated balance
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading healers...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load healers</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-heading font-bold mb-4">Our Healing Practitioners</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Connect with our certified healers for personalized spiritual guidance and energy healing sessions.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {healers.map((healer) => (
              <Card key={healer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-purple-200 to-blue-200 relative">
                  <img 
                    src={healer.imageUrl} 
                    alt={healer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <CardHeader>
                  <CardTitle>{healer.name}</CardTitle>
                  <CardDescription>{healer.specialty}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-2 font-medium">{healer.rating || 5}</span>
                        <span className="ml-1 text-gray-500">rating</span>
                      </div>
                      {healer.experience && (
                        <span className="text-sm text-gray-500">{healer.experience}</span>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">{healer.description}</p>
                    </div>
                    
                    {healer.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">📍 {healer.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="space-x-2">
                  {user ? (
                    <Dialog open={isDialogOpen && selectedHealer?.id === healer.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) {
                        setSelectedHealer(healer);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="flex-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book Session with {healer.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Specialty: {healer.specialty}
                            </p>
                            <p className="text-sm text-gray-600">
                              {healer.description}
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="message">Message (Optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Tell the healer about your needs or questions..."
                              value={bookingMessage}
                              onChange={(e) => setBookingMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => {
                                bookingMutation.mutate({
                                  healerId: healer.id,
                                  message: bookingMessage
                                });
                              }}
                              disabled={bookingMutation.isPending}
                              className="flex-1"
                            >
                              {bookingMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Send Booking Request
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Link to="/auth" className="flex-1">
                      <Button className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Login to Book
                      </Button>
                    </Link>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      alert(`Contact ${healer.name}:\nEmail: ${healer.email}\nPhone: ${healer.phone}`);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
