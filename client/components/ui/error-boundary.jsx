import React from 'react';
import { Component } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const isTokenError = this.state.error?.message?.includes('token') || 
                          this.state.error?.message?.includes('401') ||
                          this.state.error?.message?.includes('expired');

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {isTokenError ? 'Session Expired' : 'Something went wrong'}
              </CardTitle>
              <CardDescription>
                {isTokenError 
                  ? 'Your session has expired. Please sign in again to continue.'
                  : 'An unexpected error occurred. Please try refreshing the page.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isTokenError ? (
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/signin'}
                    className="w-full bg-venue-indigo hover:bg-venue-purple text-white"
                  >
                    Sign In Again
                  </Button>
                  <Button 
                    onClick={this.handleRefresh}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Page
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full bg-venue-indigo hover:bg-venue-purple text-white"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={this.handleRefresh}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Page
                  </Button>
                </div>
              )}
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 text-red-600 whitespace-pre-wrap">
                        {this.state.error && this.state.error.toString()}
                      </pre>
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                        {this.state.errorInfo?.componentStack || 'No component stack available'}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
