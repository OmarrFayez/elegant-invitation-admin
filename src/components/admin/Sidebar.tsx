import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Heart, 
  Users, 
  Shield, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Invitation Cards",
      path: "/admin/invitations",
      icon: Heart,
    },
    {
      title: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      title: "Roles & Permissions",
      path: "/admin/roles",
      icon: Shield,
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Error logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`bg-card border-r flex flex-col transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Wedding Admin</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;