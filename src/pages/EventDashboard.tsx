import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Users, CalendarDays, Eye, EyeOff, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Event {
  id: number;
  event_name: string;
  event_date?: string;
  location_text?: string;
  max_attendance?: number;
}

interface EventAttendance {
  id: number;
  guest_name: string;
  status: string;
  date_added: string;
  phone_number?: string;
}

interface GroupedGuests {
  phoneNumber: string;
  guests: EventAttendance[];
  primaryGuest: EventAttendance;
}

const EventDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [attendances, setAttendances] = useState<EventAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        toast({
          title: "Error",
          description: "Please login to view your events",
          variant: "destructive",
        });
        return;
      }

      const user = JSON.parse(currentUser);
      
      // Fetch events associated with this user
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.user_id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      
      if (data && data.length > 0) {
        setSelectedEvent(data[0]);
        fetchAttendance(data[0].id);
      }
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

  const fetchAttendance = async (eventId: number) => {
    setAttendanceLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_attendances')
        .select('*')
        .eq('event_id', eventId)
        .order('date_added', { ascending: false });

      if (error) throw error;
      setAttendances(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    fetchAttendance(event.id);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const attendingGuests = attendances.filter(a => a.status === 'Attending');
  const notAttendingGuests = attendances.filter(a => a.status === 'Not Attending');

  // Group guests by phone number
  const groupGuestsByPhone = (guests: EventAttendance[]): GroupedGuests[] => {
    const grouped = guests.reduce((acc, guest) => {
      const phone = guest.phone_number || 'no-phone';
      if (!acc[phone]) {
        acc[phone] = [];
      }
      acc[phone].push(guest);
      return acc;
    }, {} as Record<string, EventAttendance[]>);

    return Object.entries(grouped).map(([phoneNumber, guestList]) => ({
      phoneNumber,
      guests: guestList,
      primaryGuest: guestList[0], // First guest as primary
    }));
  };

  const groupedAttendingGuests = groupGuestsByPhone(attendingGuests);
  const groupedNotAttendingGuests = groupGuestsByPhone(notAttendingGuests);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Events Found</h2>
            <p className="text-muted-foreground">
              You don't have any events associated with your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold mb-2">Event Dashboard</h1>
            <p className="text-muted-foreground">View your event invitations and guest responses</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <p className="font-medium">{user.name}</p>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Event Selection */}
        {events.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Event</CardTitle>
              <CardDescription>Choose which event invitation to view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <Button
                    key={event.id}
                    variant={selectedEvent?.id === event.id ? "default" : "outline"}
                    className="p-4 h-auto flex-col items-start"
                    onClick={() => handleEventSelect(event)}
                  >
                    <div className="font-semibold">{event.event_name}</div>
                    <div className="text-xs opacity-60">{formatDate(event.event_date)}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedEvent && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Details */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.event_name}</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(selectedEvent.event_date)}</span>
                  </div>
                  
                  {selectedEvent.location_text && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{selectedEvent.location_text}</span>
                    </div>
                  )}
                  
                  {selectedEvent.max_attendance && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Max Guests: {selectedEvent.max_attendance}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{attendingGuests.length}</div>
                      <div className="text-sm text-muted-foreground">Attending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{notAttendingGuests.length}</div>
                      <div className="text-sm text-muted-foreground">Not Attending</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Lists */}
            <div className="lg:col-span-2 space-y-6">
              {/* Attending Guests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Attending Guests ({attendingGuests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {attendanceLoading ? (
                    <div className="text-center py-4">Loading guest list...</div>
                  ) : groupedAttendingGuests.length > 0 ? (
                    <div className="space-y-2">
                      {groupedAttendingGuests.map((group, index) => (
                        <GuestGroup 
                          key={`attending-${group.phoneNumber}-${index}`} 
                          group={group} 
                          bgColor="bg-green-50" 
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No guests attending yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Not Attending Guests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Not Attending ({notAttendingGuests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {attendanceLoading ? (
                    <div className="text-center py-4">Loading guest list...</div>
                  ) : groupedNotAttendingGuests.length > 0 ? (
                    <div className="space-y-2">
                      {groupedNotAttendingGuests.map((group, index) => (
                        <GuestGroup 
                          key={`not-attending-${group.phoneNumber}-${index}`} 
                          group={group} 
                          bgColor="bg-red-50" 
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No guests marked as not attending</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Guest Group Component for collapsible guest lists
interface GuestGroupProps {
  group: GroupedGuests;
  bgColor: string;
}

const GuestGroup: React.FC<GuestGroupProps> = ({ group, bgColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasMultipleGuests = group.guests.length > 1;

  if (!hasMultipleGuests) {
    // Single guest - display normally
    return (
      <div className={`flex justify-between items-center p-3 ${bgColor} rounded-lg`}>
        <span className="font-medium">{group.primaryGuest.guest_name}</span>
        <span className="text-sm text-muted-foreground">
          {new Date(group.primaryGuest.date_added).toLocaleDateString()}
        </span>
      </div>
    );
  }

  // Multiple guests - display as collapsible
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className={`flex justify-between items-center p-3 ${bgColor} rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}>
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">{group.primaryGuest.guest_name}</span>
            <span className="text-sm text-muted-foreground">
              (+{group.guests.length - 1} more)
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(group.primaryGuest.date_added).toLocaleDateString()}
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <div className="ml-6 space-y-1">
          {group.guests.slice(1).map((guest) => (
            <div key={guest.id} className={`flex justify-between items-center p-2 ${bgColor} rounded border-l-2 border-primary/30`}>
              <span className="text-sm">{guest.guest_name}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(guest.date_added).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default EventDashboard;