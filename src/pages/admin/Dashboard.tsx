import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, UserCheck, Heart } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWeddings: 0,
    totalUsers: 0,
    totalGuests: 0,
    totalAttending: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total weddings
        const { count: weddingCount } = await supabase
          .from("weddings")
          .select("*", { count: "exact", head: true });

        // Get total users
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        // Get total guests
        const { count: guestCount } = await supabase
          .from("attendances")
          .select("*", { count: "exact", head: true });

        // Get total attending guests
        const { count: attendingCount } = await supabase
          .from("attendances")
          .select("*", { count: "exact", head: true })
          .eq("status", "Attending");

        setStats({
          totalWeddings: weddingCount || 0,
          totalUsers: userCount || 0,
          totalGuests: guestCount || 0,
          totalAttending: attendingCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Weddings",
      value: stats.totalWeddings,
      description: "Wedding invitations created",
      icon: Heart,
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Admin panel users",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Guests",
      value: stats.totalGuests,
      description: "Guest responses received",
      icon: UserCheck,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Attending Guests",
      value: stats.totalAttending,
      description: "Guests confirmed attending",
      icon: Calendar,
      gradient: "from-purple-500 to-violet-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Wedding Invitation Admin Panel
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription className="text-xs">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest wedding invitations and RSVPs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity tracking will be implemented in the next phase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Quick action shortcuts will be available here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;