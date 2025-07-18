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
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ weddingId }) => {
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
        title: "Error",
        description: "Please select your attendance status",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (phoneNumber.length < 10) {
      toast({
        title: "Error",
        description: "Phone number must be at least 10 digits",
        variant: "destructive",
      });
      return;
    }

    if ((status === 'Attending' || status === 'Not Attending') && guestNames.some(name => !name.trim())) {
      toast({
        title: "Error", 
        description: "Please fill in all guest names",
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
          title: "Already Submitted",
          description: "You have already filled the form with this phone number.",
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
        title: "Success!",
        description: `Your attendance has been confirmed. Thank you!`,
      });

      // Reset form
      setStatus('');
      setNumberOfGuests(1);
      setGuestNames(['']);
      setPhoneNumber('');
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast({
        title: "Error",
        description: "Failed to submit attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">
          Kindly confirm your presence
        </CardTitle>
        <p className="text-muted-foreground">
          Before {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
              Attending
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
              Not Attending
            </Button>
          </div>

          {/* Phone Number */}
          {(status === 'Attending' || status === 'Not Attending') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-primary font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  placeholder="Enter phone number (numbers only)"
                  className="h-12"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={11}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Maximum 11 digits, numbers only
                </p>
              </div>

              {/* Number of Guests */}
              <div className="space-y-2">
                <Label htmlFor="numberOfGuests" className="text-primary font-semibold">
                  {status === 'Attending' ? 'Number of Guests Attending' : 'Number of Guests Not Attending'}
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
                      Guest #{index + 1}
                    </Label>
                    <Input
                      id={`guest-${index}`}
                      value={name}
                      onChange={(e) => handleGuestNameChange(index, e.target.value)}
                      placeholder="Enter guest name"
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
            {loading ? 'Submitting...' : 'Press To Confirm'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;