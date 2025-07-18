import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Calendar, MapPin, Users, VolumeX, Volume2, CalendarPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import AttendanceForm from '@/components/AttendanceForm';

interface Wedding {
  id: number;
  wedding_name: string;
  groom_name?: string;
  bride_name?: string;
  wedding_date?: string;
  max_attendance?: number;
  description1?: string;
  description2?: string;
  phone_number?: string;
  email?: string;
  background_image?: string;
  background_music?: string;
  location_text?: string;
  location_url?: string;
  whish_account?: string;
  background_color?: string;
  slug?: string;
}

const Invitation: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchWedding = async () => {
      if (!idOrSlug) return;

      try {
        let query = supabase.from('weddings').select('*');
        
        // Try to fetch by slug first, then by ID
        if (isNaN(Number(idOrSlug))) {
          query = query.eq('slug', idOrSlug);
        } else {
          query = query.eq('id', parseInt(idOrSlug));
        }
        
        const { data, error } = await query.single();

        if (error) throw error;
        setWedding(data);
      } catch (error) {
        console.error('Error fetching wedding:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWedding();
  }, [idOrSlug]);

  useEffect(() => {
    if (!wedding?.wedding_date) return;

    const calculateTimeLeft = () => {
      const weddingDate = new Date(wedding.wedding_date!);
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [wedding?.wedding_date]);

  useEffect(() => {
    if (wedding?.background_music && audioRef.current) {
      audioRef.current.src = wedding.background_music;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      
      // Improved autoplay handling
      if (!isMuted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Autoplay was prevented:", error);
            // Show a user interaction prompt or button to enable audio
          });
        }
      }
    }
  }, [wedding?.background_music]);

  // Handle mute state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play might be blocked by browser
          });
        }
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    if (audioRef.current) {
      setIsMuted(!isMuted);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const addToCalendar = () => {
    if (!wedding?.wedding_date) return;

    const startDate = new Date(wedding.wedding_date);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours later
    
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const eventDetails = {
      title: wedding.wedding_name || `${wedding.groom_name} & ${wedding.bride_name} Wedding`,
      start: formatDateForCalendar(startDate),
      end: formatDateForCalendar(endDate),
      location: wedding.location_text || '',
      description: 'Join us to celebrate this special day!'
    };

    // Create ICS content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//Wedding Event//EN
BEGIN:VEVENT
UID:${Date.now()}@wedding-invitation.com
DTSTART:${eventDetails.start}
DTEND:${eventDetails.end}
SUMMARY:${eventDetails.title}
DESCRIPTION:${eventDetails.description}
LOCATION:${eventDetails.location}
END:VEVENT
END:VCALENDAR`;

    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Invitation Not Found</h1>
          <p className="text-muted-foreground">The invitation you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      {wedding.background_image ? (
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${wedding.background_image})` }}
        />
      ) : (
        <div
          className="fixed inset-0"
          style={{ backgroundColor: wedding.background_color || '#f3f4f6' }}
        />
      )}
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/40" />
      
      {/* Mute Button */}
      {wedding.background_music && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-6 right-6 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="text-center text-white max-w-md mx-auto">
            {/* Names */}
            {(wedding.groom_name || wedding.bride_name) && (
              <div className="mb-8">
                {wedding.groom_name && (
                  <h1 className="font-script text-6xl md:text-7xl font-bold mb-2 leading-tight">
                    {wedding.groom_name}
                  </h1>
                )}
                {wedding.groom_name && wedding.bride_name && (
                  <div className="font-serif text-2xl md:text-3xl mb-2 opacity-90">
                    &
                  </div>
                )}
                {wedding.bride_name && (
                  <h1 className="font-script text-6xl md:text-7xl font-bold leading-tight">
                    {wedding.bride_name}
                  </h1>
                )}
              </div>
            )}

            {/* Getting Married */}
            <div className="mb-8">
              <p className="font-serif text-lg md:text-xl opacity-90 tracking-wider">
                are getting married
              </p>
            </div>

            {/* Countdown */}
            {wedding.wedding_date && (
              <div className="mb-12">
                <div className="flex justify-center items-center gap-4 text-white">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold">{timeLeft.days}</div>
                    <div className="text-xs md:text-sm opacity-75 uppercase tracking-wider">Days</div>
                  </div>
                  <div className="text-2xl opacity-50">:</div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold">{timeLeft.hours}</div>
                    <div className="text-xs md:text-sm opacity-75 uppercase tracking-wider">Hours</div>
                  </div>
                  <div className="text-2xl opacity-50">:</div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold">{timeLeft.minutes}</div>
                    <div className="text-xs md:text-sm opacity-75 uppercase tracking-wider">Minutes</div>
                  </div>
                  <div className="text-2xl opacity-50">:</div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold">{timeLeft.seconds}</div>
                    <div className="text-xs md:text-sm opacity-75 uppercase tracking-wider">Seconds</div>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <div className="flex flex-col items-center gap-2 text-white/80">
                <p className="font-serif text-sm tracking-wider">Swipe Up</p>
                <div className="w-0.5 h-8 bg-white/60"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-white/95 backdrop-blur-sm min-h-screen">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto space-y-8">
              
              {/* Wedding Title */}
              {wedding.wedding_name && (
                <div className="text-center mb-12">
                  <h2 className="font-script text-4xl md:text-5xl text-primary mb-4">
                    {wedding.wedding_name}
                  </h2>
                  <div className="w-24 h-0.5 bg-primary/30 mx-auto"></div>
                </div>
              )}

              {/* Date and Location */}
              {(wedding.wedding_date || wedding.location_text) && (
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {wedding.wedding_date && (
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                      <Calendar className="h-8 w-8 text-primary mx-auto mb-4" />
                      <h3 className="font-serif text-xl font-semibold text-primary mb-2">When</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">{formatDate(wedding.wedding_date)}</p>
                      <Button
                        onClick={addToCalendar}
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary hover:bg-primary hover:text-white"
                      >
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </Button>
                    </div>
                  )}
                  
                  {wedding.location_text && (
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                      <h3 className="font-serif text-xl font-semibold text-primary mb-2">Where</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">{wedding.location_text}</p>
                      {wedding.location_url && (
                        <a
                          href={wedding.location_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          View on Map
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Descriptions */}
              {(wedding.description1?.trim() || wedding.description2?.trim()) && (
                <div className="space-y-6 mb-12">
                  {wedding.description1?.trim() && (
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                      <div 
                        className="text-gray-700 leading-relaxed font-serif text-lg"
                        dangerouslySetInnerHTML={{ __html: wedding.description1 }}
                      />
                    </div>
                  )}
                  {wedding.description2?.trim() && (
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                      <div 
                        className="text-gray-700 leading-relaxed font-serif text-lg"
                        dangerouslySetInnerHTML={{ __html: wedding.description2 }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Contact Info */}
              {wedding.phone_number && (
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg mb-12">
                  <div className="text-sm font-semibold text-primary mb-1">Contact</div>
                  <p className="text-gray-700">{wedding.phone_number}</p>
                </div>
              )}

              {/* Attendance Form */}
              <AttendanceForm weddingId={wedding.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Audio Element */}
      {wedding.background_music && (
        <audio 
          ref={audioRef} 
          className="hidden" 
          preload="auto"
          onCanPlayThrough={() => {
            // Try to play when audio is ready
            if (!isMuted && audioRef.current) {
              audioRef.current.play().catch(() => {
                // Autoplay blocked - user will need to interact first
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default Invitation;