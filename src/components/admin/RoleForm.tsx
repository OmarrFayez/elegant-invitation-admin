import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Module {
  module_id: number;
  module_name: string;
}

interface Permission {
  module_id: number;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface RoleFormProps {
  role?: Role | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RoleForm({ role, onSuccess, onCancel }: RoleFormProps) {
  const [roleName, setRoleName] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Record<number, Permission>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
    if (role) {
      setRoleName(role.role_name);
      fetchRolePermissions(role.role_id);
    }
  }, [role]);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('module_name');

      if (error) throw error;
      
      const moduleData = data || [];
      setModules(moduleData);

      // Initialize permissions for all modules
      const initialPermissions: Record<number, Permission> = {};
      moduleData.forEach(module => {
        initialPermissions[module.module_id] = {
          module_id: module.module_id,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false,
        };
      });
      setPermissions(initialPermissions);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch modules",
        variant: "destructive",
      });
    }
  };

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', roleId);

      if (error) throw error;

      const rolePermissions: Record<number, Permission> = {};
      data?.forEach(perm => {
        rolePermissions[perm.module_id] = {
          module_id: perm.module_id,
          can_view: perm.can_view || false,
          can_add: perm.can_add || false,
          can_edit: perm.can_edit || false,
          can_delete: perm.can_delete || false,
        };
      });

      setPermissions(prev => ({
        ...prev,
        ...rolePermissions,
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch role permissions",
        variant: "destructive",
      });
    }
  };

  const updatePermission = (moduleId: number, field: keyof Permission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let roleId: number;

      if (role) {
        // Update existing role
        const { error } = await supabase
          .from('roles')
          .update({ role_name: roleName })
          .eq('role_id', role.role_id);

        if (error) throw error;
        roleId = role.role_id;

        // Delete existing permissions
        await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId);
      } else {
        // Create new role
        const { data, error } = await supabase
          .from('roles')
          .insert([{ role_name: roleName }])
          .select()
          .single();

        if (error) throw error;
        roleId = data.role_id;
      }

      // Insert new permissions
      const permissionRecords = Object.values(permissions).map(perm => ({
        role_id: roleId,
        module_id: perm.module_id,
        can_view: perm.can_view,
        can_add: perm.can_add,
        can_edit: perm.can_edit,
        can_delete: perm.can_delete,
      }));

      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(permissionRecords);

      if (permError) throw permError;

      toast({
        title: "Success",
        description: role ? "Role updated successfully" : "Role created successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{role ? "Edit Role" : "Add New Role"}</CardTitle>
        <CardDescription>
          {role ? "Update role and permissions" : "Create a new role with permissions"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Permissions</Label>
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-5 gap-4 mb-4 text-sm font-medium">
                <div>Module</div>
                <div>View</div>
                <div>Add</div>
                <div>Edit</div>
                <div>Delete</div>
              </div>
              
              {modules.map((module) => (
                <div key={module.module_id} className="grid grid-cols-5 gap-4 items-center py-2 border-t">
                  <div className="font-medium">{module.module_name}</div>
                  <Checkbox
                    checked={permissions[module.module_id]?.can_view || false}
                    onCheckedChange={(checked) => 
                      updatePermission(module.module_id, 'can_view', checked as boolean)
                    }
                  />
                  <Checkbox
                    checked={permissions[module.module_id]?.can_add || false}
                    onCheckedChange={(checked) => 
                      updatePermission(module.module_id, 'can_add', checked as boolean)
                    }
                  />
                  <Checkbox
                    checked={permissions[module.module_id]?.can_edit || false}
                    onCheckedChange={(checked) => 
                      updatePermission(module.module_id, 'can_edit', checked as boolean)
                    }
                  />
                  <Checkbox
                    checked={permissions[module.module_id]?.can_delete || false}
                    onCheckedChange={(checked) => 
                      updatePermission(module.module_id, 'can_delete', checked as boolean)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : role ? "Update Role" : "Create Role"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}