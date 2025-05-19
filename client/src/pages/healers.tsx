
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const healers = [
  {
    id: 1,
    name: "Maya Johnson",
    specialty: "Chakra Balancing",
    experience: "10+ years",
    price: 75,
    rating: 4.9,
    reviews: 128,
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    description: "Specialized in chakra alignment and energy healing with certification in Reiki.",
    availability: "Mon-Fri"
  },
  {
    id: 2,
    name: "David Chen",
    specialty: "Aura Cleansing",
    experience: "8 years",
    price: 85,
    rating: 4.8,
    reviews: 96,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    description: "Expert in aura reading and cleansing, certified in multiple healing modalities.",
    availability: "Tue-Sat"
  },
  {
    id: 3,
    name: "Sarah Williams",
    specialty: "Crystal Healing",
    experience: "12 years",
    price: 95,
    rating: 4.9,
    reviews: 156,
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    description: "Advanced crystal healer with expertise in stone therapy and energy work.",
    availability: "Mon-Sun"
  }
];

export default function HealersPage() {
  const [filter, setFilter] = useState("all");

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
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-2 font-medium">{healer.rating}</span>
                      <span className="ml-1 text-gray-500">({healer.reviews} reviews)</span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">{healer.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">${healer.price}/session</span>
                      <span className="text-sm text-gray-500">Available {healer.availability}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="space-x-2">
                  <Button asChild className="flex-1">
                    <Link href={`/book-session/${healer.id}`}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Session
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
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
