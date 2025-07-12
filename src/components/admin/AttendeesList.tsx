import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Attendee {
  id: number;
  guest_name: string;
  status: string;
  date_added: string;
}

interface Wedding {
  wedding_name: string;
}

interface AttendeesListProps {
  weddingId: number;
  onBack: () => void;
}

const AttendeesList = ({ weddingId, onBack }: AttendeesListProps) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch wedding details
      const { data: weddingData, error: weddingError } = await supabase
        .from("weddings")
        .select("wedding_name")
        .eq("id", weddingId)
        .single();

      if (weddingError) throw weddingError;
      setWedding(weddingData);

      // Fetch attendees
      const { data: attendeesData, error: attendeesError } = await supabase
        .from("attendances")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("date_added", { ascending: false });

      if (attendeesError) throw attendeesError;
      setAttendees(attendeesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch attendees data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [weddingId]);

  const attendingCount = attendees.filter(a => a.status === "Attending").length;
  const notAttendingCount = attendees.filter(a => a.status === "Not Attending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invitations
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Attendees - {wedding?.wedding_name}
          </h1>
          <p className="text-muted-foreground">
            View and manage guest responses for this wedding
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Attending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{notAttendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guest Responses</CardTitle>
          <CardDescription>
            All RSVP responses for this wedding invitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No guest responses yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell className="font-medium">
                      {attendee.guest_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={attendee.status === "Attending" ? "default" : "secondary"}
                        className={
                          attendee.status === "Attending"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {attendee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(attendee.date_added).toLocaleDateString()}
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

export default AttendeesList;