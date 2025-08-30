import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  Users,
  Building,
  MessageSquare,
  Search,
  CreditCard,
  Shield,
  RefreshCw,
  DollarSign,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const customerFAQs = [
  {
    question: "What is VenueKart?",
    answer: "VenueKart is an online platform that helps you discover, compare, and book event venues across societies, malls, IT parks, and open spaces — quickly and transparently.",
    icon: HelpCircle
  },
  {
    question: "Do I need to pay to use VenueKart?",
    answer: "No. Browsing venues on VenueKart is completely free. You only pay when you confirm a booking.",
    icon: DollarSign
  },
  {
    question: "How do I book a venue?",
    answer: "Simply search for your preferred location, choose a venue, check availability, and book directly through the VenueKart platform.",
    icon: Search
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes, cancellations and reschedules are allowed as per our Cancellation & Refund Policy. Refunds will depend on the venue's policy and booking terms.",
    icon: RefreshCw
  },
  {
    question: "Is my payment secure?",
    answer: "Absolutely. All transactions on VenueKart are processed through secure payment gateways with encryption to protect your financial information.",
    icon: Shield
  },
  {
    question: "What happens if the venue cancels my booking?",
    answer: "If a venue cancels, you will receive a full refund or the option to rebook at another venue of equal value.",
    icon: CreditCard
  }
];

const partnerFAQs = [
  {
    question: "How can I list my venue on VenueKart?",
    answer: "Fill out the Partner Registration Form on our website, and our team will verify your venue before it goes live.",
    icon: Building
  },
  {
    question: "What are the benefits of partnering with VenueKart?",
    answer: "• Increased visibility to potential customers\n• Steady flow of bookings\n• Hassle-free management and secure payments",
    icon: Users
  },
  {
    question: "Does VenueKart charge commission?",
    answer: "Yes, VenueKart charges a small service fee/commission on confirmed bookings. Details are shared at the time of partnership.",
    icon: DollarSign
  },
  {
    question: "How do I get payments for bookings?",
    answer: "Payments are released directly to your registered bank account after the event date, as per our payout cycle.",
    icon: CreditCard
  }
];

const generalFAQs = [
  {
    question: "Which cities does VenueKart operate in?",
    answer: "We are currently active in multiple societies, malls, and IT parks, and are expanding rapidly across India.",
    icon: MapPin
  },
  {
    question: "Who do I contact for support?",
    answer: "You can reach us anytime at support@venuekart.in or visit our Support Page.",
    icon: MessageSquare
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=1200&h=800&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-poppins">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Find quick answers to common questions about VenueKart. Can't find what you're looking for? Contact our support team.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Users className="h-4 w-4 mr-1" />
                For Customers
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Building className="h-4 w-4 mr-1" />
                For Partners
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <HelpCircle className="h-4 w-4 mr-1" />
                General Info
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* For Customers */}
        <section className="mb-16">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center text-2xl text-venue-dark">
                <Users className="h-6 w-6 mr-3 text-blue-600" />
                For Customers
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Everything you need to know about booking venues on VenueKart
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {customerFAQs.map((faq, index) => {
                  const Icon = faq.icon;
                  return (
                    <AccordionItem key={index} value={`customer-${index}`} className="border-b border-gray-200 last:border-b-0">
                      <AccordionTrigger className="text-left py-6 px-8 hover:no-underline">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold text-venue-dark">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-8 pb-6 text-gray-600 leading-relaxed">
                        {faq.answer.includes('•') ? (
                          <div className="whitespace-pre-line">{faq.answer}</div>
                        ) : (
                          faq.answer
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* For Venue Partners */}
        <section className="mb-16">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center text-2xl text-venue-dark">
                <Building className="h-6 w-6 mr-3 text-green-600" />
                For Venue Owners & Partners
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Information for venue owners looking to partner with VenueKart
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {partnerFAQs.map((faq, index) => {
                  const Icon = faq.icon;
                  return (
                    <AccordionItem key={index} value={`partner-${index}`} className="border-b border-gray-200 last:border-b-0">
                      <AccordionTrigger className="text-left py-6 px-8 hover:no-underline">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="font-semibold text-venue-dark">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-8 pb-6 text-gray-600 leading-relaxed">
                        {faq.answer.includes('•') ? (
                          <div className="whitespace-pre-line">{faq.answer}</div>
                        ) : (
                          faq.answer
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* General Questions */}
        <section className="mb-16">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center text-2xl text-venue-dark">
                <HelpCircle className="h-6 w-6 mr-3 text-purple-600" />
                General Questions
              </CardTitle>
              <p className="text-gray-600 mt-2">
                General information about VenueKart and our services
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {generalFAQs.map((faq, index) => {
                  const Icon = faq.icon;
                  return (
                    <AccordionItem key={index} value={`general-${index}`} className="border-b border-gray-200 last:border-b-0">
                      <AccordionTrigger className="text-left py-6 px-8 hover:no-underline">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-purple-600 flex-shrink-0" />
                          <span className="font-semibold text-venue-dark">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-8 pb-6 text-gray-600 leading-relaxed">
                        {faq.answer.includes('support@venuekart.in') ? (
                          <div>
                            You can reach us anytime at{' '}
                            <a href="mailto:support@venuekart.in" className="text-venue-indigo hover:underline">
                              support@venuekart.in
                            </a>{' '}
                            or visit our{' '}
                            <a href="/support" className="text-venue-indigo hover:underline">
                              Support Page
                            </a>
                            .
                          </div>
                        ) : (
                          faq.answer
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Contact Support */}
        <section>
          <Card className="bg-venue-indigo text-white">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Our support team is here to help. Contact us for personalized assistance with your venue booking or partnership needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a 
                  href="mailto:support@venuekart.in"
                  className="flex items-center space-x-2 bg-white text-venue-indigo px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span className="font-semibold">Email Support</span>
                </a>
                <a 
                  href="tel:+918806621666"
                  className="flex items-center space-x-2 bg-white text-venue-indigo px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span className="font-semibold">Call Support</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
