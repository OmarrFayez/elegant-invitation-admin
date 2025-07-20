import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Users, Heart, Eye, EyeOff, LogOut, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Wedding {
  id: number;
  wedding_name: string;
  groom_name?: string;
  bride_name?: string;
  wedding_date?: string;
  location_text?: string;
  max_attendance?: number;
}

interface Attendance {
  id: number;
  guest_name: string;
  status: string;
  date_added: string;
  phone_number?: string;
}

interface GroupedGuests {
  phoneNumber: string;
  guests: Attendance[];
  primaryGuest: Attendance;
}

const BrideGroomDashboard: React.FC = () => {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserWeddings();
  }, []);

  const fetchUserWeddings = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        toast({
          title: "Error",
          description: "Please login to view your invitations",
          variant: "destructive",
        });
        return;
      }

      const user = JSON.parse(currentUser);
      
      // Fetch weddings associated with this user
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .eq('user_id', user.user_id)
        .order('wedding_date', { ascending: true });

      if (error) throw error;
      setWeddings(data || []);
      
      if (data && data.length > 0) {
        setSelectedWedding(data[0]);
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

  const fetchAttendance = async (weddingId: number) => {
    setAttendanceLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendances')
        .select('*')
        .eq('wedding_id', weddingId)
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

  const handleWeddingSelect = (wedding: Wedding) => {
    setSelectedWedding(wedding);
    fetchAttendance(wedding.id);
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
  const groupGuestsByPhone = (guests: Attendance[]): GroupedGuests[] => {
    const grouped = guests.reduce((acc, guest) => {
      const phone = guest.phone_number || 'no-phone';
      if (!acc[phone]) {
        acc[phone] = [];
      }
      acc[phone].push(guest);
      return acc;
    }, {} as Record<string, Attendance[]>);

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
          <p className="mt-4 text-muted-foreground">Loading your invitations...</p>
        </div>
      </div>
    );
  }

  if (weddings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Invitations Found</h2>
            <p className="text-muted-foreground mb-6">
              You don't have any wedding invitations associated with your account.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
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
            <h1 className="text-3xl font-bold mb-2">Wedding Dashboard</h1>
            <p className="text-muted-foreground">View your wedding invitations and guest responses</p>
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

        {/* Wedding Selection */}
        {weddings.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Wedding</CardTitle>
              <CardDescription>Choose which wedding invitation to view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weddings.map((wedding) => (
                  <Button
                    key={wedding.id}
                    variant={selectedWedding?.id === wedding.id ? "default" : "outline"}
                    className="p-4 h-auto flex-col items-start"
                    onClick={() => handleWeddingSelect(wedding)}
                  >
                    <div className="font-semibold">{wedding.wedding_name}</div>
                    <div className="text-sm opacity-70">
                      {wedding.groom_name} & {wedding.bride_name}
                    </div>
                    <div className="text-xs opacity-60">{formatDate(wedding.wedding_date)}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedWedding && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wedding Details */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Wedding Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedWedding.wedding_name}</h3>
                  <p className="text-muted-foreground">
                    {selectedWedding.groom_name} & {selectedWedding.bride_name}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(selectedWedding.wedding_date)}</span>
                  </div>
                  
                  {selectedWedding.location_text && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{selectedWedding.location_text}</span>
                    </div>
                  )}
                  
                  {selectedWedding.max_attendance && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Max Guests: {selectedWedding.max_attendance}</span>
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

export default BrideGroomDashboard;