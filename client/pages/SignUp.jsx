import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { User, Building, Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFriendlyError } from '../lib/errorMessages';
import { motion } from 'framer-motion';

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

export default function SignUp() {
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!userType) {
        setError('Please select whether you are a Customer or Venue Owner.');
        setLoading(false);
        return;
      }
      if (!formData.agreeToTerms) {
        setError('Please agree to the terms and conditions to continue.');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Please choose a password with at least 6 characters.');
        setLoading(false);
        return;
      }

      await register(formData.email, formData.fullName, userType, formData.password, null);

      navigate('/verify-otp', {
        state: {
          email: formData.email,
          name: formData.fullName
        }
      });
    } catch (err) {
      setError(getUserFriendlyError(err, 'signup'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={transition}
        >
          <h1 className="text-3xl font-bold text-venue-dark mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join VenueKart to find amazing venues</p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: 0.05 }}
        >
          <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to sign up as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('customer')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      userType === 'customer'
                        ? 'border-venue-indigo bg-venue-lavender'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className={`h-8 w-8 mx-auto mb-2 ${
                      userType === 'customer' ? 'text-venue-indigo' : 'text-gray-400'
                    }`} />
                    <div className="text-sm font-medium text-gray-900">Customer</div>
                    <div className="text-xs text-gray-500">Looking for venues</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType('venue-owner')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      userType === 'venue-owner'
                        ? 'border-venue-indigo bg-venue-lavender'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building className={`h-8 w-8 mx-auto mb-2 ${
                      userType === 'venue-owner' ? 'text-venue-indigo' : 'text-gray-400'
                    }`} />
                    <div className="text-sm font-medium text-gray-900">Venue Owner</div>
                    <div className="text-xs text-gray-500">List my venues</div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="pl-10 h-12 border-gray-300 focus:border-venue-indigo focus:ring-venue-indigo"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="pl-10 h-12 border-gray-300 focus:border-venue-indigo focus:ring-venue-indigo"
                  />
                </div>
              </div>


              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-venue-indigo focus:ring-venue-indigo"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>



              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-venue-indigo focus:ring-venue-indigo border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="#" className="text-venue-indigo hover:text-venue-purple font-medium underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" className="text-venue-indigo hover:text-venue-purple font-medium underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-venue-indigo hover:bg-venue-purple text-white font-medium text-base disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>
            </div>

            {/* Social Login Options */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    if (!userType) {
                      setError('Please select whether you are a Customer or Venue Owner first.');
                      return;
                    }
                    setLoading(true);
                    setError('');
                    await loginWithGoogle(userType);
                    navigate('/');
                  } catch (error) {
                    console.error('Google auth error in SignUp:', error);
                    setError(getUserFriendlyError(error, 'signup'));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full h-12 border-gray-300 hover:border-venue-indigo hover:bg-venue-indigo hover:text-white"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Signing up...' : 'Sign up with Google'}
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/signin" className="font-medium text-venue-indigo hover:text-venue-purple">
                Sign in here
              </Link>
            </div>
          </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
