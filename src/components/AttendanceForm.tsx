import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AttendanceFormProps {
  weddingId: number;
  language?: string;
  attendanceDeadline?: string;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ weddingId, language, attendanceDeadline }) => {
  const [status, setStatus] = useState<'Attending' | 'Not Attending' | ''>('');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [guestNames, setGuestNames] = useState<string[]>(['']);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNumberOfGuestsChange = (value: string) => {
    const num = parseInt(value);
    setNumberOfGuests(num);
    
    // Adjust guest names array
    const newGuestNames = Array(num).fill('').map((_, index) => 
      guestNames[index] || ''
    );
    setGuestNames(newGuestNames);
  };

  const handleGuestNameChange = (index: number, name: string) => {
    const updatedNames = [...guestNames];
    updatedNames[index] = name;
    setGuestNames(updatedNames);
  };

  const handlePhoneNumberChange = (value: string) => {
    // Only allow numbers and limit to 11 digits
    const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
    setPhoneNumber(numbersOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!status) {
      toast({
        title: translations.error,
        description: translations.selectAttendanceStatus,
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: translations.error,
        description: translations.enterYourPhoneNumber,
        variant: "destructive",
      });
      return;
    }

    if ((status === 'Attending' || status === 'Not Attending') && guestNames.some(name => !name.trim())) {
      toast({
        title: translations.error, 
        description: translations.fillAllGuestNames,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if phone number already exists
      const { data: existingAttendance, error: checkError } = await supabase
        .from('attendances')
        .select('*')
        .eq('wedding_id', weddingId)
        .eq('phone_number', phoneNumber)
        .limit(1);

      if (checkError) throw checkError;

      if (existingAttendance && existingAttendance.length > 0) {
        toast({
          title: translations.alreadySubmitted,
          description: translations.alreadyFilledForm,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Insert attendance records for each guest
      const attendanceData = guestNames.slice(0, numberOfGuests).map(name => ({
        wedding_id: weddingId,
        guest_name: name.trim(),
        status: status,
        phone_number: phoneNumber,
      }));

      const { error } = await supabase
        .from('attendances')
        .insert(attendanceData);

      if (error) throw error;

      toast({
        title: translations.success,
        description: translations.attendanceConfirmed,
      });

      // Reset form
      setStatus('');
      setNumberOfGuests(1);
      setGuestNames(['']);
      setPhoneNumber('');
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast({
        title: translations.error,
        description: translations.failedToSubmit,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTranslations = (lang?: string) => {
    if (lang === 'ar') {
      return {
        confirmPresence: "الرجاء تأكيد حضورك",
        before: "قبل",
        attending: "حاضر",
        notAttending: "غير حاضر", 
        phoneNumber: "رقم الهاتف",
        enterPhoneNumber: "أدخل رقم الهاتف (أرقام فقط)",
        numberOfGuestsAttending: "عدد الضيوف الحاضرين",
        numberOfGuestsNotAttending: "عدد الضيوف غير الحاضرين",
        guest: "ضيف رقم",
        enterGuestName: "أدخل اسم الضيف",
        pressToConfirm: "اضغط للتأكيد",
        submitting: "جاري الإرسال...",
        error: "خطأ",
        selectAttendanceStatus: "الرجاء اختيار حالة الحضور",
        enterYourPhoneNumber: "الرجاء إدخال رقم هاتفك",
        fillAllGuestNames: "الرجاء ملء جميع أسماء الضيوف",
        alreadySubmitted: "تم الإرسال مسبقاً",
        alreadyFilledForm: "لقد قمت بملء النموذج بهذا الرقم من قبل.",
        success: "نجح!",
        attendanceConfirmed: "تم تأكيد حضورك. شكراً لك!",
        failedToSubmit: "فشل في إرسال الحضور. الرجاء المحاولة مرة أخرى."
      };
    }
    return {
      confirmPresence: "Kindly confirm your presence",
      before: "Before",
      attending: "Attending",
      notAttending: "Not Attending",
      phoneNumber: "Phone Number", 
      enterPhoneNumber: "Enter phone number (numbers only)",
      numberOfGuestsAttending: "Number of Guests Attending",
      numberOfGuestsNotAttending: "Number of Guests Not Attending",
      guest: "Guest #",
      enterGuestName: "Enter guest name",
      pressToConfirm: "Press To Confirm",
      submitting: "Submitting...",
      error: "Error",
      selectAttendanceStatus: "Please select your attendance status",
      enterYourPhoneNumber: "Please enter your phone number", 
      fillAllGuestNames: "Please fill in all guest names",
      alreadySubmitted: "Already Submitted",
      alreadyFilledForm: "You have already filled the form with this phone number.",
      success: "Success!",
      attendanceConfirmed: "Your attendance has been confirmed. Thank you!",
      failedToSubmit: "Failed to submit attendance. Please try again."
    };
  };

  const isArabic = language === 'ar';
  const translations = getTranslations(language);

  return (
    <Card className={`max-w-2xl mx-auto ${isArabic ? 'rtl' : ''}`} style={{ fontFamily: isArabic ? 'Amiri, serif' : 'inherit' }}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">
          {translations.confirmPresence}
        </CardTitle>
        <p className="text-muted-foreground">
          {translations.before} {attendanceDeadline ? new Date(attendanceDeadline).toLocaleDateString(isArabic ? 'ar-SA-u-ca-gregory' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString(isArabic ? 'ar-SA-u-ca-gregory' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={status === 'Attending' ? 'default' : 'outline'}
              className={`h-12 ${
                status === 'Attending' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'border-green-600 text-green-600 hover:bg-green-50'
              }`}
              onClick={() => setStatus('Attending')}
            >
              {translations.attending}
            </Button>
            <Button
              type="button"
              variant={status === 'Not Attending' ? 'default' : 'outline'}
              className={`h-12 ${
                status === 'Not Attending'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'border-gray-600 text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setStatus('Not Attending')}
            >
              {translations.notAttending}
            </Button>
          </div>

          {/* Phone Number */}
          {(status === 'Attending' || status === 'Not Attending') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-primary font-semibold">
                  {translations.phoneNumber}
                </Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  placeholder={translations.enterPhoneNumber}
                  className="h-12"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={11}
                  required
                />
              </div>

              {/* Number of Guests */}
              <div className="space-y-2">
                <Label htmlFor="numberOfGuests" className="text-primary font-semibold">
                  {status === 'Attending' ? translations.numberOfGuestsAttending : translations.numberOfGuestsNotAttending}
                </Label>
                <Select value={numberOfGuests.toString()} onValueChange={handleNumberOfGuestsChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Guest Names */}
              <div className="space-y-4">
                {guestNames.slice(0, numberOfGuests).map((name, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`guest-${index}`} className="text-primary font-semibold">
                      {translations.guest}{index + 1}
                    </Label>
                    <Input
                      id={`guest-${index}`}
                      value={name}
                      onChange={(e) => handleGuestNameChange(index, e.target.value)}
                      placeholder={translations.enterGuestName}
                      className="h-12"
                      required
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!status || loading}
            className="w-full h-12 bg-primary hover:bg-primary/90"
          >
            {loading ? translations.submitting : translations.pressToConfirm}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;