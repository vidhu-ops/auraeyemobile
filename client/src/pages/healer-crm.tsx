
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, MessageSquare, TrendingUp, Settings } from "lucide-react";
import Navbar from "@/components/layout/navbar";

export default function HealerCRM() {
  const [activeTab, setActiveTab] = useState("clients");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Clients
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="clients">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Clients</CardTitle>
                    <CardDescription>Manage your client relationships</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Client list would go here */}
                      <div className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Sarah Johnson</h3>
                            <p className="text-sm text-gray-500">Last session: 2 days ago</p>
                          </div>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Additional tab content would go here */}
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
