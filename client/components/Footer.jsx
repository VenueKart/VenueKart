import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { scrollToTop } from '@/lib/navigation';

export default function Footer() {
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Venues', href: '/venues' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const venueTypes = [
    { name: 'Banquet Halls', href: '/venues?type=banquet' },
    { name: 'Wedding Venues', href: '/venues?type=wedding' },
    { name: 'Conference Halls', href: '/venues?type=conference' },
    { name: 'Resorts', href: '/venues?type=resort' },
  ];


  const companyPages = [
    { name: 'Why VenueKart', href: '/why-venuekart' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Developers', href: '/developers' },
  ];

  const supportHelp = [
    { name: 'Support', href: '/support' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F181d3ec55b014ac2aead9c04dc47e7f1%2F58dccb4263c94bf8bdc07b4891c6b92d?format=webp&width=800"
                alt="VenueKart Logo"
                className="w-10 h-10 object-contain bg-white rounded-lg p-1"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white font-inter">VenueKart</span>
                <span className="text-xs text-venue-lavender font-medium -mt-1">Event Venue Discovery & Booking</span>
              </div>
            </Link>
            <p className="text-gray-300 text-sm">
              Your trusted partner for finding the perfect venue for every occasion. Making event planning effortless with verified venues and transparent pricing.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/164c2G28M2/?mibextid=wwXIfr" className="text-gray-300 hover:text-venue-purple transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-venue-purple transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/venuekart?igsh=ZDA0bmRxZnAyaXJ6" className="text-gray-300 hover:text-venue-purple transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/venuekart-in/" className="text-gray-300 hover:text-venue-purple transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-venue-purple transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Venue Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Venue Types</h3>
            <ul className="space-y-2">
              {venueTypes.map((type) => (
                <li key={type.name}>
                  <Link
                    to={type.href}
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-venue-purple transition-colors text-sm"
                  >
                    {type.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact & Support</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-venue-purple" />
                <span className="text-gray-300 text-sm">support@venuekart.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-venue-purple" />
                <span className="text-gray-300 text-sm">8806621666</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-venue-purple mt-1" />
                <span className="text-gray-300 text-sm">Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {companyPages.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-venue-purple transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2025 VenueKart. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms-and-conditions" onClick={scrollToTop} className="text-gray-300 hover:text-venue-purple text-sm transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy-policy" onClick={scrollToTop} className="text-gray-300 hover:text-venue-purple text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/support" onClick={scrollToTop} className="text-gray-300 hover:text-venue-purple text-sm transition-colors">
                Support
              </Link>
              <Link to="/faq" onClick={scrollToTop} className="text-gray-300 hover:text-venue-purple text-sm transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
