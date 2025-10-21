import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  User,
  ArrowRight,
  MapPin,
  Building,
  Users,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Eye,
  BookOpen
} from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "Top 5 Event Venues in Pune You Can Book Hassle-Free with VenueKart",
    excerpt: "Planning an event can be exciting, but finding the perfect venue is often challenging. Discover the top 5 types of venues in Pune you can book seamlessly through VenueKart.",
    content: {
      intro: "Planning an event can be exciting, but one of the biggest challenges is finding the perfect venue. From birthdays and weddings to corporate gatherings and brand activations, the right venue sets the tone for your event. Traditionally, venue booking has been a stressful process—endless calls, hidden charges, and lack of transparency.",
      venuekartInfo: "That's where VenueKart steps in. As India's first event venue discovery and booking platform, we make venue selection easy, fast, and reliable. With 100+ societies and 25+ malls already onboarded in Pune, VenueKart is here to transform the way you book venues.",
      venues: [
        {
          title: "Banquet Halls for Weddings & Celebrations",
          description: "Whether it's a wedding, engagement, or anniversary, banquet halls remain a popular choice. Pune has beautiful indoor banquet halls with modern amenities, air conditioning, and catering support.",
          idealFor: "Weddings, receptions, family gatherings",
          whyVenuekart: "Transparent pricing and verified listings"
        },
        {
          title: "Residential Societies for Community Events",
          description: "Residential Welfare Associations (RWAs) and societies are fast becoming the go-to spots for events. From Ganesh Chaturthi celebrations to society fests, these venues offer convenience, built-in audiences, and vibrant community vibes.",
          idealFor: "Festivals, brand activations, society functions",
          whyVenuekart: "Direct access to 100+ societies across Pune"
        },
        {
          title: "Malls & Retail Spaces for Brand Activations",
          description: "For brands looking to connect with urban audiences, malls are perfect. With high footfall and visibility, your product or service gets immediate attention. VenueKart has partnered with multiple malls to simplify activation bookings.",
          idealFor: "Product launches, sampling, exhibitions",
          whyVenuekart: "Verified malls with easy booking and no hidden charges"
        },
        {
          title: "IT Parks & Corporate Spaces for Professional Events",
          description: "Pune is an IT hub, and corporates need reliable spaces for conferences, seminars, and activations. IT parks offer premium infrastructure and a ready professional audience.",
          idealFor: "Corporate events, seminars, HR activities",
          whyVenuekart: "Access to 50+ IT parks and office complexes"
        },
        {
          title: "Open Lawns & Outdoor Venues for Grand Celebrations",
          description: "From birthday parties to live concerts, nothing matches the charm of an open-air venue. Pune's weather and greenery make outdoor events a delight.",
          idealFor: "Large gatherings, concerts, family functions",
          whyVenuekart: "Compare multiple options instantly & book with ease"
        }
      ]
    },
    category: "Venue Guide",
    readTime: "5 min read",
    date: "2024-01-15",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop",
    tags: ["Pune", "Venues", "Event Planning"]
  },
  {
    id: 2,
    title: "Why RWAs & Societies are the Next Big Hotspots for Brand Activations",
    excerpt: "Discover why Residential Welfare Associations and Housing Societies are becoming the future of hyperlocal marketing for brands looking for high-impact, cost-effective platforms.",
    content: {
      intro: "When it comes to marketing, brands are always searching for high-impact, cost-effective, and targeted platforms to connect with customers. For years, malls, exhibitions, and outdoor hoardings have dominated the scene. But there's a new, fast-growing hotspot for brand activations in India: Residential Welfare Associations (RWAs) and Housing Societies.",
      effectiveness: [
        {
          title: "High Footfall & Guaranteed Engagement",
          description: "Societies are home to hundreds (sometimes thousands) of residents living in one campus. Every event or activation here guarantees direct reach to families, professionals, and decision-makers—all within a single location."
        },
        {
          title: "Diverse & Targeted Audience",
          description: "Unlike malls that attract a random mix, societies bring together families, working professionals, kids, and senior citizens. This allows brands to customize activations."
        },
        {
          title: "Built-in Trust Factor",
          description: "When activations happen in societies, residents perceive them as community-driven initiatives rather than just marketing stunts. This trust factor directly improves conversion rates."
        },
        {
          title: "Cost-Effective Alternative to Malls",
          description: "Mall activations are effective but come with high rentals and strict guidelines. RWAs, on the other hand, are affordable, flexible, and highly scalable."
        },
        {
          title: "Festivals & Events = Perfect Timing",
          description: "Societies are buzzing hubs during Ganesh Chaturthi, Diwali, Holi, Christmas, Independence Day, and society-specific fests."
        }
      ],
      caseStudy: {
        title: "Case Example: Society Activation in Pune",
        description: "A leading FMCG brand recently conducted a weekend sampling activation across 10 societies in Pune via VenueKart. Within two days, the brand reached 5,000+ families, distributed samples, and saw 20% instant conversions. This wouldn't have been possible in a single mall activation at the same cost."
      }
    },
    category: "Marketing Insights",
    readTime: "7 min read",
    date: "2024-01-20",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
    tags: ["Brand Activations", "Marketing", "RWA", "Societies"]
  },
  {
    id: 3,
    title: "The Future of Venue Booking: How Technology is Changing the Events Industry",
    excerpt: "Explore how technology is transforming venue booking from a time-consuming, frustrating process into a smart, fast, and transparent experience.",
    content: {
      intro: "The way we plan and book venues for events is undergoing a massive transformation. What used to take days of phone calls, negotiations, and back-and-forth emails can now be done in just a few clicks. With platforms like VenueKart, the future of event venue discovery & booking is smarter, faster, and more transparent.",
      oldWay: [
        "Contacting multiple managers/agents",
        "Unclear pricing and hidden costs",
        "Long waiting times for approvals",
        "Limited access to societies, malls, and open spaces"
      ],
      techChanges: [
        {
          title: "Instant Discovery & Availability",
          description: "Digital platforms now allow brands and individuals to discover venues instantly based on location, size, budget, and amenities. No more endless calls—everything is visible upfront."
        },
        {
          title: "Transparent Pricing",
          description: "Gone are the days of \"quotation confusion.\" With platforms like VenueKart, pricing is clear, upfront, and comparable, helping brands make faster decisions without hidden surprises."
        },
        {
          title: "Verified Venues & Trust",
          description: "One of the biggest challenges in the past was reliability. By onboarding verified societies, malls, IT parks, and open spaces, VenueKart ensures brands connect only with authentic, trustworthy venues."
        },
        {
          title: "Scalable Activations",
          description: "Want to run activations across 10 malls and 50 societies at the same time? Technology makes this possible. Brands can now scale campaigns across multiple venues in one go, ensuring wider reach with less effort."
        },
        {
          title: "Data-Driven Insights",
          description: "Modern booking platforms also provide analytics—footfall data, conversion tracking, and engagement reports. This helps brands measure ROI and refine their future campaigns."
        }
      ]
    },
    category: "Technology",
    readTime: "6 min read",
    date: "2024-01-25",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    tags: ["Technology", "Digital Transformation", "Future"]
  }
];

const BlogCard = ({ post, isExpanded, onToggle }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-venue-indigo">
            {post.category}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-venue-dark hover:text-venue-indigo transition-colors cursor-pointer line-clamp-2">
          {post.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <Button 
          onClick={() => onToggle(post.id)}
          variant="outline" 
          className="w-full group"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                {post.content.intro}
              </p>
              
              {post.content.venuekartInfo && (
                <p className="text-gray-600 leading-relaxed mb-6">
                  {post.content.venuekartInfo}
                </p>
              )}
              
              {post.content.venues && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-venue-dark">
                    Top 5 Venue Types in Pune:
                  </h3>
                  {post.content.venues.map((venue, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-venue-dark mb-2">
                        {index + 1}. {venue.title}
                      </h4>
                      <p className="text-gray-600 mb-3">{venue.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Ideal for:</span>
                          <span className="text-gray-600 ml-1">{venue.idealFor}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Why VenueKart:</span>
                          <span className="text-gray-600 ml-1">{venue.whyVenuekart}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {post.content.effectiveness && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-venue-dark">
                    What Makes RWAs & Societies So Effective?
                  </h3>
                  {post.content.effectiveness.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-venue-dark mb-2">
                        {index + 1}. {item.title}
                      </h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  ))}
                  
                  {post.content.caseStudy && (
                    <div className="bg-venue-lavender rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-venue-dark mb-2">
                        {post.content.caseStudy.title}
                      </h4>
                      <p className="text-gray-600">{post.content.caseStudy.description}</p>
                    </div>
                  )}
                </div>
              )}
              
              {post.content.oldWay && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-venue-dark">
                    The Old Way of Booking Venues
                  </h3>
                  <p className="text-gray-600">Traditionally, booking a venue meant:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {post.content.oldWay.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-venue-dark mt-6">
                    How Technology is Changing Venue Booking
                  </h3>
                  <div className="space-y-4">
                    {post.content.techChanges.map((change, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-venue-dark mb-2">
                          {index + 1}. {change.title}
                        </h4>
                        <p className="text-gray-600">{change.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function Blog() {
  const [expandedPosts, setExpandedPosts] = React.useState(new Set());

  const togglePost = (postId) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=800&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-poppins">
              VenueKart Blog
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Insights, tips, and trends in event venue booking and the future of event planning.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <BookOpen className="h-4 w-4 mr-1" />
                Industry Insights
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                Market Trends
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Eye className="h-4 w-4 mr-1" />
                Expert Analysis
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              Latest Articles
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest insights and trends in the event venue industry
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                isExpanded={expandedPosts.has(post.id)}
                onToggle={togglePost}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-venue-lavender">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-venue-dark mb-6">
            Ready to Transform Your Event Planning?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who have discovered the VenueKart advantage. Start planning your next event today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => window.location.href = '/venues'}
              className="bg-venue-indigo hover:bg-venue-purple text-white"
              size="lg"
            >
              Browse Venues
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => window.location.href = '/contact'}
              variant="outline"
              className="border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white"
              size="lg"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
