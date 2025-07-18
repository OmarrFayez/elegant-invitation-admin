import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Eye, Edit, ExternalLink, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomizedInvitation {
  id: number;
  design_name: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const CustomizedInvitationsList = () => {
  const [invitations, setInvitations] = useState<CustomizedInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvitation, setSelectedInvitation] = useState<CustomizedInvitation | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('customized_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load customized invitations');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('customized_invitations')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      await fetchInvitations();
      toast.success(`Invitation ${!currentStatus ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating invitation:', error);
      toast.error('Failed to update invitation');
    }
  };

  const generateSlug = async (invitation: CustomizedInvitation) => {
    try {
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_customized_invitation_slug', { design_name: invitation.design_name });

      if (slugError) throw slugError;

      const { error } = await supabase
        .from('customized_invitations')
        .update({ slug: slugData })
        .eq('id', invitation.id);

      if (error) throw error;
      
      await fetchInvitations();
      toast.success('Slug generated successfully');
    } catch (error) {
      console.error('Error generating slug:', error);
      toast.error('Failed to generate slug');
    }
  };

  const copyPreviewLink = (slug: string) => {
    const link = `${window.location.origin}/custom-invitation/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success('Preview link copied to clipboard');
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customized Invitations</h1>
          <p className="text-muted-foreground">Manage your custom invitation designs</p>
        </div>
        <Link to="/admin/customized-invitation">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Design
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Designs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Design Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.design_name}</TableCell>
                  <TableCell>
                    <Badge variant={invitation.is_published ? "default" : "secondary"}>
                      {invitation.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invitation.slug ? (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {invitation.slug}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyPreviewLink(invitation.slug)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateSlug(invitation)}
                      >
                        Generate Slug
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invitation.slug && (
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                        >
                          <Link to={`/custom-invitation/${invitation.slug}`} target="_blank">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                      >
                        <Link to={`/admin/customized-invitation?id=${invitation.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Switch
                        checked={invitation.is_published}
                        onCheckedChange={() => togglePublish(invitation.id, invitation.is_published)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {invitations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No customized invitations found. Create your first design!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomizedInvitationsList;