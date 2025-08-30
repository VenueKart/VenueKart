import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToTop } from '@/lib/navigation';
import { Button } from './ui/button';
import { Menu, X, MapPin, LogOut, User, Building, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// API service functions
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers
      }
    });

    // Read response body once
    let data = null;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse response as JSON:', jsonError);
      data = null;
    }

    if (!response.ok) {
      const errorMessage = data && data.error ? data.error : 'Request failed';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isVenueOwner, isLoggedIn } = useAuth();

  const isActive = (path) => location.pathname === path;


  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };


  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Venues', path: '/venues' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const userNavLinks = [
    ...navLinks,
    // Remove favorites tab for customers - they should not see this
  ];

  const currentNavLinks = isLoggedIn ? userNavLinks : navLinks;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F181d3ec55b014ac2aead9c04dc47e7f1%2F58dccb4263c94bf8bdc07b4891c6b92d?format=webp&width=800"
              alt="VenueKart Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-venue-dark font-inter">VenueKart</span>
              <span className="text-xs text-venue-indigo font-medium -mt-1">Event Venue Discovery & Booking</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={scrollToTop}
                className={`font-medium transition-colors duration-200 flex items-center gap-1 ${
                  isActive(link.path)
                    ? 'text-venue-indigo border-b-2 border-venue-indigo pb-1'
                    : 'text-gray-700 hover:text-venue-indigo'
                }`}
              >
                {link.name === 'Favorites' && <Heart className="h-4 w-4" />}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>

                <div className="flex items-center space-x-2 text-venue-dark">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.name || 'User'}</span>
                  {isVenueOwner() && (
                    <span className="text-xs bg-venue-lavender text-venue-indigo px-2 py-1 rounded-full">
                      Venue Owner
                    </span>
                  )}
                </div>
                {isVenueOwner() ? (
                  <Button asChild variant="outline" className="border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white" onClick={scrollToTop}>
                    <Link to="/admin/dashboard">
                      <Building className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white" onClick={scrollToTop}>
                    <Link to="/dashboard">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                )}
                <Button onClick={handleLogout} variant="ghost" className="text-venue-indigo hover:bg-venue-indigo hover:text-white active:bg-venue-indigo/90 active:text-white">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-venue-indigo hover:text-venue-purple hover:bg-venue-lavender/50 transition-colors" onClick={scrollToTop}>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild className="bg-venue-indigo hover:bg-venue-purple text-white" onClick={scrollToTop}>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-venue-indigo"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {currentNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-2 ${
                    isActive(link.path)
                      ? 'text-venue-indigo bg-venue-lavender'
                      : 'text-gray-700 hover:text-venue-indigo hover:bg-gray-50'
                  }`}
                >
                  {link.name === 'Favorites' && <Heart className="h-4 w-4" />}
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-2 text-center text-venue-dark">
                      <div className="flex items-center justify-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">{user?.name || 'User'}</span>
                      </div>
                      {isVenueOwner() && (
                        <span className="text-xs bg-venue-lavender text-venue-indigo px-2 py-1 rounded-full mt-1 inline-block">
                          Venue Owner
                        </span>
                      )}
                    </div>
                    {isVenueOwner() ? (
                      <Button asChild variant="outline" className="w-full border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white">
                        <Link to="/admin/dashboard" onClick={() => {
                          setIsMenuOpen(false);
                          scrollToTop();
                        }}>
                          <Building className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="w-full border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white">
                        <Link to="/dashboard" onClick={() => {
                          setIsMenuOpen(false);
                          scrollToTop();
                        }}>
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button onClick={handleLogout} variant="ghost" className="w-full text-venue-indigo hover:bg-venue-indigo hover:text-white active:bg-venue-indigo/90 active:text-white">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="w-full text-venue-indigo hover:text-venue-purple hover:bg-venue-lavender/50 transition-colors">
                      <Link to="/signin" onClick={scrollToTop}>Sign In</Link>
                    </Button>
                    <Button asChild className="w-full bg-venue-indigo hover:bg-venue-purple text-white">
                      <Link to="/signup" onClick={scrollToTop}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
