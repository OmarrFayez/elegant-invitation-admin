
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Calendar, VolumeX, Volume2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Event {
  id?: number;
  event_name: string;
  event_date: string;
  phone_number: string;
  description1: string;
  description2: string;
  location_text: string;
  location_url: string;
  background_image: string;
  background_music: string;
  background_color?: string;
}

interface EventPreviewProps {
  event: Event;
  trigger?: React.ReactNode;
}

const EventPreview = ({ event, trigger }: EventPreviewProps) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

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

      return { days, hours, minutes, seconds };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const addToCalendar = () => {
    const startDate = new Date(event.event_date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
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

  const backgroundStyle = event.background_image
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${event.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        background: event.background_color 
          ? `linear-gradient(135deg, ${event.background_color}, ${event.background_color}80)`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };

  const currentCountdown = calculateCountdown();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Preview Event</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-none">
        <div className="relative min-h-[600px] rounded-lg overflow-hidden" style={backgroundStyle}>
          {/* Close Button */}
          <DialogHeader className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Music Toggle */}
          {event.background_music && (
            <Button
              variant="ghost"
              className="absolute top-4 left-4 z-50 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              onClick={() => setIsMusicPlaying(!isMusicPlaying)}
            >
              {isMusicPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          )}

          {/* Hero Section */}
          <div className="min-h-[600px] flex flex-col items-center justify-center px-4 py-8">
            <div className="text-center mb-6">
              <DialogTitle className="text-3xl md:text-5xl font-bold text-white mb-4 font-serif tracking-tight">
                {event.event_name}
              </DialogTitle>
              <p className="text-lg md:text-xl text-white/90 mb-6 font-light">
                {new Date(event.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>

              {/* Countdown Timer */}
              <div className="flex justify-center space-x-3 md:space-x-6 mb-8">
                {[
                  { label: 'Days', value: currentCountdown.days },
                  { label: 'Hours', value: currentCountdown.hours },
                  { label: 'Min', value: currentCountdown.minutes },
                  { label: 'Sec', value: currentCountdown.seconds }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/30">
                      <div className="text-xl md:text-2xl font-bold text-white">
                        {item.value.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-white/80 uppercase tracking-wide">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Details Card */}
            <Card className="w-full max-w-lg bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl">
              <CardContent className="p-6">
                {event.description1 && (
                  <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2 text-center">{event.description1}</h2>
                  </div>
                )}

                {event.description2 && (
                  <div className="mb-6">
                    <p className="text-sm leading-relaxed text-center text-white/90">
                      {event.description2}
                    </p>
                  </div>
                )}

                {/* Contact & Location */}
                <div className="space-y-3">
                  {event.phone_number && (
                    <div className="flex items-center justify-center text-white/90">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.phone_number}</span>
                    </div>
                  )}

                  {event.location_text && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center text-white/90">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.location_text}</span>
                      </div>
                      {event.location_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs"
                          onClick={openLocation}
                        >
                          View in Google Maps
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Add to Calendar */}
                  <Button
                    size="sm"
                    className="w-full bg-white text-gray-800 hover:bg-white/90 font-semibold text-xs"
                    onClick={addToCalendar}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventPreview;
