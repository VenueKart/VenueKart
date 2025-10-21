import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Users,
  Handshake,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const contactInfo = [
  {
    title: "Customer Support",
    description: "For general queries and support",
    value: "support@venuekart.in",
    icon: Mail,
    link: "mailto:support@venuekart.in"
  },
  {
    title: "Partnerships",
    description: "For venue partnerships",
    value: "partners@venuekart.in",
    icon: Handshake,
    link: "mailto:partners@venuekart.in"
  },
  {
    title: "Call Us",
    description: "Mon-Fri from 8am to 8pm",
    value: "+91-8806621666",
    icon: Phone,
    link: "tel:+918806621666"
  },
  {
    title: "Visit Us",
    description: "VenueKart (Virtues Seven Events Pvt. Ltd.)",
    value: "Pune, Maharashtra, India",
    icon: MapPin,
    link: null
  }
];

const socialLinks = [
  {
    name: "Facebook",
    handle: "VenueKart.in",
    icon: Facebook,
    color: "text-blue-600"
  },
  {
    name: "Instagram",
    handle: "@venuekart.in",
    icon: Instagram,
    color: "text-pink-600"
  },
  {
    name: "LinkedIn",
    handle: "VenueKart.in",
    icon: Linkedin,
    color: "text-blue-700"
  },
  {
    name: "WhatsApp",
    handle: "Chat with us instantly",
    icon: MessageCircle,
    color: "text-green-600"
  }
];

const faqs = [
  {
    question: "How can I book a venue?",
    answer: "Simply browse venues on our platform, select your preferred one, and confirm your booking online."
  },
  {
    question: "What if I want to cancel my booking?",
    answer: "Please refer to our Cancellation & Refund Policy outlined in our Terms & Conditions."
  },
  {
    question: "Can I list my venue on VenueKart?",
    answer: "Yes! Drop us an email at partners@venuekart.in and our team will help onboard your venue."
  }
];

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

export default function Contact() {
  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");

    try {
      const formData = new FormData(event.target);
      formData.append("access_key", "509ded59-87b7-4ef7-9084-a4401587ed0a");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form Submitted Successfully");
        event.target.reset();
      } else {
        console.log("Error", data);
        setResult(data.message || "Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Submission error", err);
      setResult("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Text Over Image */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat contact-hero-image">
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content Over Image */}
        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-6 font-poppins"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={transition}
            >
              We'd Love to Hear from You!
            </motion.h1>
            <motion.p
              className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: 0.1 }}
            >
              At VenueKart, we're committed to making your event planning and venue booking experience seamless. Whether you have a question, need support, or want to partner with us, our team is always ready to connect with you.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div
            className="lg:col-span-1"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={transition}
          >
            <h2 className="text-2xl font-bold text-venue-dark mb-6">
              Get in Touch
            </h2>
            <p className="text-gray-600 mb-8">
              Reach out to us through any of these channels. We're always ready to assist you.
            </p>

            <div className="space-y-6 mb-12">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                const content = (
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-venue-indigo" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-venue-dark mb-1">{info.title}</h3>
                      <p className="text-gray-600 text-sm mb-1">{info.description}</p>
                      <p className="text-venue-indigo font-medium">{info.value}</p>
                    </div>
                  </div>
                );

                return (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ ...transition, delay: index * 0.05 }}
                  >
                    {info.link ? (
                      <a href={info.link} className="block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
                        {content}
                      </a>
                    ) : (
                      <div>{content}</div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Social Media Section */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={transition}
            >
              <h3 className="text-xl font-bold text-venue-dark mb-4">Find Us Online</h3>
              <div className="space-y-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 text-gray-600 hover:text-venue-indigo transition-colors">
                      <Icon className={`h-5 w-5 ${social.color}`} />
                      <span className="font-medium">{social.handle}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Contact Form */}
          <motion.div
            className="lg:col-span-2"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...transition, delay: 0.05 }}
          >
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl text-venue-dark font-bold">Send us a Message</CardTitle>
                <p className="text-gray-600 text-lg">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Enter your full name"
                        className="h-12 border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                        className="h-12 border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="h-12 border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        placeholder="What is this about?"
                        className="h-12 border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className="border-2 border-gray-200 focus:border-venue-indigo focus:ring-2 focus:ring-venue-indigo/20 transition-all duration-200 resize-none"
                    />
                  </div>

                  {result && (
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border ${
                      result.includes("Successfully")
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {result.includes("Successfully") ? (
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span className="text-sm">{result}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-venue-indigo hover:bg-venue-purple text-white h-14 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          className="mt-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={transition}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about VenueKart
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 last:border-b-0">
                      <AccordionTrigger className="text-left py-6 hover:no-underline">
                        <div className="flex items-center space-x-3">
                          <HelpCircle className="h-5 w-5 text-venue-indigo flex-shrink-0" />
                          <span className="font-semibold text-venue-dark">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
