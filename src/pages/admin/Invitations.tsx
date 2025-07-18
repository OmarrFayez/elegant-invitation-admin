import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2, Users, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import InvitationForm from "@/components/admin/InvitationForm";
import AttendeesList from "@/components/admin/AttendeesList";
import InvitationPreview from "@/components/admin/InvitationPreview";

interface Wedding {
  id: number;
  wedding_name: string;
  groom_name: string;
  bride_name: string;
  description1: string;
  description2: string;
  phone_number: string;
  email: string;
  wedding_date: string;
  max_attendance: number;
  whish_account: string;
  location_text: string;
  location_url: string;
  background_image: string;
  background_music: string;
  date_added: string;
  background_color?: string;
  user_id?: number;
}

const Invitations = () => {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWedding, setEditingWedding] = useState<Wedding | null>(null);
  const [showAttendees, setShowAttendees] = useState<number | null>(null);
  const [previewWedding, setPreviewWedding] = useState<Wedding | null>(null);
  const { toast } = useToast();

  const fetchWeddings = async () => {
    try {
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .order("date_added", { ascending: false });

      if (error) throw error;
      setWeddings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch wedding invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeddings();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this wedding invitation?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("weddings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Wedding invitation deleted successfully",
      });
      fetchWeddings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete wedding invitation",
        variant: "destructive",
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingWedding(null);
    fetchWeddings();
  };

  if (showForm || editingWedding) {
    return (
      <InvitationForm
        wedding={editingWedding}
        onClose={handleFormClose}
      />
    );
  }

  if (showAttendees) {
    return (
      <AttendeesList
        weddingId={showAttendees}
        onBack={() => setShowAttendees(null)}
      />
    );
  }

  if (previewWedding) {
    return (
      <InvitationPreview
        wedding={previewWedding}
        onClose={() => setPreviewWedding(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invitation Cards</h1>
          <p className="text-muted-foreground">
            Manage wedding invitations and track responses
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Invitation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wedding Invitations</CardTitle>
          <CardDescription>
            View and manage all wedding invitation cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : weddings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No wedding invitations found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wedding Name</TableHead>
                  <TableHead>Couple</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Wedding Date</TableHead>
                  <TableHead>Max Guests</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weddings.map((wedding) => (
                  <TableRow key={wedding.id}>
                    <TableCell className="font-medium">
                      {wedding.wedding_name}
                    </TableCell>
                    <TableCell>
                      {wedding.groom_name} & {wedding.bride_name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{wedding.phone_number}</div>
                        <div className="text-muted-foreground">{wedding.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString() : "Not set"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {wedding.max_attendance || "Unlimited"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(wedding.date_added).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                     {/*    <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewWedding(wedding)}
                          title="Preview Invitation"
                        >
                          <Eye className="h-4 w-4" />
                        </Button> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/invitation/${wedding.id}`, '_blank')}
                          title="View Invitation Card"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowAttendees(wedding.id)}
                          title="View Attendees"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingWedding(wedding)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(wedding.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invitations;
