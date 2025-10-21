import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  Scale,
  ShieldCheck,
  CreditCard,
  Users,
  Building,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';

export default function TermsAndConditions() {
  const handleDownloadPDF = () => {
    // Use the PDF URL from the attachment
    const pdfUrl = "/terms-and-conditions.pdf";
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'VenueKart-Terms-and-Conditions.pdf';
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
            backgroundImage: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=800&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-poppins">
              Terms & Conditions
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Please read these terms carefully before using VenueKart platform and services.
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
              <FileText className="h-6 w-6 mr-3 text-venue-indigo" />
              Agreement Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed mb-4">
              These Terms and Conditions ("Terms") constitute a legally binding agreement between <span className="font-semibold">Virtues Seven Events Pvt. Ltd.</span>, 
              a company incorporated under the Companies Act, 2013, having its registered office at Pune, Maharashtra, India 
              (hereinafter referred to as "VenueKart", "Company", "We", "Us" or "Our"), and any person or entity accessing 
              or using the VenueKart platform.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By accessing, browsing, registering, or using the Platform, you ("User" or "Customer") and/or "Venue Partner" 
              expressly agree to be bound by these Terms.
            </p>
          </CardContent>
        </Card>

        {/* Definitions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Scale className="h-6 w-6 mr-3 text-venue-indigo" />
              Key Definitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-venue-dark">Customer/User:</span>
                <span className="text-gray-600 ml-2">Any individual or entity browsing, registering, or booking venues via the Platform.</span>
              </div>
              <div>
                <span className="font-semibold text-venue-dark">Venue Partner:</span>
                <span className="text-gray-600 ml-2">Any individual, company, or entity listing, promoting, or offering their venue(s) for booking on the Platform.</span>
              </div>
              <div>
                <span className="font-semibold text-venue-dark">Services:</span>
                <span className="text-gray-600 ml-2">Includes venue discovery, booking management, digital listing, marketing support, and related services provided by VenueKart.</span>
              </div>
              <div>
                <span className="font-semibold text-venue-dark">Booking:</span>
                <span className="text-gray-600 ml-2">Any confirmed reservation of a venue made through the Platform.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope of Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Building className="h-6 w-6 mr-3 text-venue-indigo" />
              Scope of Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>VenueKart provides an online marketplace that connects Customers with Venue Partners for discovery, inquiry, and booking of venues.</li>
              <li>VenueKart acts solely as an <span className="font-semibold">intermediary</span> and does not own, operate, or control any venue listed on the Platform.</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Obligations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Users className="h-6 w-6 mr-3 text-venue-indigo" />
              User Obligations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Users shall provide accurate information during registration and booking.</li>
              <li>Users must not misuse the Platform for fraudulent, illegal, or unauthorized purposes.</li>
              <li>Users agree to comply with all applicable laws, rules, and regulations while using the Services.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Venue Partner Obligations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Building className="h-6 w-6 mr-3 text-venue-indigo" />
              Venue Partner Obligations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Venue Partners shall provide truthful, accurate, and updated information about their venues.</li>
              <li>Venue Partners shall ensure compliance with all statutory licenses, permits, and safety norms.</li>
              <li>VenueKart reserves the right to verify and/or delist any venue in case of non-compliance or fraudulent activity.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Bookings, Payments & Refunds */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <CreditCard className="h-6 w-6 mr-3 text-venue-indigo" />
              Bookings, Payments & Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">5.1 Booking Confirmation</h3>
                <p className="text-gray-600">A booking is confirmed only upon receipt of payment (full or partial, as applicable).</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">5.2 Payment Gateway</h3>
                <p className="text-gray-600">All payments shall be processed through authorized payment gateways. VenueKart is not liable for any delays or failures caused by third-party payment processors.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">5.3 Cancellation by Customer</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Cancellations made <span className="font-semibold">30 days prior</span> to the event date: <span className="font-semibold text-green-600">80% refund</span></li>
                  <li>Cancellations made <span className="font-semibold">15–29 days prior</span>: <span className="font-semibold text-yellow-600">50% refund</span></li>
                  <li>Cancellations made <span className="font-semibold">less than 15 days prior</span>: <span className="font-semibold text-red-600">Non-refundable</span></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">5.4 Cancellation by Venue Partner</h3>
                <p className="text-gray-600">In the event a Venue Partner cancels a confirmed booking, the Customer shall receive a <span className="font-semibold text-green-600">full refund</span>. VenueKart may impose penalties on the Venue Partner, including suspension/delisting.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-venue-dark mb-3">5.5 Refund Timeline</h3>
                <p className="text-gray-600">Refunds shall be processed within <span className="font-semibold">7–14 working days</span>, subject to bank/payment gateway policies.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liability & Disclaimer */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <ShieldCheck className="h-6 w-6 mr-3 text-venue-indigo" />
              Liability & Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">VenueKart is only a facilitator and is not responsible for the condition, quality, safety, or legal compliance of venues.</p>
              <p className="text-gray-600">Customers agree that VenueKart shall not be liable for:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-6">
                <li>Cancellation by Venue Partner</li>
                <li>Disputes between Customer and Venue Partner</li>
                <li>Force Majeure events (natural calamities, government restrictions, strikes, etc.)</li>
              </ul>
              <p className="text-gray-600">VenueKart's maximum liability shall be limited to the booking amount paid by the Customer to VenueKart.</p>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-venue-dark">
              <Scale className="h-6 w-6 mr-3 text-venue-indigo" />
              Governing Law & Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>These Terms shall be governed by and construed in accordance with the <span className="font-semibold">laws of India</span>.</li>
              <li>Courts at <span className="font-semibold">Pune, Maharashtra</span> shall have exclusive jurisdiction over any disputes arising hereunder.</li>
            </ul>
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
              For any queries, grievances, or legal notices, please contact:
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
                  <span className="font-semibold text-venue-dark">Registered Office:</span>
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
              Need a Copy of Our Terms & Conditions?
            </h3>
            <p className="text-gray-600 mb-6">
              Download the complete Terms & Conditions document for your records.
            </p>
            <Button 
              onClick={handleDownloadPDF}
              className="bg-venue-indigo hover:bg-venue-purple text-white"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Full Terms & Conditions (PDF)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
