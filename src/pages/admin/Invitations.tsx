import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, ExternalLink, Heart, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import InvitationForm from "@/components/admin/InvitationForm";
import AttendeesList from "@/components/admin/AttendeesList";

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
}

const Invitations = () => {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWedding, setEditingWedding] = useState<Wedding | null>(null);
  const [showAttendees, setShowAttendees] = useState<number | null>(null);
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : weddings.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-primary/10">
          <Heart className="h-16 w-16 text-primary/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Invitations Yet</h3>
          <p className="text-muted-foreground mb-6">Create your first beautiful wedding invitation</p>
          <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-primary to-accent">
            <Plus className="h-4 w-4 mr-2" />
            Create Invitation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((wedding) => (
            <div
              key={wedding.id}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-primary/5 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
              
              {/* Content */}
              <div className="relative p-6">
                {/* Wedding Name */}
                <div className="mb-4">
                  <h3 className="font-script text-2xl font-bold text-primary mb-1 line-clamp-1">
                    {wedding.wedding_name}
                  </h3>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>

                {/* Couple Names */}
                <div className="mb-4">
                  <p className="text-lg font-semibold text-foreground">
                    {wedding.groom_name} <span className="text-primary font-script">&</span> {wedding.bride_name}
                  </p>
                </div>

                {/* Wedding Date */}
                {wedding.wedding_date && (
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {new Date(wedding.wedding_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {/* Contact Info */}
                {wedding.phone_number && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      {wedding.phone_number}
                    </p>
                  </div>
                )}

                {/* Date Added */}
                <div className="mb-6">
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    Created {new Date(wedding.date_added).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/invitation/${wedding.id}`, '_blank')}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAttendees(wedding.id)}
                      className="bg-accent/10 hover:bg-accent/20 text-accent-foreground border border-accent/20"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Guests
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingWedding(wedding)}
                      className="h-8 w-8 hover:bg-primary/10 text-primary"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(wedding.id)}
                      className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invitations;