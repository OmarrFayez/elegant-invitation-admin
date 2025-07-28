
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Calendar, VolumeX, Volume2, ArrowLeft } from "lucide-react";
import EventAttendanceForm from "@/components/EventAttendanceForm";

interface Event {
  id: number;
  event_name: string;
  event_date: string;
  phone_number: string;
  description1: string;
  description2: string;
  location_text: string;
  location_url: string;
  background_image: string;
  mobile_background_image?: string;
  background_music: string;
  background_color?: string;
  subtitle?: string;
  language?: string;
  slug?: string;
}

const EventInvitation = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const getTranslations = (language?: string) => {
    if (language === 'ar') {
      return {
        eventNotFound: "الحدث غير موجود",
        errorLoadingEvent: "خطأ في تحميل الحدث",
        goHome: "الذهاب للرئيسية",
        days: "أيام",
        hours: "ساعات",
        minutes: "دقائق", 
        seconds: "ثواني",
        viewInGoogleMaps: "عرض في خرائط جوجل",
        addToCalendar: "أضف للتقويم"
      };
    }
    return {
      eventNotFound: "Event not found",
      errorLoadingEvent: "Error loading event",
      goHome: "Go Home",
      days: "Days",
      hours: "Hours", 
      minutes: "Minutes",
      seconds: "Seconds",
      viewInGoogleMaps: "View in Google Maps",
      addToCalendar: "Add to Calendar"
    };
  };

  const fetchEvent = async () => {
    try {
      // Check if idOrSlug is a number (for id) or string (for slug)
      const isNumeric = !isNaN(Number(idOrSlug));
      
      let query = supabase.from("events").select("*");
      
      if (isNumeric) {
        // If numeric, search by both id and slug
        query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
      } else {
        // If not numeric, only search by slug
        query = query.eq('slug', idOrSlug);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: getTranslations(undefined).eventNotFound,
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setEvent(data);
    } catch (error: any) {
      toast({
        title: getTranslations(undefined).errorLoadingEvent,
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const calculateCountdown = () => {
    if (!event?.event_date) return;

    const eventDate = new Date(event.event_date).getTime();
    const now = new Date().getTime();
    const difference = eventDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    } else {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const toggleMusic = () => {
    if (!event?.background_music) return;

    if (audio) {
      if (isMusicPlaying) {
        audio.pause();
        setIsMusicPlaying(false);
      } else {
        audio.play().catch(console.error);
        setIsMusicPlaying(true);
      }
    }
  };

  const addToCalendar = () => {
    if (!event) return;

    const startDate = new Date(event.event_date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.event_name)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent((event.description1 + ' ' + event.description2).trim())}&location=${encodeURIComponent(event.location_text)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const openLocation = () => {
    if (event?.location_url) {
      window.open(event.location_url, '_blank');
    }
  };

  const callPhone = () => {
    if (event?.phone_number) {
      window.location.href = `tel:${event.phone_number}`;
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [idOrSlug]);

  useEffect(() => {
    if (event?.background_music) {
      const audioElement = new Audio(event.background_music);
      audioElement.loop = true;
      audioElement.volume = 0.3;
      setAudio(audioElement);
      
      // Auto-play music (browsers may block this)
      audioElement.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {
        setIsMusicPlaying(false);
      });

      return () => {
        audioElement.pause();
        audioElement.remove();
      };
    }
  }, [event]);

  useEffect(() => {
    if (event) {
      calculateCountdown();
      const interval = setInterval(calculateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [event]);

  // Update meta tags for social sharing
  useEffect(() => {
    if (event) {
      // Update page title
      document.title = `${event.event_name} - E-cards Invitation`;
      
      // Update or create meta tags for social sharing
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      const updateMetaTagName = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // Update Open Graph tags
      updateMetaTag('og:title', event.event_name);
      updateMetaTag('og:description', event.description1 ? event.description1.replace(/<[^>]*>/g, '') : 'You are invited to this special event');
      updateMetaTag('og:type', 'website');
      
      // Use event background image if available, otherwise use default
      if (event.background_image) {
        // Ensure the image URL is absolute for social media sharing
        const absoluteImageUrl = event.background_image.startsWith('http') 
          ? event.background_image 
          : `${window.location.origin}${event.background_image}`;
        updateMetaTag('og:image', absoluteImageUrl);
        updateMetaTag('og:image:width', '1200');
        updateMetaTag('og:image:height', '630');
        updateMetaTag('og:image:alt', `${event.event_name} invitation`);
      }
      
      updateMetaTag('og:url', window.location.href);

      // Update Twitter Card tags
      updateMetaTagName('twitter:card', 'summary_large_image');
      updateMetaTagName('twitter:title', event.event_name);
      updateMetaTagName('twitter:description', event.description1 ? event.description1.replace(/<[^>]*>/g, '') : 'You are invited to this special event');
      
      if (event.background_image) {
        // Ensure the image URL is absolute for social media sharing
        const absoluteImageUrl = event.background_image.startsWith('http') 
          ? event.background_image 
          : `${window.location.origin}${event.background_image}`;
        updateMetaTagName('twitter:image', absoluteImageUrl);
        updateMetaTagName('twitter:image:alt', `${event.event_name} invitation`);
      }

      // Update meta description
      updateMetaTagName('description', event.description1 ? event.description1.replace(/<[^>]*>/g, '') : 'You are invited to this special event');
    }
  }, [event]);

  const isArabic = event?.language === 'ar';
  const translations = getTranslations(event?.language);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{translations.eventNotFound}</h2>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {translations.goHome}
          </Button>
        </Card>
      </div>
    );
  }

  // Choose the appropriate background image based on device type
  const backgroundImage = isMobile && event.mobile_background_image 
    ? event.mobile_background_image 
    : event.background_image;

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }
    : {
        background: event.background_color 
          ? `linear-gradient(135deg, ${event.background_color}, ${event.background_color}80)`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans ${isArabic ? 'rtl' : ''}`} style={{ ...backgroundStyle, fontFamily: isArabic ? 'Amiri, serif' : 'inherit' }}>
      
      {/* Mobile responsive background overlay for better image display */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .min-h-screen {
              background-attachment: scroll !important;
              background-size: cover !important;
              background-position: center center !important;
            }
          }
        `
      }} />

      {/* Music Toggle */}
      {event.background_music && (
        <Button
          variant="ghost"
          className="absolute top-4 right-4 z-50 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          onClick={toggleMusic}
        >
          {isMusicPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      )}

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 font-serif tracking-tight">
            {event.event_name}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
            {new Date(event.event_date).toLocaleDateString(isArabic ? 'ar-SA-u-ca-gregory' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>

          {/* Countdown Timer */}
          <div className={`flex justify-center space-x-4 md:space-x-8 mb-12 ${isArabic ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {[
              { label: translations.days, value: countdown.days },
              { label: translations.hours, value: countdown.hours },
              { label: translations.minutes, value: countdown.minutes },
              { label: translations.seconds, value: countdown.seconds }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/30">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-white/80 uppercase tracking-wide">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subtitle */}
          {event.subtitle && (
<p className="text-[1.60rem] md:text-[2.5rem] text-white/90 mb-8 font-bold font-serif tracking-tight text-center">
  {event.subtitle}
</p>
          )}
        </div>

        {/* Event Details Card */}
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl">
          <CardContent className="p-8">
            {event.description1 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3 text-center" dangerouslySetInnerHTML={{ __html: event.description1 }}></h2>
              </div>
            )}

            {event.description2 && (
              <div className="mb-8">
                <p className="text-lg leading-relaxed text-center text-white/90" dangerouslySetInnerHTML={{ __html: event.description2 }}>
                </p>
              </div>
            )}

            {/* Contact & Location */}
            <div className="space-y-4">
              {event.phone_number && (
                <Button
                  variant="ghost"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30"
                  onClick={callPhone}
                >
                  <Phone className="h-5 w-5 mr-3" />
                  {event.phone_number}
                </Button>
              )}

              {event.location_text && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center text-white/90 mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{event.location_text}</span>
                  </div>
                  {event.location_url && (
                    <Button
                      variant="ghost"
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30"
                      onClick={openLocation}
                    >
                      {translations.viewInGoogleMaps}
                    </Button>
                  )}
                </div>
              )}

              {/* Add to Calendar */}
              <Button
                variant="ghost"
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30"
                onClick={addToCalendar}
              >
                <Calendar className="h-5 w-5 mr-3" />
                {translations.addToCalendar}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Form */}
        <div className="w-full max-w-2xl mt-8">
          <EventAttendanceForm eventId={event.id} language={event.language} />
        </div>

      </div>
    </div>
  );
};

export default EventInvitation;
