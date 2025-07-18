
import React, { useState, useEffect, useRef } from 'react';
import { X, VolumeX, Volume2, Heart, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
}

interface InvitationPreviewProps {
  wedding: Wedding;
  onClose: () => void;
}

const InvitationPreview: React.FC<InvitationPreviewProps> = ({ wedding, onClose }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!wedding.wedding_date) return;

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
  }, [wedding.wedding_date]);

  useEffect(() => {
    if (wedding.background_music && audioRef.current) {
      audioRef.current.src = wedding.background_music;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      
      if (!isMuted) {
        audioRef.current.play().catch(() => {
          // Auto-play might be blocked by browser
        });
      }
    }
  }, [wedding.background_music, isMuted]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto">
        <Card className="relative overflow-hidden">
          {/* Background Image */}
          {wedding.background_image && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
              style={{ backgroundImage: `url(${wedding.background_image})` }}
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/20" />
          
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-gray-900"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Mute Button */}
          {wedding.background_music && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-16 z-10 bg-white/80 hover:bg-white text-gray-900"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}

          <CardContent className="relative z-10 p-8 text-center">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-primary mb-2">
                {wedding.wedding_name}
              </h1>
              <div className="flex items-center justify-center gap-2 text-2xl text-muted-foreground">
                <Heart className="h-6 w-6 text-rose-500 fill-current" />
                <span className="font-semibold">{wedding.groom_name}</span>
                <span>&</span>
                <span className="font-semibold">{wedding.bride_name}</span>
                <Heart className="h-6 w-6 text-rose-500 fill-current" />
              </div>
            </div>

            {/* Countdown Timer */}
            {wedding.wedding_date && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-primary">Wedding Countdown</h2>
                <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
                    <div className="text-sm text-muted-foreground">Seconds</div>
                  </div>
                </div>
              </div>
            )}

            {/* Date and Location */}
            {(wedding.wedding_date || wedding.location_text) && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {wedding.wedding_date && (
                  <div className="bg-white/90 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-primary">Wedding Date</h3>
                    </div>
                    <p className="text-foreground">{formatDate(wedding.wedding_date)}</p>
                  </div>
                )}
                
                {wedding.location_text && (
                  <div className="bg-white/90 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-primary">Location</h3>
                    </div>
                    <p className="text-foreground">{wedding.location_text}</p>
                    {wedding.location_url && (
                      <a
                        href={wedding.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm mt-2 inline-block"
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
              <div className="space-y-4 mb-8">
                {wedding.description1?.trim() && (
                  <div className="bg-white/90 rounded-lg p-6 shadow-lg">
                    <p className="text-foreground italic">{wedding.description1}</p>
                  </div>
                )}
                {wedding.description2?.trim() && (
                  <div className="bg-white/90 rounded-lg p-6 shadow-lg">
                    <p className="text-foreground italic">{wedding.description2}</p>
                  </div>
                )}
              </div>
            )}

            {/* Additional Info */}
            {(wedding.max_attendance || wedding.phone_number || wedding.email) && (
              <div className="grid md:grid-cols-3 gap-4">
                {wedding.max_attendance && (
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Max Guests</span>
                    </div>
                    <p className="text-foreground">{wedding.max_attendance}</p>
                  </div>
                )}
                
                {wedding.phone_number && (
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <div className="text-sm font-semibold text-primary mb-1">Contact</div>
                    <p className="text-foreground text-sm">{wedding.phone_number}</p>
                  </div>
                )}
                
                {wedding.email && (
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <div className="text-sm font-semibold text-primary mb-1">Email</div>
                    <p className="text-foreground text-sm">{wedding.email}</p>
                  </div>
                )}
              </div>
            )}

            {/* Wish Account */}
            {wedding.whish_account && (
              <div className="mt-6 bg-white/90 rounded-lg p-6 shadow-lg">
                <h3 className="font-semibold text-primary mb-2">Wedding Wishes</h3>
                <p className="text-foreground">{wedding.whish_account}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audio Element */}
        {wedding.background_music && (
          <audio ref={audioRef} className="hidden" />
        )}
      </div>
    </div>
  );
};

export default InvitationPreview;
