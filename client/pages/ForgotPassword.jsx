import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { getUserFriendlyError } from '../lib/errorMessages';
import { motion } from 'framer-motion';

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');

  const { forgotPassword, resetPassword } = useAuth();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setSuccess(true);
      setCurrentStep(2);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(getUserFriendlyError(error, 'password-reset'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      setIsLoading(false);
      return;
    }

    try {
      setVerifiedOtp(otp);
      setCurrentStep(3);
      setSuccess(false);
      setError('');
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(getUserFriendlyError(error, 'otp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Please choose a password with at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(email, verifiedOtp, newPassword);
      setSuccess(true);
      setCurrentStep(4);
      setError('');
    } catch (error) {
      console.error('Reset password error:', error);
      setError(getUserFriendlyError(error, 'password-reset'));
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 4 && success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="w-full max-w-md"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={transition}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-venue-dark">
                Password Reset Successful
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your password has been successfully reset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You can now sign in with your new password.
                </p>
                <Button
                  asChild
                  className="w-full h-11 bg-venue-indigo hover:bg-venue-purple text-white font-medium"
                >
                  <Link to="/signin">
                    Return to Sign In
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="w-full max-w-md"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={transition}
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-venue-dark">
              {currentStep === 1 ? 'Forgot Password?' :
               currentStep === 2 ? 'Verify Code' : 'Reset Your Password'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {currentStep === 1
                ? 'Enter your email address and we\'ll send you a verification code to reset your password'
                : currentStep === 2
                ? 'Enter the 6-digit verification code sent to your email'
                : 'Enter your new password'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && currentStep === 2 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Verification code sent to {email}
                </AlertDescription>
              </Alert>
            )}

            {currentStep === 1 && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border-gray-300 focus:border-venue-purple focus:ring-venue-purple"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-venue-indigo hover:bg-venue-purple text-white font-medium"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit verification code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    className="h-11 border-gray-300 focus:border-venue-purple focus:ring-venue-purple"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-venue-indigo hover:bg-venue-purple text-white font-medium"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-11 border-gray-300 focus:border-venue-purple focus:ring-venue-purple"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 border-gray-300 focus:border-venue-purple focus:ring-venue-purple"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-venue-indigo hover:bg-venue-purple text-white font-medium"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="text-center">
              <Button
                variant="ghost"
                asChild
                className="text-venue-purple hover:text-venue-indigo"
              >
                <Link to="/signin" className="inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
