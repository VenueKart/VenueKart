import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { scrollToTop } from '@/lib/navigation';
import {
  Users,
  Shield,
  Award,
  Heart,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Building,
  Search,
  Handshake,
  TrendingUp
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Text Over Image */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content Over Image */}
        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-poppins">
              About VenueKart
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              At VenueKart, we believe that finding the perfect space should be as seamless as planning your event. We are India's first full-stack platform dedicated to event venue discovery and booking.
            </p>

            {/* Statistics from PDF */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
                <div className="text-white/80 text-sm">Societies</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">25+</div>
                <div className="text-white/80 text-sm">Malls</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
                <div className="text-white/80 text-sm">IT Parks & Open Spaces</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-venue-dark mb-6">
              Who We Are
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Founded under <span className="font-semibold text-venue-indigo">Virtues 7 Events Pvt. Ltd.</span>, VenueKart brings together societies, malls, IT parks, and open spaces into one easy-to-use digital marketplace. Whether you're hosting a wedding, a corporate activation, a community gathering, or a brand promotion, VenueKart ensures that you discover, book, and manage venues with just a few clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Our Mission */}
            <div className="text-center lg:text-left">
              <h3 className="text-3xl font-bold text-venue-dark mb-6">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                To transform venue booking into a hassle-free, transparent, and tech-driven experience, empowering both users and venue partners with tools for better planning, execution, and growth.
              </p>
            </div>
            
            {/* Our Vision */}
            <div className="text-center lg:text-left">
              <h3 className="text-3xl font-bold text-venue-dark mb-6">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                To become India's largest and most trusted venue booking ecosystem, enabling millions of events every year while driving value for venue owners and customers alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              What We Offer
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide a comprehensive platform that makes venue booking simple and transparent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="h-6 w-6 text-venue-indigo" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-venue-dark mb-2">Discover Easily</h3>
                    <p className="text-gray-600">Explore a curated list of verified venues that meet your specific requirements.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-venue-indigo" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-venue-dark mb-2">Seamless Booking</h3>
                    <p className="text-gray-600">Hassle-free process with instant confirmations and transparent pricing.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                    <Handshake className="h-6 w-6 text-venue-indigo" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-venue-dark mb-2">Trusted Partners</h3>
                    <p className="text-gray-600">Work with reliable spaces and event support you can count on.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-venue-indigo" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-venue-dark mb-2">Growing Network</h3>
                    <p className="text-gray-600">500+ societies, 25+ malls, 50+ IT parks & open spaces and growing every day.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              VenueKart by the Numbers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our growing network spans across India, connecting event planners with perfect venues
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-venue-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-venue-indigo" />
              </div>
              <div className="text-3xl font-bold text-venue-dark mb-2">500+</div>
              <div className="text-gray-600">Societies</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-venue-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-venue-indigo" />
              </div>
              <div className="text-3xl font-bold text-venue-dark mb-2">25+</div>
              <div className="text-gray-600">Malls</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-venue-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-venue-indigo" />
              </div>
              <div className="text-3xl font-bold text-venue-dark mb-2">50+</div>
              <div className="text-gray-600">IT Parks & Open Spaces</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-venue-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-venue-indigo" />
              </div>
              <div className="text-3xl font-bold text-venue-dark mb-2">∞</div>
              <div className="text-gray-600">Celebrations to Life</div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Message */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-venue-dark mb-6">
            We Don't Just Book Venues
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            At VenueKart, we help you <span className="font-semibold text-venue-indigo">bring your celebrations to life</span>.
          </p>
        </div>
      </section>

    </div>
  );
}
