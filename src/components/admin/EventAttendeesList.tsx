import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/admin/PaginationControls";

interface EventAttendance {
  id: number;
  guest_name: string;
  phone_number: string;
  status: string;
  date_added: string;
}

interface Event {
  id: number;
  event_name: string;
}

interface EventAttendeesListProps {
  eventId: number;
  onBack: () => void;
}

const EventAttendeesList = ({ eventId, onBack }: EventAttendeesListProps) => {
  const [attendances, setAttendances] = useState<EventAttendance[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id, event_name")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch attendances
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("event_attendances")
        .select("*")
        .eq("event_id", eventId)
        .order("date_added", { ascending: false });

      if (attendanceError) throw attendanceError;
      setAttendances(attendanceData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch event attendees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  // Add pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedData: paginatedAttendances,
    setCurrentPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
  } = usePagination({ data: attendances, itemsPerPage: 10 });

  const exportToCSV = () => {
    const csvContent = [
      ["Guest Name", "Phone Number", "Status", "Date Added"],
      ...attendances.map(attendance => [
        attendance.guest_name,
        attendance.phone_number,
        attendance.status,
        new Date(attendance.date_added).toLocaleDateString()
      ])
    ];

    const csvString = csvContent.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event?.event_name || 'event'}_attendees.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "attending":
        return "default";
      case "not attending":
        return "destructive";
      case "maybe":
        return "secondary";
      default:
        return "outline";
    }
  };

  const attendingCount = attendances.filter(a => a.status.toLowerCase() === "attending").length;
  const notAttendingCount = attendances.filter(a => a.status.toLowerCase() === "not attending").length;
  const maybeCount = attendances.filter(a => a.status.toLowerCase() === "maybe").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Attendees</h1>
            <p className="text-muted-foreground">
              {event?.event_name} - {attendances.length} total responses
            </p>
          </div>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendances.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Not Attending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{notAttendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maybe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maybeCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendee List</CardTitle>
          <CardDescription>
            All responses for this event invitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : attendances.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No responses received yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAttendances.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell className="font-medium">
                      {attendance.guest_name || "Anonymous"}
                    </TableCell>
                    <TableCell>{attendance.phone_number}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(attendance.status)}>
                        {attendance.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(attendance.date_added).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EventAttendeesList;