import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Smartphone, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import scooterLogo from '@/assets/scooter-logo.png';

const LoginPage = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setIsLoading(true);
      
      // Simulate OTP sending with a delay
      setTimeout(() => {
        toast({
          title: "OTP Sent",
          description: "Please check your mobile for the verification code",
        });
        setStep('otp');
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      setIsLoading(true);
      
      try {
        // First, try to find existing user with this phone number
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('mobile_number', phoneNumber)
          .maybeSingle();

        let userId;
        
        if (existingProfile) {
          // Use existing user
          userId = existingProfile.user_id;
          
          // Create anonymous session and update it with existing user ID
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          
          // Store the mapping persistently
          sessionStorage.setItem('actualUserId', userId);
          localStorage.setItem('phoneToUserId', JSON.stringify({ [phoneNumber]: userId }));
        } else {
          // Create new anonymous user
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          
          userId = data.user!.id;
          
          // Create new profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              mobile_number: phoneNumber,
              display_name: `User ${phoneNumber.slice(-4)}`,
            });
          
          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
          
          // Store the mapping for new users too
          localStorage.setItem('phoneToUserId', JSON.stringify({ [phoneNumber]: userId }));
        }
        
        toast({
          title: "Success",
          description: "Login successful!",
        });
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Login error:', error);
        toast({
          title: "Error",
          description: "Login failed. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src={scooterLogo} 
                alt="MS-Scooter-Support" 
                className="w-16 h-16 object-contain"
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-electric rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-electric bg-clip-text text-transparent">
              MS-Scooter-Support
            </h1>
            <p className="text-muted-foreground">Customer Support Portal</p>
          </div>
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'Enter your mobile number to continue' 
                : `We've sent a 6-digit code to ${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-l-none border-l-0 focus:ring-primary"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  variant="electric" 
                  className="w-full"
                  disabled={isLoading || phoneNumber.length < 10}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending OTP...
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-center block">Enter 6-digit OTP</Label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="w-12 h-12 text-center text-lg font-bold border border-border rounded-md bg-light-gray hover:bg-accent focus:bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        maxLength={1}
                        inputMode="numeric"
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    variant="electric" 
                    className="w-full"
                    disabled={isLoading || otp.join('').length < 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      'Verify & Login'
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => setStep('phone')}
                  >
                    ← Change Number
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-sm text-muted-foreground"
                    onClick={() => {
                      setIsLoading(true);
                      
                      // Simulate resending OTP with a delay
                      setTimeout(() => {
                        toast({
                          title: "OTP Resent",
                          description: "Please check your mobile for the new verification code",
                        });
                        setIsLoading(false);
                      }, 1000);
                    }}
                  >
                    Didn't receive? Resend OTP
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Contact support at{' '}
            <span className="text-primary font-medium">support@ms-scooter.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;