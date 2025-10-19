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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [permLoading, setPermLoading] = useState(true);
  const [canViewEvents, setCanViewEvents] = useState(false);
  const [canViewRoles, setCanViewRoles] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadPermissions = async () => {
      setPermLoading(true);
      try {
        if (!user || !user.role_id) {
          setCanViewEvents(false);
          setCanViewRoles(false);
          return;
        }
        const { data: modules, error: modErr } = await supabase
          .from("modules")
          .select("module_id, module_name")
          .in("module_name", ["Events Invitation", "Roles & Permissions"]);
        if (modErr) throw modErr;
        const eventsModule = modules?.find((m) => m.module_name === "Events Invitation");
        const rolesModule = modules?.find((m) => m.module_name === "Roles & Permissions");
        if (!eventsModule && !rolesModule) {
          setCanViewEvents(false);
          setCanViewRoles(false);
          return;
        }
        const moduleIds = [eventsModule?.module_id, rolesModule?.module_id].filter(Boolean) as number[];
        const { data: perms, error: rpErr } = await supabase
          .from("role_permissions")
          .select("module_id, can_view")
          .eq("role_id", user.role_id)
          .in("module_id", moduleIds);
        if (rpErr) throw rpErr;
        setCanViewEvents(!!perms?.find(p => p.module_id === eventsModule?.module_id)?.can_view);
        setCanViewRoles(!!perms?.find(p => p.module_id === rolesModule?.module_id)?.can_view);
      } catch (e) {
        console.error("Failed to load sidebar permissions", e);
        setCanViewEvents(false);
        setCanViewRoles(false);
      } finally {
        setPermLoading(false);
      }
    };
    loadPermissions();
  }, [user]);

  const items = navigationItems.filter((item) => {
    if (item.href === "/admin/events") return canViewEvents;
    if (item.href === "/admin/roles") return canViewRoles;
    return true;
  });

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
            <p className="text-sm text-muted-foreground">Invitations</p>
            {user && (
              <p className="text-xs text-muted-foreground mt-1">Welcome, {user.email}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {items.map((item) => {
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