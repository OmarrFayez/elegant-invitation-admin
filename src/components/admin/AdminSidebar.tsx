import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Heart, 
  Users, 
  Shield, 
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Invitation Cards",
    href: "/admin/invitations",
    icon: Heart,
  },
  {
    title: "Events Invitation",
    href: "/admin/events",
    icon: Heart,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Roles & Permissions",
    href: "/admin/roles",
    icon: Shield,
  },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={cn(
      "border-r bg-card text-card-foreground transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Title */}
        {!isCollapsed && (
          <div className="px-4 py-6">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Wedding Invitations</p>
            {user && (
              <p className="text-xs text-muted-foreground mt-1">Welcome, {user.name}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="mt-auto p-4 border-t">
          <Button 
            variant="outline" 
            size={isCollapsed ? "icon" : "default"}
            className={cn("w-full", isCollapsed && "justify-center")}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}