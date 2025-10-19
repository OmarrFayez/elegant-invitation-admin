import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Calendar, MapPin, Users, VolumeX, Volume2, CalendarPlus, Play, Clock, Church, DollarSign, Banknote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import AttendanceForm from '@/components/AttendanceForm';
import OMTIcon from '@/components/icons/OMTIcon';
import WishMoneyIcon from '@/components/icons/WishMoneyIcon';

interface Wedding {
  id: number;
  wedding_name: string;
  groom_name?: string;
  bride_name?: string;
  wedding_date?: string;
  time?: string;
  church_time?: string;
  church_location?: string;
  church_name?: string;
  omt?: string;
  bank?: string;
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
  language?: string;
  attendance_deadline?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
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
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [visibleElements, setVisibleElements] = useState(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);
  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Observe all animation elements
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [wedding]);

  // Update meta tags for social sharing
  useEffect(() => {
    if (wedding) {
      // Use custom meta title and description if provided, otherwise generate defaults
      const weddingTitle = wedding.meta_title || wedding.wedding_name || `${wedding.groom_name} & ${wedding.bride_name} Wedding`;
      const weddingDescription = wedding.meta_description || (
        [wedding.groom_name, wedding.bride_name].filter(Boolean).length > 0 
          ? `Join ${[wedding.groom_name, wedding.bride_name].filter(Boolean).join(' & ')} in celebrating their special day`
          : 'You are invited to this wedding celebration'
      );
      
      // Update page title
      document.title = `${weddingTitle} - Wedding Invitation`;
      
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
      updateMetaTag('og:title', weddingTitle);
      updateMetaTag('og:description', weddingDescription);
      updateMetaTag('og:type', 'website');
      updateMetaTag('og:url', window.location.href);
      
      // Use wedding background image if available
      if (wedding.background_image) {
        const absoluteImageUrl = wedding.background_image.startsWith('http') 
          ? wedding.background_image 
          : `${window.location.origin}${wedding.background_image}`;
        updateMetaTag('og:image', absoluteImageUrl);
        updateMetaTag('og:image:width', '1200');
        updateMetaTag('og:image:height', '630');
        updateMetaTag('og:image:alt', `${weddingTitle} invitation`);
      }

      // Update Twitter Card tags
      updateMetaTagName('twitter:card', 'summary_large_image');
      updateMetaTagName('twitter:title', weddingTitle);
      updateMetaTagName('twitter:description', weddingDescription);
      
      if (wedding.background_image) {
        const absoluteImageUrl = wedding.background_image.startsWith('http') 
          ? wedding.background_image 
          : `${window.location.origin}${wedding.background_image}`;
        updateMetaTagName('twitter:image', absoluteImageUrl);
        updateMetaTagName('twitter:image:alt', `${weddingTitle} invitation`);
      }

      // Update meta description
      updateMetaTagName('description', weddingDescription);
    }
  }, [wedding]);

  useEffect(() => {
    const fetchWedding = async () => {
      if (!idOrSlug) return;

      console.log('Fetching wedding with idOrSlug:', idOrSlug);
      
      try {
        let query = supabase.from('weddings').select('*');
        
        // Try to fetch by slug first, then by ID
        if (isNaN(Number(idOrSlug))) {
          console.log('Fetching by slug:', idOrSlug);
          query = query.eq('slug', idOrSlug);
        } else {
          console.log('Fetching by ID:', idOrSlug);
          query = query.eq('id', parseInt(idOrSlug));
        }
        
        const { data, error } = await query.single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        console.log('Fetched wedding data:', data);
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
  }, [wedding?.background_music, isMuted]);

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

  const formatDate = (dateString?: string, language?: string) => {
    if (!dateString) return '';
    // Use Gregorian calendar for Arabic by specifying the calendar explicitly
    const locale = language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTranslations = (language?: string) => {
    if (language === 'ar') {
      return {
        playWeddingMusic: "تشغيل موسيقى الزفاف",
        areGettingMarried: "حفل زفاف",
        swipeUp: "اسحب للأعلى",
        days: "أيام",
        hours: "ساعات", 
        minutes: "دقائق",
        seconds: "ثواني",
        when: "الزمان",
        where: "المكان",
        addToCalendar: "أضف للتقويم",
        viewOnMap: "عرض الخريطة",
        contact: "اتصال",
        loadingInvitation: "جاري تحميل الدعوة...",
        invitationNotFound: "الدعوة غير موجودة",
        invitationNotFoundDesc: "الدعوة التي تبحث عنها غير موجودة أو تم حذفها.",
        weddingTime: "الوقت",
        churchTime: "الوقت",
        churchLocation: "Bridal Wreath",
        weddingLocation: "حفل الزفاف"
      };
    }
    return {
      playWeddingMusic: "Play Wedding Music",
      areGettingMarried: "are getting married",
      swipeUp: "Swipe Up", 
      days: "Days",
      hours: "Hours",
      minutes: "Minutes", 
      seconds: "Seconds",
      when: "When",
      where: "Where",
      addToCalendar: "Add to Calendar",
      viewOnMap: "View on Map",
      contact: "Contact",
      loadingInvitation: "Loading invitation...",
      invitationNotFound: "Invitation Not Found",
      invitationNotFoundDesc: "The invitation you're looking for doesn't exist or has been removed.",
      weddingTime: "Time",
      churchTime: "Time",
      churchLocation: "Bridal Wreath",
      weddingLocation: "Wedding venue"
    };
  };

  const addToCalendar = () => {
    if (!wedding?.wedding_date) return;

    const startDate = new Date(wedding.wedding_date);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours later
    
    const formatDateForUrl = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const eventDetails = {
      title: encodeURIComponent(wedding.wedding_name || `${wedding.groom_name} & ${wedding.bride_name} Wedding`),
      start: formatDateForUrl(startDate),
      end: formatDateForUrl(endDate),
      location: encodeURIComponent(wedding.location_text || ''),
      description: encodeURIComponent('Join us to celebrate this special day!')
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

  const isArabic = wedding?.language === 'ar';
  const translations = getTranslations(wedding?.language);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{translations.loadingInvitation}</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">{translations.invitationNotFound}</h1>
          <p className="text-muted-foreground">{translations.invitationNotFoundDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isArabic ? 'rtl' : ''}`} style={{ fontFamily: isArabic ? 'Amiri, serif' : 'inherit' }}>
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
      
      {/* Play Music Button (when autoplay is blocked) */}
      {wedding.background_music && showPlayButton && (
        <Button
          variant="default"
          size="lg"
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-primary/90 backdrop-blur-sm hover:bg-primary text-white border border-white/30 animate-pulse"
          onClick={playMusic}
        >
          <Play className="h-5 w-5 mr-2" />
          {translations.playWeddingMusic}
        </Button>
      )}

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
                {translations.areGettingMarried}
              </p>
            </div>

            {/* Countdown */}
            {wedding.wedding_date && (
              <div className="mb-12">
                <div className={`flex justify-center items-center gap-4 text-white ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold">{timeLeft.days}</div>
                    <div className="text-xs md:text-sm opacity-75 uppercase tracking-wider">{translations.days}</div>
                  </div>
                  <div className="text-2xl opacity-50">:</div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold">{timeLeft.hours}</div>
                    <div className="text-xs md:text-sm opacity-75 uppercase tracking-wider">{translations.hours}</div>
                  </div>
                  <div className="text-2xl opacity-50">:</div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold">{timeLeft.minutes}</div>
                    <div className="text-xs md:text-sm opacity-75 uppercase tracking-wider">{translations.minutes}</div>
                  </div>
                  <div className="text-2xl opacity-50">:</div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold">{timeLeft.seconds}</div>
                    <div className="text-xs md:text-sm opacity-75 uppercase tracking-wider">{translations.seconds}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Scroll Indicator */}
            <div className="animate-bounce">
              <div className="flex flex-col items-center gap-3 text-white/80">
                <p className="font-serif text-sm tracking-wider animate-pulse">{translations.swipeUp}</p>
                <div className="relative">
                  <div className="w-0.5 h-8 bg-white/60 animate-pulse"></div>
                  {/* Animated dots */}
                  <div className="absolute -left-1 top-0 w-2.5 h-2.5 bg-white/70 rounded-full animate-ping"></div>
                  <div className="absolute -left-1 top-3 w-2.5 h-2.5 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute -left-1 top-6 w-2.5 h-2.5 bg-white/50 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                </div>
                {/* Downward chevrons */}
                <div className="flex flex-col gap-1 animate-pulse">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-white/95 backdrop-blur-sm min-h-screen relative">
          {/* Floating scroll encouragement elements */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-16 h-16 bg-gradient-to-b from-primary/20 to-transparent rounded-full animate-pulse"></div>
          </div>
          
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto space-y-8">
              
               {/* Wedding Title */}
               {wedding.wedding_name && (
                 <div 
                   id="title-card"
                   data-animate
                   className={`text-center mb-12 transform transition-all duration-700 ${
                     visibleElements.has('title-card') 
                       ? 'animate-fade-in translate-y-0 opacity-100' 
                       : 'translate-y-8 opacity-0'
                   }`}
                   style={{ animationDelay: '0.1s' }}
                 >
                   <h2 className="font-script text-4xl md:text-5xl text-primary mb-4 animate-scale-in">
                     {wedding.wedding_name}
                   </h2>
                   <div className="w-24 h-0.5 bg-primary/30 mx-auto animate-slide-in-right" style={{ animationDelay: '0.5s' }}></div>
                 </div>
               )}

               {/* Date and Event Details */}
               <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {/* Date */}
                  {wedding.wedding_date && (
                    <div 
                      id="date-card"
                      data-animate
                      className={`text-center p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 ${
                        visibleElements.has('date-card') 
                          ? 'animate-fade-in translate-y-0 opacity-100' 
                          : 'translate-y-8 opacity-0'
                      }`}
                      style={{ 
                        animationDelay: '0.2s',
                        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                     <Calendar className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
                     
                     <p className="text-gray-700 leading-relaxed mb-3">{formatDate(wedding.wedding_date, wedding.language)}</p>
                     <Button
                       onClick={addToCalendar}
                       variant="outline"
                       size="sm"
                       className="text-primary border-primary hover:bg-primary hover:text-white transition-all duration-200 hover:scale-105"
                     >
                       <CalendarPlus className="h-4 w-4 mr-2" />
                       {translations.addToCalendar}
                     </Button>
                   </div>
                 )}

                  {/* Wedding Location & Time */}
                  {(wedding.location_text || wedding.time) && (
                    <div 
                      id="location-card"
                      data-animate
                      className={`text-center p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 ${
                        visibleElements.has('location-card') 
                          ? 'animate-fade-in translate-y-0 opacity-100' 
                          : 'translate-y-8 opacity-0'
                      }`}
                      style={{ 
                        animationDelay: '0.4s',
                        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                     <div className="flex justify-center items-center mb-4 gap-2">
                       <MapPin className="h-8 w-8 text-primary animate-bounce" />
                       {wedding.time && <Clock className="h-6 w-6 text-primary/70 animate-pulse" />}
                     </div>
                    
                    <div className="space-y-4">
                      {wedding.location_text && (
                        <div className={wedding.time ? "border-b border-gray-100 pb-3" : ""}>
                          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">
                            {translations.weddingLocation}
                          </div>
                          <div className="text-gray-700 leading-relaxed font-semibold mb-2">
                            {wedding.location_text}
                          </div>
                          {wedding.location_url && (
                            <a
                              href={wedding.location_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                            >
                              <MapPin className="h-3 w-3" />
                              {translations.viewOnMap}
                            </a>
                          )}
                        </div>
                      )}
                      
                      {wedding.time && (
                        <div className={wedding.location_text ? 'pt-1' : ''}>
                          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">
                            {translations.weddingTime}
                          </div>
                          <p className="text-gray-700 leading-relaxed font-semibold">{wedding.time}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

                {/* Church Details */}
                {(wedding.church_name || wedding.church_time) && (
                  <div className="mb-12">
                    <div 
                      id="church-card"
                      data-animate
                      className={`text-center p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 ${
                        visibleElements.has('church-card') 
                          ? 'animate-fade-in translate-y-0 opacity-100' 
                          : 'translate-y-8 opacity-0'
                      }`}
                      style={{ 
                        animationDelay: '0.6s',
                        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                     <div className="flex justify-center items-center mb-4 gap-2">
                       <Church className="h-8 w-8 text-primary animate-bounce" />
                       {wedding.church_time && <Clock className="h-6 w-6 text-primary/70 animate-pulse" />}
                     </div>
                    
                    <div className="space-y-4">
                      {wedding.church_name && (
                        <div className={wedding.church_time ? "border-b border-gray-100 pb-3" : ""}>
                          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">
                            {translations.churchLocation}
                          </div>
                          <div className="text-gray-700 leading-relaxed font-semibold mb-2">
                            {wedding.church_name}
                          </div>
                          {wedding.church_location && (
                            <a
                              href={`https://maps.google.com/maps?q=${encodeURIComponent(wedding.church_location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                            >
                              <MapPin className="h-3 w-3" />
                              {translations.viewOnMap}
                            </a>
                          )}
                        </div>
                      )}
                      
                      {wedding.church_time && (
                        <div className={wedding.church_name ? 'pt-1' : ''}>
                          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">
                            {translations.churchTime}
                          </div>
                          <p className="text-gray-700 leading-relaxed font-semibold">{wedding.church_time}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
               )}

               {/* Descriptions */}
               {(wedding.description1?.trim() || wedding.description2?.trim()) && (
                 <div className="space-y-6 mb-12">
                    {wedding.description1?.trim() && (
                      <div 
                        id="desc1-card"
                        data-animate
                        className={`text-center p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 ${
                          visibleElements.has('desc1-card') 
                            ? 'animate-fade-in translate-y-0 opacity-100' 
                            : 'translate-y-8 opacity-0'
                        }`}
                        style={{ 
                          animationDelay: '0.8s',
                          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                       <div 
                         className="text-gray-700 leading-relaxed font-serif text-lg"
                         dangerouslySetInnerHTML={{ __html: wedding.description1 }}
                       />
                     </div>
                   )}
                    {wedding.description2?.trim() && (
                      <div 
                        id="desc2-card"
                        data-animate
                        className={`text-center p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 ${
                          visibleElements.has('desc2-card') 
                            ? 'animate-fade-in translate-y-0 opacity-100' 
                            : 'translate-y-8 opacity-0'
                        }`}
                        style={{ 
                          animationDelay: '1s',
                          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                        }}
                      >
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
                  <div 
                    id="contact-card"
                    data-animate
                    className={`text-center p-6 bg-white rounded-2xl shadow-2xl mb-12 transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 ${
                      visibleElements.has('contact-card') 
                        ? 'animate-fade-in translate-y-0 opacity-100' 
                        : 'translate-y-8 opacity-0'
                    }`}
                    style={{ 
                      animationDelay: '1.2s',
                      boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                   <div className="text-sm font-semibold text-primary mb-1 animate-pulse">{translations.contact}</div>
                   <p className="text-gray-700">{wedding.phone_number}</p>
                 </div>
               )}

              {/* Payment Details */}
              {(wedding.omt || wedding.bank || wedding.wish_account) && (() => {
                const paymentFieldsCount = [wedding.omt, wedding.bank, wedding.wish_account].filter(Boolean).length;
                const gridClass = paymentFieldsCount === 1 ? 'grid-cols-1' : paymentFieldsCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';
                
                 return (
                   <div className={`grid ${gridClass} gap-6 mb-12`}>
                      {wedding.omt && (
                        <div 
                          id="omt-card"
                          data-animate
                          className={`text-center p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 ${
                            visibleElements.has('omt-card') 
                              ? 'animate-fade-in translate-y-0 opacity-100' 
                              : 'translate-y-8 opacity-0'
                          }`}
                          style={{ 
                            animationDelay: '1.4s',
                            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                         <h3 className="text-primary font-semibold mb-4 animate-pulse">OMT</h3>
                         <p className="text-gray-700 leading-relaxed">{wedding.omt}</p>
                       </div>
                     )}
                     
                      {wedding.bank && (
                        <div 
                          id="bank-card"
                          data-animate
                          className={`text-center p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 ${
                            visibleElements.has('bank-card') 
                              ? 'animate-fade-in translate-y-0 opacity-100' 
                              : 'translate-y-8 opacity-0'
                          }`}
                          style={{ 
                            animationDelay: '1.6s',
                            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                         <h3 className="text-primary font-semibold mb-4 animate-pulse">Bank</h3>
                         <p className="text-gray-700 leading-relaxed">{wedding.bank}</p>
                       </div>
                     )}
                     
                      {wedding.wish_account && (
                        <div 
                          id="wish-card"
                          data-animate
                          className={`text-center p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 ${
                            visibleElements.has('wish-card') 
                              ? 'animate-fade-in translate-y-0 opacity-100' 
                              : 'translate-y-8 opacity-0'
                          }`}
                          style={{ 
                            animationDelay: '1.8s',
                            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 25px -8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                         <h3 className="text-primary font-semibold mb-4 animate-pulse">Whish</h3>
                         <p className="text-gray-700 leading-relaxed">{wedding.wish_account}</p>
                       </div>
                     )}
                   </div>
                 );
              })()}

                {/* Attendance Form */}
                <div 
                  id="attendance-form"
                  data-animate
                  className={`transform transition-all duration-700 ${
                    visibleElements.has('attendance-form') 
                      ? 'animate-fade-in translate-y-0 opacity-100' 
                      : 'translate-y-8 opacity-0'
                  }`}
                  style={{ animationDelay: '2s' }}
                >
                 <AttendanceForm weddingId={wedding.id} language={wedding.language} attendanceDeadline={wedding.attendance_deadline} />
               </div>
               
               {/* Bottom scroll indicator */}
               <div className="text-center py-8 animate-fade-in" style={{ animationDelay: '2.4s' }}>
                 <div className="inline-flex flex-col items-center gap-2 text-gray-400">
                   <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center animate-bounce">
                     <Heart className="h-4 w-4 text-primary animate-pulse" />
                   </div>
                   <p className="text-xs font-medium tracking-wide">Thank You</p>
                 </div>
               </div>
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
