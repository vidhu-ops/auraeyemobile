
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
import MobileNavigation from "@/components/layout/mobile-navigation";

interface Healer {
  id: number;
  name: string;
  username: string;
  specialty: string;
  description: string;
  email: string;
  phone: string;
  imageUrl?: string;
  rating?: number;
  experience?: string;
  location?: string;
}

const STATIC_HEALERS = [
  {
    id: 9991,
    name: "Nishant Sharma",
    username: "nishant.sharma2",
    specialty: "Aura Reading",
    description: "Founded by Nishant Sharma, an IT Engineer with a Master's in Applied Positive Psychology & Coaching Psychology (UEL, London) and over 20 years as a certified Energy healer. AuraEye™ blends cutting-edge technology with authentic energy healing to bring spiritual wellness into the digital age.",
    email: "nishant@auraeye.com",
    phone: "+91-XXXXXXXXXX",
    imageUrl: "/nishant-new.jpg",
  },
  {
    id: 9992,
    name: "Sunita Mann",
    username: "sunita_mann",
    specialty: "Spiritual Teacher & Healer",
    description: "Sunita Mann is a spiritual teacher & healer with over 20 years of experience. Trained in various modalities like Aura reading, Reiki healing, Angel’s therapy etc. With almost 95% success rate in her spiritual evaluation, she can read your energies intuitively and can pinpoint the various issues along with helping you heal the blockages.",
    email: "sunita@auraeye.com",
    phone: "+91-XXXXXXXXXX",
    imageUrl: "/sunita.jpg",
  },
  {
    id: 9993,
    name: "Mr. Subramayanam",
    username: "subramayanam",
    specialty: "Energy Healer & Engineer",
    description: "Subramayanam is a Mechanical Engineer, Aura Reader, and Energy Healer who blends analytical precision with intuitive insight. With a strong foundation in engineering and energy diagnostics, he specialises in identifying energetic imbalances at their root cause. Through intuitive energy diagnosis and distance healing practices, he helps individuals understand the underlying patterns affecting their emotional, mental, and physical well-being.",
    email: "subramayanam@auraeye.com",
    phone: "+91-XXXXXXXXXX",
    imageUrl: "/subramanyam.jpg",
  }
];

export default function HealersPage() {
  const [selectedHealer, setSelectedHealer] = useState<any>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: dbHealers = [], isLoading } = useQuery<Healer[]>({
    queryKey: ["/api/healers"],
  });

  // Combine static healers with DB healers, avoiding duplicates
  const healers = [...STATIC_HEALERS];
  dbHealers.forEach(dbh => {
    if (!STATIC_HEALERS.find(sh => sh.username === dbh.username)) {
      healers.push(dbh as any);
    }
  });
  
  const bookingMutation = useMutation({
    mutationFn: async (data: { healerId: number; message: string }) => {
      return apiRequest("POST", "/api/book-session", data);
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Sent",
        description: "The healer will review your request and contact you soon.",
      });
      setIsDialogOpen(false);
      setBookingMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/user-bookings"] });
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
      <div className="min-h-screen flex flex-col pb-20">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        {user && <MobileNavigation />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-slate-950">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">Our Healing Practitioners</h1>
          <p className="text-slate-400">Connect with our certified healers for personalized spiritual guidance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {healers.map((healer) => (
            <Card key={healer.id} className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col border-2 hover:border-purple-500/50 transition-all duration-300">
              <div className="h-84 relative bg-slate-800">
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
                <CardTitle className="text-white">{healer.name}</CardTitle>
                <CardDescription className="text-purple-400">{healer.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-bold">5.0</span>
                  </div>
                  <p className="text-slate-300 text-sm line-clamp-4">{healer.description}</p>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <div className="flex gap-2 w-full">
                  {user ? (
                    <Dialog open={isDialogOpen && selectedHealer?.id === healer.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) setSelectedHealer(healer);
                    }}>
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-purple-600 hover:bg-purple-700">Book Session</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 text-white border-slate-800">
                        <DialogHeader>
                          <DialogTitle>Book with {healer.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Label>Message</Label>
                          <Textarea 
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="Briefly describe your needs..."
                            value={bookingMessage}
                            onChange={(e) => setBookingMessage(e.target.value)}
                          />
                          <Button 
                            className="w-full bg-purple-600"
                            onClick={() => bookingMutation.mutate({ healerId: healer.id, message: bookingMessage })}
                            disabled={bookingMutation.isPending}
                          >
                            Send Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Link href="/auth" className="flex-1">
                      <Button className="w-full bg-purple-600">Login to Book</Button>
                    </Link>
                  )}
                  <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800" onClick={() => alert("Contact: " + healer.email)}>
                    Contact
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      {user && <MobileNavigation />}
    </div>
  );
}
