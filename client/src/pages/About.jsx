import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Heart, 
  Users, 
  Truck, 
  Shield, 
  Award,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: '500+', label: 'Local Farms', icon: Leaf },
    { number: '10,000+', label: 'Happy Customers', icon: Users },
    { number: '50,000+', label: 'Fresh Products', icon: Heart },
    { number: '24/7', label: 'Fast Delivery', icon: Truck }
  ];

  const values = [
    {
      icon: Leaf,
      title: 'Sustainability First',
      description: 'We prioritize eco-friendly farming practices and sustainable packaging to protect our planet for future generations.'
    },
    {
      icon: Heart,
      title: 'Farm Fresh Quality',
      description: 'Direct partnerships with local farmers ensure you get the freshest, highest-quality produce straight from the farm.'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'By connecting consumers with local farmers, we strengthen communities and support sustainable agriculture.'
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Complete transparency in our supply chain, from farm to your table, with detailed product information and traceability.'
    }
  ];

  const features = [
    {
      title: 'Real-time Farm tracking',
      description: 'Know exactly where your food comes from with our farm-to-table transparency system.',
      icon: MapPin
    },
    {
      title: 'Same-day Delivery',
      description: 'Get fresh produce delivered to your doorstep within hours of harvest.',
      icon: Clock
    },
    {
      title: 'Quality Guarantee',
      description: '100% satisfaction guarantee with our fresh produce quality promise.',
      icon: CheckCircle
    },
    {
      title: 'Seasonal Recommendations',
      description: 'AI-powered suggestions based on seasonal availability and your preferences.',
      icon: Star
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Food Enthusiast',
      image: '/api/placeholder/64/64',
      quote: 'Green Saver Market has completely transformed how I shop for groceries. The freshness and quality are unmatched!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Chef & Restaurant Owner',
      image: '/api/placeholder/64/64',
      quote: 'As a chef, quality ingredients are everything. Green Saver Market connects me directly with the best local farms.',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Sustainability Advocate',
      image: '/api/placeholder/64/64',
      quote: 'I love supporting local farmers while getting the freshest produce. This platform makes sustainable living easy.',
      rating: 5
    }
  ];

  const team = [
    {
      name: 'David Wilson',
      role: 'Founder & CEO',
      image: '/api/placeholder/150/150',
      bio: 'Former agricultural engineer passionate about connecting farmers with consumers.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Head of Operations',
      image: '/api/placeholder/150/150',
      bio: 'Supply chain expert ensuring seamless farm-to-table delivery operations.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'James Park',
      role: 'Technology Director',
      image: '/api/placeholder/150/150',
      bio: 'Tech innovator building the future of sustainable e-commerce platforms.',
      social: { linkedin: '#', twitter: '#' }
    }
  ];

  const tabContent = {
    mission: (
      <div className="space-y-6">
        <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
        <p className="text-lg text-gray-600 leading-relaxed">
          Green Saver Market exists to revolutionize the way people access fresh, sustainable produce 
          while supporting local farming communities. We believe that everyone deserves access to 
          high-quality, farm-fresh food that nourishes both body and planet.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          By eliminating intermediaries and connecting consumers directly with local farmers, 
          we ensure fair prices for farmers and fresh, affordable produce for families. 
          Our platform promotes sustainable agriculture practices and reduces food waste 
          through intelligent inventory management and seasonal recommendations.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-green-50 p-6 rounded-xl">
            <Award className="w-12 h-12 text-green-600 mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Quality Commitment</h4>
            <p className="text-gray-600">
              Every product meets our strict quality standards, ensuring you receive only the finest produce.
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <Users className="w-12 h-12 text-blue-600 mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Community First</h4>
            <p className="text-gray-600">
              Supporting local farmers and building stronger, more sustainable communities together.
            </p>
          </div>
        </div>
      </div>
    ),
    story: (
      <div className="space-y-6">
        <h3 className="text-3xl font-bold text-gray-900">Our Story</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">2019 - The Beginning</h4>
            <p className="text-gray-600">
              Founded by David Wilson, a former agricultural engineer who saw the disconnect 
              between farmers and consumers in the modern food system.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">2020 - First Partnerships</h4>
            <p className="text-gray-600">
              Established partnerships with 50 local farms, launching our platform with 
              a focus on organic and sustainable produce.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">2022 - Major Expansion</h4>
            <p className="text-gray-600">
              Expanded to serve 10 cities with over 200 partner farms and launched our 
              innovative delivery tracking system.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">2024 - Platform Revolution</h4>
            <p className="text-gray-600">
              Launched our advanced MERN stack platform with AI-powered recommendations, 
              real-time tracking, and community features.
            </p>
          </div>
        </div>
      </div>
    ),
    impact: (
      <div className="space-y-6">
        <h3 className="text-3xl font-bold text-gray-900">Our Impact</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-2xl font-semibold text-gray-900 mb-4">Environmental Impact</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Reduced carbon footprint by 40% through local sourcing</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Eliminated 2 million plastic bags through sustainable packaging</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Supported 500+ farms in transitioning to organic practices</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-2xl font-semibold text-gray-900 mb-4">Community Impact</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Created direct income for 500+ farming families</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Provided fresh produce access to underserved communities</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Educated 50,000+ people about sustainable agriculture</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Growing <span className="text-green-600">Communities</span>,
              <br />One Farm at a Time
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              We're revolutionizing the way people access fresh, sustainable produce while 
              supporting local farming communities and protecting our planet for future generations.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center">
                Explore Our Farms
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center">
                <Play className="mr-2 w-5 h-5" />
                Watch Our Story
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Learn More About Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our mission, story, and the positive impact we're making in communities worldwide.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center mb-12">
            {['mission', 'story', 'impact'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 mx-2 mb-4 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            {tabContent[activeTab]}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These fundamental principles guide everything we do and shape our commitment to you and our planet.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Green Saver Market</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets sustainable agriculture to bring you the best farm-to-table experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg mr-6 flex-shrink-0">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">
              Real stories from real people who love fresh, sustainable produce.
            </p>
          </div>

          <div className="relative">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 p-8 rounded-2xl text-center"
            >
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl text-gray-700 mb-6 italic">
                "{testimonials[currentTestimonial].quote}"
              </blockquote>
              <div className="flex items-center justify-center">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate individuals working together to create a more sustainable food system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-green-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Start your journey towards fresher, more sustainable produce today. 
              Support local farmers while nourishing your family with the best nature has to offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Become a Partner Farm
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
