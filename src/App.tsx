import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Invitations from "./pages/admin/Invitations";
import Users from "./pages/admin/Users";
import Roles from "./pages/admin/Roles";
import Invitation from "./pages/Invitation";
import Login from "./pages/Login";
import BrideGroomDashboard from "./pages/BrideGroomDashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/invitation/:id" element={<Invitation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<BrideGroomDashboard />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="invitations" element={<Invitations />} />
              <Route path="users" element={<Users />} />
              <Route path="roles" element={<Roles />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
