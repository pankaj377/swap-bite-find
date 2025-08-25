-- Remove the flawed policy that doesn't actually restrict access
DROP POLICY IF EXISTS "Allow OTP verification by phone and code" ON public.otp_verifications;

-- Create a secure function for OTP verification that doesn't expose raw data
CREATE OR REPLACE FUNCTION public.verify_otp(
  p_phone_number TEXT,
  p_otp_code TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp_record RECORD;
  result JSONB;
BEGIN
  -- Find valid, non-expired, unverified OTP
  SELECT id, verified, expires_at, created_at
  INTO otp_record
  FROM public.otp_verifications
  WHERE phone_number = p_phone_number
    AND otp_code = p_otp_code
    AND expires_at > NOW()
    AND verified = false
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no valid OTP found
  IF otp_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired OTP'
    );
  END IF;

  -- Mark OTP as verified
  UPDATE public.otp_verifications
  SET verified = true
  WHERE id = otp_record.id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'otp_id', otp_record.id
  );
END;
$$;

-- Remove the overly permissive update policy
DROP POLICY IF EXISTS "Allow marking OTP as verified" ON public.otp_verifications;

-- Create minimal policies that don't expose data
CREATE POLICY "Restrict OTP table access"
ON public.otp_verifications
FOR ALL
USING (false)
WITH CHECK (false);

-- Allow INSERT for creating OTP records (needed for phone verification)
CREATE POLICY "Allow OTP creation"
ON public.otp_verifications
FOR INSERT
WITH CHECK (true);