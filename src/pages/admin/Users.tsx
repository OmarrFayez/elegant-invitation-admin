import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTableData } from "@/hooks/useTableData";
import SearchBar from "@/components/admin/SearchBar";
import SortableHeader from "@/components/admin/SortableHeader";
import EnhancedPaginationControls from "@/components/admin/EnhancedPaginationControls";

interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  role_id: number | null;
  role_name?: string;
  created_at: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [permLoading, setPermLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    can_view: false,
    can_add: false,
    can_edit: false,
    can_delete: false,
  });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles(role_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data.map(user => ({
        ...user,
        role_name: user.roles?.role_name || 'No Role'
      }));

      setUsers(formattedUsers);
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

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    navigate(`/admin/users/${user.user_id}`);
  };

  const handleAdd = () => {
    navigate('/admin/users/new');
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
    paginatedData: paginatedUsers,
    setCurrentPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
  } = useTableData({ 
    data: users, 
    itemsPerPage: 10,
    searchableFields: ['name', 'email', 'phone', 'role_name']
  });

useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        if (!user || !user.role_id) {
          setPermissions({ can_view: false, can_add: false, can_edit: false, can_delete: false });
          return;
        }
        // For now, allow all actions for users - you can add module permissions later
        setPermissions({ can_view: true, can_add: true, can_edit: true, can_delete: true });
      } catch (e) {
        console.error('Failed to load user permissions', e);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <div className="flex items-center space-x-4">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search users..."
          />
          {permissions.can_add && (
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>All registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader 
                    field="user_id" 
                    currentSortField={sortField as string} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    ID
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader 
                    field="name" 
                    currentSortField={sortField as string} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Name
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader 
                    field="email" 
                    currentSortField={sortField as string} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Email
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader 
                    field="phone" 
                    currentSortField={sortField as string} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Phone
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader 
                    field="role_name" 
                    currentSortField={sortField as string} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Role
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
              {paginatedUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.user_id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {user.role_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {permissions.can_edit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {permissions.can_delete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.user_id)}
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
    </div>
  );
};

export default Users;