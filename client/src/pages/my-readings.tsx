import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PdfManagement } from "@/components/PdfManagement";
import { format } from "date-fns";
import { Palette, Calculator, Star, Clock, FileText } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

interface AuraReading {
  id: number;
  userId: number;
  name: string;
  personalityColor: string;
  givingColor: string;
  receivingColor: string;
  thinkingColor: string;
  energyLevel: number;
  spiritualGuidance: string;
  createdAt: string;
}

interface NumerologyReading {
  id: number;
  userId: number;
  personName: string;
  birthDate: string;
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  personalYearNumber: number;
  interpretation: string;
  createdAt: string;
}

export default function MyReadings() {
  const { user } = useAuth();
  const { credits } = useCredits();

  const { data: auraReadings = [], isLoading: loadingAura } = useQuery<AuraReading[]>({
    queryKey: ['/api/aura-readings'],
    enabled: !!user,
  });

  const { data: numerologyReadings = [], isLoading: loadingNumerology } = useQuery<NumerologyReading[]>({
    queryKey: ['/api/numerology-readings'],
    enabled: !!user,
  });

  const getColorClass = (color: string) => {
    const colorClasses: Record<string, string> = {
      'Red': 'from-red-400 to-red-600',
      'Orange': 'from-orange-400 to-orange-600',
      'Yellow': 'from-yellow-400 to-yellow-600',
      'Green': 'from-green-400 to-green-600',
      'Blue': 'from-blue-400 to-blue-600',
      'Indigo': 'from-indigo-400 to-indigo-600',
      'Violet': 'from-violet-400 to-violet-600',
      'Purple': 'from-purple-400 to-purple-600',
      'Pink': 'from-pink-400 to-pink-600',
      'White': 'from-gray-100 to-gray-300',
      'Gold': 'from-yellow-300 to-yellow-500',
      'Silver': 'from-gray-300 to-gray-500',
    };
    return colorClasses[color] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Readings</h1>
                <p className="text-gray-600">View and manage your spiritual analysis reports and downloaded PDFs.</p>
              </div>
              <div className="flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full">
                <div className="text-violet-600">💳</div>
                <span className="font-medium text-violet-800">{credits} credits</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="aura" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="aura">Aura Readings</TabsTrigger>
              <TabsTrigger value="numerology">Numerology</TabsTrigger>
              <TabsTrigger value="pdfs">My PDFs</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            {/* Aura Readings Tab */}
            <TabsContent value="aura" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-500" />
                    My Aura Readings ({auraReadings.length})
                  </CardTitle>
                  <CardDescription>
                    Your complete aura analysis history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAura ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : auraReadings.length === 0 ? (
                    <div className="text-center py-8">
                      <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No aura readings yet</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Start your spiritual journey with your first aura analysis
                      </p>
                      <Link to="/aura-analysis">
                        <Button>
                          <Palette className="h-4 w-4 mr-2" />
                          Get Aura Reading
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {auraReadings.map((reading) => (
                        <div key={reading.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">{reading.name}</h3>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(reading.createdAt), 'MMM dd, yyyy • h:mm a')}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-white">
                              Energy: {reading.energyLevel}/10
                            </Badge>
                          </div>

                          <div className="grid grid-cols-4 gap-3 mb-3">
                            <div className="text-center">
                              <div className={`w-8 h-8 rounded-full mx-auto mb-1 bg-gradient-to-br ${getColorClass(reading.personalityColor)}`}></div>
                              <p className="text-xs font-medium">Personality</p>
                              <p className="text-xs text-gray-600">{reading.personalityColor}</p>
                            </div>
                            <div className="text-center">
                              <div className={`w-8 h-8 rounded-full mx-auto mb-1 bg-gradient-to-br ${getColorClass(reading.givingColor)}`}></div>
                              <p className="text-xs font-medium">Giving</p>
                              <p className="text-xs text-gray-600">{reading.givingColor}</p>
                            </div>
                            <div className="text-center">
                              <div className={`w-8 h-8 rounded-full mx-auto mb-1 bg-gradient-to-br ${getColorClass(reading.receivingColor)}`}></div>
                              <p className="text-xs font-medium">Receiving</p>
                              <p className="text-xs text-gray-600">{reading.receivingColor}</p>
                            </div>
                            <div className="text-center">
                              <div className={`w-8 h-8 rounded-full mx-auto mb-1 bg-gradient-to-br ${getColorClass(reading.thinkingColor)}`}></div>
                              <p className="text-xs font-medium">Thinking</p>
                              <p className="text-xs text-gray-600">{reading.thinkingColor}</p>
                            </div>
                          </div>

                          {reading.spiritualGuidance && (
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                              <p className="text-xs text-gray-700 line-clamp-2">
                                {reading.spiritualGuidance}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Numerology Tab */}
            <TabsContent value="numerology" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-500" />
                    My Numerology Readings ({numerologyReadings.length})
                  </CardTitle>
                  <CardDescription>
                    Your numerological analysis history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingNumerology ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : numerologyReadings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No numerology readings yet</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Discover your life path through numerological analysis
                      </p>
                      <Link to="/numerology">
                        <Button>
                          <Calculator className="h-4 w-4 mr-2" />
                          Get Numerology Reading
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {numerologyReadings.map((reading) => (
                        <div key={reading.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">{reading.personName}</h3>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(reading.createdAt), 'MMM dd, yyyy • h:mm a')}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-white">
                              Born: {format(new Date(reading.birthDate), 'MMM dd, yyyy')}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-5 gap-3 mb-3">
                            <div className="text-center p-2 bg-blue-50 rounded-lg border">
                              <div className="text-lg font-bold text-blue-600">{reading.lifePathNumber}</div>
                              <div className="text-xs text-gray-500">Life Path</div>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded-lg border">
                              <div className="text-lg font-bold text-purple-600">{reading.destinyNumber}</div>
                              <div className="text-xs text-gray-500">Destiny</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded-lg border">
                              <div className="text-lg font-bold text-green-600">{reading.soulUrgeNumber}</div>
                              <div className="text-xs text-gray-500">Soul Urge</div>
                            </div>
                            <div className="text-center p-2 bg-orange-50 rounded-lg border">
                              <div className="text-lg font-bold text-orange-600">{reading.personalityNumber}</div>
                              <div className="text-xs text-gray-500">Personality</div>
                            </div>
                            <div className="text-center p-2 bg-emerald-50 rounded-lg border">
                              <div className="text-lg font-bold text-emerald-600">{reading.personalYearNumber}</div>
                              <div className="text-xs text-gray-500">2025</div>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs text-gray-700 line-clamp-2">
                              {reading.interpretation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PDF Management Tab */}
            <TabsContent value="pdfs" className="space-y-6">
              <PdfManagement />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Aura Readings</p>
                        <p className="text-2xl font-bold text-purple-600">{auraReadings.length}</p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Palette className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Numerology Readings</p>
                        <p className="text-2xl font-bold text-blue-600">{numerologyReadings.length}</p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Calculator className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Available Credits</p>
                        <p className="text-2xl font-bold text-green-600">{credits}</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Get started with your spiritual journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/aura-analysis">
                      <Button className="w-full h-16 text-left justify-start">
                        <div className="flex items-center">
                          <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                            <Palette className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-medium">Aura Analysis</div>
                            <div className="text-sm opacity-80">15 credits</div>
                          </div>
                        </div>
                      </Button>
                    </Link>

                    <Link to="/numerology">
                      <Button className="w-full h-16 text-left justify-start">
                        <div className="flex items-center">
                          <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                            <Calculator className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-medium">Numerology Reading</div>
                            <div className="text-sm opacity-80">5 credits</div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}