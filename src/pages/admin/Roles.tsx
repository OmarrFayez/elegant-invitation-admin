import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleForm } from "@/components/admin/RoleForm";
import { useTableData } from "@/hooks/useTableData";
import SearchBar from "@/components/admin/SearchBar";
import SortableHeader from "@/components/admin/SortableHeader";
import EnhancedPaginationControls from "@/components/admin/EnhancedPaginationControls";
import { useAuth } from "@/hooks/useAuth";

interface Role {
  role_id: number;
  role_name: string;
  created_at: string;
}

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [permLoading, setPermLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    can_view: false,
    can_add: false,
    can_edit: false,
    can_delete: false,
  });

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoles(data || []);
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

  const handleDelete = async (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      // First delete role permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      // Then delete the role
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('role_id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role deleted successfully",
      });

      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingRole(null);
    fetchRoles();
  };

  // Add search, sort, and pagination
  const {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    totalItems,
    filteredItems,
    paginatedData: paginatedRoles,
    setCurrentPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
  } = useTableData({ 
    data: roles, 
    itemsPerPage: 10,
    searchableFields: ['role_name']
  });

useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setPermLoading(true);
        if (!user || !user.role_id) {
          setPermissions({ can_view: false, can_add: false, can_edit: false, can_delete: false });
          return;
        }
        const { data: mod, error: modErr } = await supabase
          .from('modules')
          .select('module_id')
          .eq('module_name', 'Roles & Permissions')
          .limit(1)
          .maybeSingle();
        if (modErr) throw modErr;
        if (!mod) {
          setPermissions({ can_view: false, can_add: false, can_edit: false, can_delete: false });
          return;
        }
        const { data: rolePerm, error: rpErr } = await supabase
          .from('role_permissions')
          .select('can_view, can_add, can_edit, can_delete')
          .eq('role_id', user.role_id)
          .eq('module_id', mod.module_id)
          .maybeSingle();
        if (rpErr) throw rpErr;
        setPermissions({
          can_view: !!rolePerm?.can_view,
          can_add: !!rolePerm?.can_add,
          can_edit: !!rolePerm?.can_edit,
          can_delete: !!rolePerm?.can_delete,
        });
      } catch (e) {
        console.error('Failed to load Roles & Permissions module permissions', e);
        setPermissions({ can_view: false, can_add: false, can_edit: false, can_delete: false });
      } finally {
        setPermLoading(false);
      }
    };
    loadPermissions();
  }, [user]);

  if (loading || permLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!permissions.can_view) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access denied</h2>
          <p className="text-muted-foreground">You don't have permission to view Roles & Permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage user roles and their permissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search roles..."
          />
          {permissions.can_add && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles List</CardTitle>
          <CardDescription>All available roles in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader 
                    field="role_id" 
                    currentSortField={sortField as string} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    ID
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader 
                    field="role_name" 
                    currentSortField={sortField as string} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Role Name
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader 
                    field="created_at" 
                    currentSortField={sortField as string} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Created At
                  </SortableHeader>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRoles.map((role) => (
                <TableRow key={role.role_id}>
                  <TableCell className="font-medium">{role.role_id}</TableCell>
                  <TableCell className="font-medium">{role.role_name}</TableCell>
                  <TableCell>
                    {new Date(role.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {permissions.can_edit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {permissions.can_delete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(role.role_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <EnhancedPaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            filteredItems={filteredItems}
          />
        </CardContent>
      </Card>

      {showForm && (
        <RoleForm
          role={editingRole}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingRole(null);
          }}
        />
      )}
    </div>
  );
};

export default Roles;