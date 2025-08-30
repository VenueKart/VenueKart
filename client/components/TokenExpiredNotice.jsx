import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TokenExpiredNotice = () => {
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check for expired parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('expired') === 'true') {
      setShow(true);
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (show && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (show && countdown === 0) {
      handleRedirect();
    }
  }, [show, countdown]);

  const handleRedirect = () => {
    logout();
    window.location.href = '/signin';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Session Expired
          </CardTitle>
          <CardDescription>
            Your session has expired for security reasons. Please sign in again to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Auto-redirecting in {countdown} seconds...
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRedirect}
              className="w-full bg-venue-indigo hover:bg-venue-purple text-white"
            >
              Sign In Now
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              This happened because your session was inactive for too long.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenExpiredNotice;
