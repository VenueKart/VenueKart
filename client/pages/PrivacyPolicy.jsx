import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Shield,
  Eye,
  Lock,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

export default function PrivacyPolicy() {
  const handleDownloadPDF = () => {
    // Use the PDF URL from the attachment
    const pdfUrl = "/privacy-policy.pdf";
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'VenueKart-Privacy-Policy.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=800&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-poppins">
              Privacy Policy
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <div className="flex justify-center items-center space-x-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Calendar className="h-4 w-4 mr-1" />
                Effective: 25 August 2025
              </Badge>
              <Button 
                onClick={handleDownloadPDF}
                className="bg-venue-indigo hover:bg-venue-purple text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Shield className="h-6 w-6 mr-3 text-venue-indigo" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              This Privacy Policy ("Policy") governs the collection, use, disclosure, and protection of personal 
              information by <span className="font-semibold">Virtues 7 Events Pvt. Ltd.</span> ("Company," "we," "our," or "us") in connection with the 
              use of its digital platform, <span className="font-semibold text-venue-indigo">VenueKart</span>, including its website, mobile application, and associated services 
              (collectively, the "Platform").
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              By accessing, registering on, or using the Platform, you ("User," "Customer," or "Venue Partner") 
              consent to the practices described herein.
            </p>
          </CardContent>
        </Card>

        {/* Information Collected */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Eye className="h-6 w-6 mr-3 text-venue-indigo" />
              Information Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">2.1 Personal Information Provided by Users</h3>
                <p className="text-gray-600 mb-3">We may collect personal information, including but not limited to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Full name, email address, phone number, and address</li>
                  <li>Payment and billing details (collected via secure payment gateways)</li>
                  <li>Booking-related details such as venue preferences, event type, and schedules</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">2.2 Automatically Collected Information</h3>
                <p className="text-gray-600 mb-3">When you use the Platform, we may automatically collect:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Device identifiers, IP address, browser type, and operating system</li>
                  <li>Location data (if GPS/location services are enabled)</li>
                  <li>Platform usage data including search queries, click patterns, and interaction logs</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">2.3 Third-Party Information</h3>
                <p className="text-gray-600">
                  If you choose to log in via third-party services (e.g., Google, Facebook), we may collect limited account 
                  details in accordance with the respective provider's terms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use of Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <FileText className="h-6 w-6 mr-3 text-venue-indigo" />
              Use of Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">The Company may use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>To facilitate, confirm, and manage bookings with Venue Partners</li>
              <li>To provide, improve, and personalize the Platform and its services</li>
              <li>To communicate booking details, reminders, or promotional offers</li>
              <li>To detect, investigate, and prevent fraud, misuse, or unlawful activity</li>
              <li>To comply with legal, regulatory, or contractual obligations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclosure of Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Lock className="h-6 w-6 mr-3 text-venue-indigo" />
              Disclosure of Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">4.1 Permitted Disclosures</h3>
                <p className="text-gray-600 mb-3">We may share User information with:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li><span className="font-semibold">Venue Partners:</span> to process and confirm bookings</li>
                  <li><span className="font-semibold">Third-Party Service Providers:</span> including but not limited to payment gateways, SMS/email delivery services, analytics providers, and IT support vendors</li>
                  <li><span className="font-semibold">Regulatory Authorities:</span> when disclosure is required under applicable laws, regulations, or court orders</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">4.2 Prohibited Uses</h3>
                <p className="text-gray-600">
                  The Company does not sell, rent, or otherwise commercially exploit personal information for unrelated 
                  third-party marketing purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Shield className="h-6 w-6 mr-3 text-venue-indigo" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Subject to applicable law, Users may have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Access and obtain a copy of their personal data held by the Company</li>
              <li>Request rectification or erasure of personal data</li>
              <li>Withdraw consent for specific processing activities</li>
              <li>Opt-out of marketing communications at any time</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Requests should be addressed in writing to <a href="mailto:support@venuekart.in" className="text-venue-indigo hover:underline">support@venuekart.in</a>.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Mail className="h-6 w-6 mr-3 text-venue-indigo" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              For questions, concerns, or complaints regarding this Privacy Policy, please contact:
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-venue-indigo" />
                <div>
                  <span className="font-semibold text-venue-dark">Email:</span>
                  <a href="mailto:support@venuekart.in" className="text-venue-indigo hover:underline ml-2">
                    support@venuekart.in
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-venue-indigo" />
                <div>
                  <span className="font-semibold text-venue-dark">Registered Address:</span>
                  <span className="ml-2 text-gray-600">Pune, Maharashtra, India</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card className="bg-venue-lavender border-venue-indigo">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold text-venue-dark mb-4">
              Need a Copy of Our Privacy Policy?
            </h3>
            <p className="text-gray-600 mb-6">
              Download the complete Privacy Policy document for your records.
            </p>
            <Button 
              onClick={handleDownloadPDF}
              className="bg-venue-indigo hover:bg-venue-purple text-white"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Full Privacy Policy (PDF)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
