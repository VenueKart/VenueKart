import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { getUserFriendlyError } from '../lib/errorMessages';
import { motion } from 'framer-motion';

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);
  
  const email = location.state?.email || 'your@email.com';
  const phone = location.state?.phone || 'your mobile';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'v' && e.ctrlKey) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        setError('');
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOTP(email, otpCode);
      setSuccess('Verification successful!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(getUserFriendlyError(err, 'otp'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await resendOTP(email);
      setTimeLeft(60);
      setOtp(['', '', '', '', '', '']);
      setSuccess('New verification code sent!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getUserFriendlyError(err, 'otp'));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-venue-lavender/20 to-venue-purple/10 flex items-center justify-center px-4 overflow-hidden">
      <motion.div
        className="max-w-md w-full"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={transition}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <motion.h1
              className="text-2xl font-semibold text-venue-dark mb-3"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={transition}
            >
              Verify OTP
            </motion.h1>
            <motion.p
              className="text-gray-600 text-sm leading-relaxed"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: 0.05 }}
            >
              Enter the 6-digit code sent to your email
            </motion.p>
            <motion.div
              className="mt-2 flex justify-center"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: 0.1 }}
            >
              <span className="inline-flex items-center rounded-full bg-venue-purple/10 text-venue-purple border border-venue-purple/20 px-3 py-1 text-xs font-medium">
                {email}
              </span>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              className="flex justify-center gap-3 mb-6"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={transition}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 border-gray-200 focus:border-transparent focus:ring-2 focus:ring-venue-purple/20 focus:outline-none transition-all duration-200 bg-white/70"
                />
              ))}
            </motion.div>

            {success && (
              <motion.div
                className="text-center text-green-600 text-sm bg-green-50 py-2 px-4 rounded-lg border border-green-200"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={transition}
              >
                {success}
              </motion.div>
            )}

            {error && (
              <motion.div
                className="text-center text-red-600 text-sm bg-red-50 py-2 px-4 rounded-lg border border-red-200"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={transition}
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full h-12 bg-venue-purple hover:bg-venue-indigo text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                'Verify'
              )}
            </Button>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || timeLeft > 0}
                className="text-venue-purple hover:text-venue-indigo font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline"
              >
                {resendLoading ? 'Sending...' : timeLeft > 0 ? `Resend Code (${formatTime(timeLeft)})` : 'Resend Code'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
