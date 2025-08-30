

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { scrollToTop } from '@/lib/navigation';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-venue-indigo mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-venue-dark mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="bg-venue-indigo hover:bg-venue-purple text-white w-full" onClick={scrollToTop}>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full" onClick={scrollToTop}>
            <Link to="/venues">
              Browse Venues
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <Button asChild variant="ghost" className="text-venue-indigo">
            <Link to={-1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
