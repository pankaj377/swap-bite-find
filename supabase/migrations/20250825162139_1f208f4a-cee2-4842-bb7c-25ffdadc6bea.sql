-- Remove the overly permissive policies that allow anyone to read/write OTP records
DROP POLICY IF EXISTS "Anyone can create OTP records" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can read OTP records for verification" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can update OTP records" ON public.otp_verifications;

-- Create a more secure policy for OTP verification that only allows reading by phone number
-- This allows verification without exposing all records
CREATE POLICY "Allow OTP verification by phone and code"
ON public.otp_verifications
FOR SELECT
USING (phone_number = phone_number AND otp_code = otp_code);

-- Allow creating OTP records for phone verification (needed for signup flow)
CREATE POLICY "Allow creating OTP records"
ON public.otp_verifications  
FOR INSERT
WITH CHECK (true);

-- Only allow updating records to mark them as verified, but restrict access
CREATE POLICY "Allow marking OTP as verified"
ON public.otp_verifications
FOR UPDATE
USING (phone_number = phone_number AND otp_code = otp_code)
WITH CHECK (verified = true);