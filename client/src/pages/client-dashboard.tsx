import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Star,
  Target,
  Book,
  Heart,
  Calendar,
  Eye,
  TrendingUp,
  Sparkles,
  Loader2
} from "lucide-react";

interface UserBooking {
  id: number;
  userId: number;
  healerId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  healerResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);

  // Fetch user bookings
  const { data: userBookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/user-bookings'],
    enabled: !!user,
  });

  // Fetch user credits
  useEffect(() => {
    if (user) {
      fetch('/api/user-credits')
        .then(res => res.json())
        .then(data => setCredits(data.credits || 0))
        .catch(() => setCredits(0));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-bold">Welcome, {user.username}</h1>
              <p className="opacity-80">Your spiritual wellness dashboard</p>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
              <div className="text-black">💳</div>
              <span className="font-medium text-black">{credits} credits</span>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access your most used spiritual tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/aura-analysis">
                      <Camera className="h-6 w-6 text-primary" />
                      <span>Scan Aura</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100">
                    <Link href="/#vibe-check-section">
                      <Sparkles className="h-6 w-6 text-violet-500" />
                      <span className="text-xs text-center">What's My Vibe?</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/object-analysis">
                      <span className="text-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </span>
                      <span>Object Analysis</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/daily-horoscope">
                      <Star className="h-6 w-6 text-secondary" />
                      <span>Daily Horoscope</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-primary/50 bg-primary/5">
                    <Link href="/personalized-horoscope">
                      <Target className="h-6 w-6 text-primary" />
                      <span className="text-xs text-center">Personal Horoscope</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Link href="/journal">
                      <Book className="h-6 w-6 text-accent" />
                      <span>Journal Entry</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Healer Booking Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Connect with Healers
                </CardTitle>
                <CardDescription>Book sessions with certified spiritual healers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Browse Healers</h3>
                        <p className="text-sm text-gray-600">Find the perfect healer for you</p>
                      </div>
                    </div>
                    <Link href="/healers">
                      <Button className="w-full" variant="outline">
                        View All Healers
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">My Bookings</h3>
                        <p className="text-sm text-gray-600">Manage your sessions</p>
                      </div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary-dark">
                      View Bookings ({userBookings.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Your Reading History - My Bookings Only */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Your Reading History
                </CardTitle>
                <CardDescription>View your healer booking history</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBookings ? (
                  <div className="flex justify-center items-center h-[150px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : userBookings.length === 0 ? (
                  <div className="text-center h-[150px] flex flex-col justify-center text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No healer bookings yet</p>
                    <Link to="/healers">
                      <Button className="mt-2" variant="outline" size="sm">
                        Browse Healers
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[150px] overflow-y-auto">
                    {userBookings.map((booking: UserBooking) => (
                      <div key={booking.id} className="border rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">Healer Session #{booking.id}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {booking.status === 'accepted' ? 'Accepted' : 
                                 booking.status === 'rejected' ? 'Rejected' : 'Pending'}
                              </span>
                            </div>
                            {booking.message && (
                              <p className="text-xs text-gray-600 mt-1">
                                <strong>Your message:</strong> {booking.message.substring(0, 50) + (booking.message.length > 50 ? '...' : '')}
                              </p>
                            )}
                            {booking.healerResponse && (
                              <p className="text-xs text-blue-600 mt-1 p-2 bg-blue-50 rounded">
                                <strong>Healer response:</strong> {booking.healerResponse}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Requested: {format(new Date(booking.createdAt), "MMM d, yyyy")}
                              {booking.respondedAt && (
                                <span className="ml-2">• Responded: {format(new Date(booking.respondedAt), "MMM d, yyyy")}</span>
                              )}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div>
            {/* Quick Stats Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Credits</span>
                    <span className="font-medium">{credits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bookings</span>
                    <span className="font-medium">{userBookings.length}</span>
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