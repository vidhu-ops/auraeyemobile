
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Calendar, Loader2, ChevronDown, Award, Calculator } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface HealerRating {
  id: number;
  healerId: number;
  raterId: number;
  raterUsername: string;
  rating: number;
  createdAt: string;
}

interface HealerBadge {
  id: number;
  healerId: number;
  badgeType: string;
  badgeTitle: string;
  badgeIcon: string;
  awardedAt: string;
  expiresAt: string;
}

export default function HealersPage() {
  const [filter, setFilter] = useState("all");
  const [selectedHealer, setSelectedHealer] = useState<Healer | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ratingHealerId, setRatingHealerId] = useState<number | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch healers from database
  const { data: healers = [], isLoading, error } = useQuery<Healer[]>({
    queryKey: ["/api/healers"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0
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
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === '/api/credits' });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Rating mutation
  const ratingMutation = useMutation({
    mutationFn: async (data: { healerId: number; rating: number; raterUsername: string }) => {
      const response = await apiRequest("POST", "/api/rate-healer", data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Rating Saved ⭐",
        description: "Thank you for rating this healer!",
      });
      // Immediately invalidate and refetch to show new rating on card
      queryClient.invalidateQueries({ queryKey: ["/api/all-healer-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/all-healer-badges"] });
      // Force immediate refetch for instant UI update
      queryClient.refetchQueries({ queryKey: ["/api/all-healer-ratings"] });
      queryClient.refetchQueries({ queryKey: ["/api/all-healer-badges"] });
      // Reset state
      setRatingHealerId(null);
      setRatingValue(0);
    },
    onError: (error: any) => {
      console.error("Rating error:", error);
      toast({
        title: "Rating Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Fetch all healer ratings upfront with real-time updates
  const { data: allHealerRatings = {} } = useQuery({
    queryKey: ["/api/all-healer-ratings"],
    queryFn: async () => {
      const ratingsMap: Record<number, HealerRating[]> = {};
      
      for (const healer of healers) {
        try {
          const res = await apiRequest("GET", `/api/healer-ratings/${healer.id}`);
          const data = await res.json();
          ratingsMap[healer.id] = data.ratings || [];
        } catch (error) {
          ratingsMap[healer.id] = [];
        }
      }
      
      return ratingsMap;
    },
    enabled: healers.length > 0,
    staleTime: 0, // No caching - always fetch fresh
    refetchInterval: 2000, // Real-time updates every 2 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Fetch all healers' badges with real-time updates
  const { data: allHealersBadges = {} } = useQuery({
    queryKey: ["/api/all-healer-badges"],
    queryFn: async () => {
      const badgesMap: Record<number, HealerBadge[]> = {};
      
      for (const healer of healers) {
        try {
          const res = await apiRequest("GET", `/api/healer-badges/${healer.id}`);
          const data = await res.json();
          badgesMap[healer.id] = data.badges || [];
        } catch (error) {
          badgesMap[healer.id] = [];
        }
      }
      
      return badgesMap;
    },
    enabled: healers.length > 0,
    staleTime: 0, // No caching - always fetch fresh
    refetchInterval: 2000, // Real-time updates every 2 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col pb-20">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading healers...</p>
          </div>
        </main>
        {user && <MobileNavigation />}
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
        {user && <MobileNavigation />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-orange-100 to-pink-100 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-heading font-bold mb-4 text-orange-600">Our Healing Practitioners</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Connect with our certified healers for personalized spiritual guidance and energy healing sessions.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {healers.map((healer) => (
              <Card key={healer.id} className="overflow-hidden hover:shadow-lg transition-shadow py-10">
                <div className="h-48 bg-gradient-to-br from-orange-200 to-pink-200 relative">
                  <img 
                    src={healer.imageUrl} 
                    alt={healer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop';
                    }}
                  />
                </div>
                
                <CardHeader>
                  <CardTitle>{healer.name}</CardTitle>
                  <CardDescription>{healer.specialty}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Badges Display */}
                    {allHealersBadges[healer.id] && allHealersBadges[healer.id].length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {allHealersBadges[healer.id].map((badge: HealerBadge) => (
                          <div key={badge.id} className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full text-xs font-semibold text-yellow-800" title={badge.badgeTitle}>
                            <span>{badge.badgeIcon}</span>
                            <span>{badge.badgeTitle}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 h-auto py-1 px-2">
                            <div className="flex items-center">
                              <Star className="h-5 w-5 text-yellow-400 fill-current" />
                              <span className="ml-2 font-medium text-sm text-white">{allHealerRatings[healer.id]?.length > 0 ? (allHealerRatings[healer.id].reduce((sum: number, r: HealerRating) => sum + r.rating, 0) / allHealerRatings[healer.id].length).toFixed(1) : '5'}</span>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
                          {allHealerRatings[healer.id] && allHealerRatings[healer.id].length > 0 ? (
                            <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                              {allHealerRatings[healer.id].map((rating: HealerRating) => (
                                <div key={rating.id} className="text-sm border-b pb-2">
                                  <div className="flex items-center gap-1">
                                    {[...Array(rating.rating)].map((_, i) => (
                                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">by Username</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-sm text-gray-600">No ratings yet</div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {healer.experience && (
                        <span className="text-sm text-gray-500">{healer.experience}</span>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-white">{healer.description}</p>
                    </div>
                    
                    {healer.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">📍 {healer.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex gap-2 w-full">
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
                              <p className="text-sm text-black mb-2">
                                Specialty: {healer.specialty}
                              </p>
                              <p className="text-sm text-black">
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
                                className="text-purple-900"
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
                                onClick={() => setIsDialogOpen(false)}
                                className="bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white"
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
                  </div>
                  
                  {user && (
                    <>
                      <Dialog open={ratingHealerId === healer.id} onOpenChange={(open) => {
                        if (!open) {
                          setRatingHealerId(null);
                          setRatingValue(0);
                        }
                      }}>
                        <DialogTrigger asChild>
                          
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rate {healer.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setRatingValue(star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                  data-testid={`button-star-${star}`}
                                >
                                  <Star
                                    className={`h-8 w-8 ${
                                      star <= ratingValue
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => {
                                  if (ratingValue > 0 && user?.username) {
                                    ratingMutation.mutate({
                                      healerId: healer.id,
                                      rating: ratingValue,
                                      raterUsername: user.username
                                    });
                                  }
                                }}
                                disabled={ratingMutation.isPending || ratingValue === 0}
                                className="flex-1"
                                data-testid="button-submit-rating"
                              >
                                {ratingMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Submit Rating
                              </Button>
                              <Button
                                onClick={() => {
                                  setRatingHealerId(null);
                                  setRatingValue(0);
                                }}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      {user && <MobileNavigation />}
    </div>
  );
}
