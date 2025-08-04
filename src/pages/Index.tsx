import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Shield, BarChart3, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index: isAuthenticated =', isAuthenticated, 'loading =', loading, 'user =', user);
    if (!loading) {
      if (!isAuthenticated) {
        console.log('Index: Redirecting to login...');
        navigate('/login');
      } else if (user) {
        // Redirect based on role_id
        switch (user.role_id) {
          case 1: // Admin
            navigate('/admin');
            break;
          case 2: // Invitation user
            navigate('/dashboard');
            break;
          case 3: // Event view user
            navigate('/event-dashboard');
            break;
          default:
            // If no role or unknown role, stay on index
            console.log('Index: Unknown role_id:', user.role_id);
        }
      }
    }
  }, [isAuthenticated, loading, navigate, user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this will redirect via useEffect
  if (!isAuthenticated) {
    return null;
  }

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
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Wedding Invitations</span>
        </div>
        <Link to="/login">
          <Button variant="outline" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Login
          </Button>
        </Link>
      </nav>

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
              <Link to="/login">
                Get Started
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
                <Link to="/login">
                  Sign In
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
