import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, VolumeX, Volume2, CalendarPlus, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: number;
  event_name: string;
  event_date?: string;
  max_attendance?: number;
  description1?: string;
  description2?: string;
  phone_number?: string;
  email?: string;
  background_image?: string;
  background_music?: string;
  location_text?: string;
  location_url?: string;
  wish_account?: string;
  background_color?: string;
  slug?: string;
}

interface EventAttendance {
  id: number;
  event_id: number;
  guest_name?: string;
  phone_number?: string;
  status: string;
  date_added: string;
}

const EventInvitation: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('Attending');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!idOrSlug) return;

      try {
        let query = supabase.from('events').select('*');
        
        // Try to fetch by slug first, then by ID
        if (isNaN(Number(idOrSlug))) {
          query = query.eq('slug', idOrSlug);
        } else {
          query = query.eq('id', parseInt(idOrSlug));
        }
        
        const { data, error } = await query.single();

        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [idOrSlug]);

  useEffect(() => {
    if (!event?.event_date) return;

    const calculateTimeLeft = () => {
      const eventDate = new Date(event.event_date!);
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

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
  }, [event?.event_date]);

  useEffect(() => {
    if (event?.background_music && audioRef.current) {
      audioRef.current.src = event.background_music;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      
      // Try autoplay first
      if (!isMuted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Autoplay was prevented:", error);
            setShowPlayButton(true); // Show play button when autoplay fails
          });
        }
      }
    }
  }, [event?.background_music, isMuted]);

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
      setShowPlayButton(false); // Hide play button once user interacts
    }
  };

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setShowPlayButton(false);
        setIsMuted(false);
      }).catch(() => {
        console.log("Still unable to play music");
      });
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
    if (!event?.event_date) return;

    const startDate = new Date(event.event_date);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours later
    
    const formatDateForUrl = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const eventDetails = {
      title: encodeURIComponent(event.event_name),
      start: formatDateForUrl(startDate),
      end: formatDateForUrl(endDate),
      location: encodeURIComponent(event.location_text || ''),
      description: encodeURIComponent('Join us for this special event!')
    };

    // Detect device and open appropriate calendar
    const userAgent = navigator.userAgent || navigator.vendor;
    
    // For mobile devices, try to open native calendar
    if (/android/i.test(userAgent)) {
      // Android Calendar
      const androidUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventDetails.title}&dates=${eventDetails.start}/${eventDetails.end}&location=${eventDetails.location}&details=${eventDetails.description}`;
      window.open(androidUrl, '_blank');
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      // iOS Calendar - try native first, fallback to Google
      const iosUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.href}
DTSTART:${eventDetails.start}
DTEND:${eventDetails.end}
SUMMARY:${decodeURIComponent(eventDetails.title)}
DESCRIPTION:${decodeURIComponent(eventDetails.description)}
LOCATION:${decodeURIComponent(eventDetails.location)}
END:VEVENT
END:VCALENDAR`;
      
      // Try to open with native calendar
      window.location.href = iosUrl;
    } else {
      // Desktop - open Google Calendar
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventDetails.title}&dates=${eventDetails.start}/${eventDetails.end}&location=${eventDetails.location}&details=${eventDetails.description}`;
      window.open(googleUrl, '_blank');
    }
  };

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('event_attendances')
        .insert([
          {
            event_id: event.id,
            guest_name: guestName,
            phone_number: phoneNumber,
            status: status,
          },
        ]);

      if (error) throw error;

      setSubmitted(true);
      setGuestName('');
      setPhoneNumber('');
      setStatus('Attending');
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Failed to submit RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

  if (!event) {
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
      {event.background_image ? (
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${event.background_image})` }}
        />
      ) : (
        <div
          className="fixed inset-0"
          style={{ backgroundColor: event.background_color || '#f3f4f6' }}
        />
      )}
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/40" />
      
      {/* Play Music Button (when autoplay is blocked) */}
      {event.background_music && showPlayButton && (
        <Button
          variant="default"
          size="lg"
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-primary/90 backdrop-blur-sm hover:bg-primary text-white border border-white/30 animate-pulse"
          onClick={playMusic}
        >
          <Play className="h-5 w-5 mr-2" />
          Play Event Music
        </Button>
      )}

      {/* Mute Button */}
      {event.background_music && (
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
            {/* Event Name */}
            <div className="mb-8">
              <h1 className="font-script text-5xl md:text-6xl font-bold mb-4 leading-tight">
                {event.event_name}
              </h1>
              <p className="font-serif text-lg md:text-xl opacity-90 tracking-wider">
                You're Invited
              </p>
            </div>

            {/* Countdown */}
            {event.event_date && (
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
              
              {/* Date and Location */}
              {(event.event_date || event.location_text) && (
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {event.event_date && (
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                      <Calendar className="h-8 w-8 text-primary mx-auto mb-4" />
                      <h3 className="font-serif text-xl font-semibold text-primary mb-2">When</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">{formatDate(event.event_date)}</p>
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
                  
                  {event.location_text && (
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                      <h3 className="font-serif text-xl font-semibold text-primary mb-2">Where</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">{event.location_text}</p>
                      {event.location_url && (
                        <a
                          href={event.location_url}
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
              {(event.description1?.trim() || event.description2?.trim()) && (
                <div className="space-y-6 mb-12">
                  {event.description1?.trim() && (
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                      <div 
                        className="text-gray-700 leading-relaxed font-serif text-lg"
                        dangerouslySetInnerHTML={{ __html: event.description1 }}
                      />
                    </div>
                  )}
                  {event.description2?.trim() && (
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                      <div 
                        className="text-gray-700 leading-relaxed font-serif text-lg"
                        dangerouslySetInnerHTML={{ __html: event.description2 }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Contact Info */}
              {event.phone_number && (
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg mb-12">
                  <div className="text-sm font-semibold text-primary mb-1">Contact</div>
                  <p className="text-gray-700">{event.phone_number}</p>
                </div>
              )}

              {/* RSVP Form */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  {submitted ? (
                    <div className="text-center">
                      <div className="text-green-600 text-4xl mb-4">✓</div>
                      <h3 className="text-2xl font-semibold text-primary mb-2">Thank You!</h3>
                      <p className="text-gray-600">Your RSVP has been submitted successfully.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleRSVP} className="space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-semibold text-primary mb-2">RSVP</h3>
                        <p className="text-gray-600">Please let us know if you'll be attending</p>
                      </div>

                      <div>
                        <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          id="guestName"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          Will you be attending?
                        </label>
                        <select
                          id="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="Attending">Yes, I'll be there</option>
                          <option value="Not Attending">Sorry, can't make it</option>
                        </select>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
                      >
                        {submitting ? 'Submitting...' : 'Submit RSVP'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Element */}
      {event.background_music && (
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

export default EventInvitation;