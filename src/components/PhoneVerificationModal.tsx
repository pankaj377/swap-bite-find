
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerified: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  onVerified
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const sendOTP = async () => {
    setIsResending(true);
    try {
      // Generate a 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone_number: phoneNumber,
          otp_code: otpCode,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });

      if (error) throw error;

      // In a real app, you would send SMS here
      console.log('OTP Code (for testing):', otpCode);
      toast.success(`OTP sent to ${phoneNumber} (Check console for demo)`);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP');
    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('otp_code', otp)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        // Mark as verified
        await supabase
          .from('otp_verifications')
          .update({ verified: true })
          .eq('id', data[0].id);

        toast.success('Phone number verified successfully!');
        onVerified();
        onClose();
      } else {
        toast.error('Invalid or expired OTP');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && phoneNumber) {
      sendOTP();
    }
  }, [isOpen, phoneNumber]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Phone Number</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            We've sent a verification code to {phoneNumber}
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="otp">Enter 6-digit code</Label>
            <InputOTP value={otp} onChange={setOtp} maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={verifyOTP}
              disabled={isVerifying || otp.length !== 6}
              className="flex-1"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
            <Button
              variant="outline"
              onClick={sendOTP}
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
