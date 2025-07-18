import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Users, Heart, Eye, EyeOff } from 'lucide-react';

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
}

const BrideGroomDashboard: React.FC = () => {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const { toast } = useToast();

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
            <p className="text-muted-foreground">
              You don't have any wedding invitations associated with your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Wedding Dashboard</h1>
          <p className="text-muted-foreground">View your wedding invitations and guest responses</p>
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
                  ) : attendingGuests.length > 0 ? (
                    <div className="space-y-2">
                      {attendingGuests.map((guest) => (
                        <div key={guest.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">{guest.guest_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(guest.date_added).toLocaleDateString()}
                          </span>
                        </div>
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
                  ) : notAttendingGuests.length > 0 ? (
                    <div className="space-y-2">
                      {notAttendingGuests.map((guest) => (
                        <div key={guest.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="font-medium">{guest.guest_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(guest.date_added).toLocaleDateString()}
                          </span>
                        </div>
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

export default BrideGroomDashboard;