import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from 'bcryptjs';
import { ArrowLeft } from "lucide-react";

interface Role {
  role_id: number;
  role_name: string;
}

interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  role_id: number | null;
}

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'new';
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role_id: "",
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoles();
    if (isEdit) {
      fetchUser();
    }
  }, [id, isEdit]);

  const fetchUser = async () => {
    if (!id || id === 'new') return;
    
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', parseInt(id))
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          password: "",
          role_id: data.role_id?.toString() || "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
      navigate('/admin/users');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('role_id, role_name')
        .order('role_name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        role_id: formData.role_id ? parseInt(formData.role_id) : null,
      };

      // Hash password if provided
      if (formData.password) {
        const hashedPassword = await bcrypt.hash(formData.password, 10);
        userData.password = hashedPassword;
      }

      console.log('Submitting user data:', userData);

      if (isEdit) {
        // Update existing user - don't rely on .select() working with RLS
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('user_id', parseInt(id!));

        console.log('Update error:', error);

        if (error) throw error;

        // Verify the update worked by fetching the user again
        const { data: updatedUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', parseInt(id!))
          .single();

        console.log('Verification fetch:', { updatedUser, fetchError });

        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        // Create new user
        if (!formData.password) {
          throw new Error("Password is required for new users");
        }

        const { error } = await supabase
          .from('users')
          .insert([userData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "User created successfully",
        });
      }

      navigate('/admin/users');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? "Edit User" : "Add New User"}</h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update user information and permissions" : "Create a new user account"}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit User" : "Add New User"}</CardTitle>
          <CardDescription>
            {isEdit ? "Update user information" : "Create a new user account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role_id}
                  onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.role_id} value={role.role_id.toString()}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {isEdit && "(leave blank to keep current)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!isEdit}
                placeholder={isEdit ? "Enter new password to change" : "Enter password"}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : isEdit ? "Update User" : "Create User"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}