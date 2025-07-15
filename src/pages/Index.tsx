import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Shield, BarChart3 } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Heart,
      title: "Wedding Invitations",
      description: "Create beautiful digital wedding invitation cards with custom details, images, and music.",
    },
    {
      icon: Users,
      title: "Guest Management", 
      description: "Track guest responses and manage attendance for each wedding invitation.",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure admin panel with customizable roles and permissions for team management.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "View comprehensive statistics and insights about your wedding invitations and guests.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Wedding Invitation Admin Panel
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create, manage, and track beautiful digital wedding invitations with our comprehensive admin system
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/admin">
                Access Admin Panel
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Access Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Administrator Access</CardTitle>
              <CardDescription>
                Sign in to manage wedding invitations, users, and system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin">
                  Access Admin Panel
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
