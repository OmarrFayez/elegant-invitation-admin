
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2, Users, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EventForm from "@/components/admin/EventForm";
import EventAttendeesList from "@/components/admin/EventAttendeesList";
import { useTableData } from "@/hooks/useTableData";
import SearchBar from "@/components/admin/SearchBar";
import SortableHeader from "@/components/admin/SortableHeader";
import EnhancedPaginationControls from "@/components/admin/EnhancedPaginationControls";

interface Event {
  id: number;
  event_name: string;
  event_date: string;
  phone_number: string;
  email: string;
  description1: string;
  description2: string;
  max_attendance: number;
  wish_account: string;
  location_text: string;
  location_url: string;
  background_image: string;
  background_music: string;
  date_added: string;
  background_color?: string;
  slug?: string;
  user_id?: number;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showAttendees, setShowAttendees] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date_added", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch event invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    paginatedData: paginatedEvents,
    setCurrentPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
  } = useTableData({ 
    data: events, 
    itemsPerPage: 10,
    searchableFields: ['event_name', 'phone_number', 'email']
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event invitation?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event invitation deleted successfully",
      });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete event invitation",
        variant: "destructive",
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEvent(null);
    fetchEvents();
  };

  if (showForm || editingEvent) {
    return (
      <EventForm
        event={editingEvent}
        onClose={handleFormClose}
      />
    );
  }

  if (showAttendees) {
    return (
      <EventAttendeesList
        eventId={showAttendees}
        onBack={() => setShowAttendees(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events Invitation</h1>
          <p className="text-muted-foreground">
            Manage event invitations and track responses
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search events..."
          />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Invitations</CardTitle>
          <CardDescription>
            View and manage all event invitation cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No event invitations found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader 
                      field="id" 
                      currentSortField={sortField as string} 
                      sortDirection={sortDirection} 
                      onSort={handleSort}
                    >
                      ID
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader 
                      field="event_name" 
                      currentSortField={sortField as string} 
                      sortDirection={sortDirection} 
                      onSort={handleSort}
                    >
                      Event Name
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader 
                      field="phone_number" 
                      currentSortField={sortField as string} 
                      sortDirection={sortDirection} 
                      onSort={handleSort}
                    >
                      Contact
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader 
                      field="event_date" 
                      currentSortField={sortField as string} 
                      sortDirection={sortDirection} 
                      onSort={handleSort}
                    >
                      Event Date
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader 
                      field="max_attendance" 
                      currentSortField={sortField as string} 
                      sortDirection={sortDirection} 
                      onSort={handleSort}
                    >
                      Max Guests
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader 
                      field="date_added" 
                      currentSortField={sortField as string} 
                      sortDirection={sortDirection} 
                      onSort={handleSort}
                    >
                      Date Added
                    </SortableHeader>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.id}</TableCell>
                    <TableCell className="font-medium">
                      {event.event_name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{event.phone_number}</div>
                        <div className="text-muted-foreground">{event.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.event_date ? new Date(event.event_date).toLocaleDateString() : "Not set"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {event.max_attendance || "Unlimited"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(event.date_added).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`${window.location.origin}/system/event/${event.slug || event.id}`, '_blank')}
                          title="View Event Invitation"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowAttendees(event.id)}
                          title="View Attendees"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingEvent(event)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(event.id)}
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

export default Events;
