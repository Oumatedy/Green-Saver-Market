import React from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
  };

  return (
    <div className="bg-background">
      
      {/* Hero Section */}
      <section className="relative py-16 bg-[#F5F7F5]">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our products or services? We're here to help.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  Feel free to reach out to us through any of these channels. We'll get back to you as soon as possible.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-4 bg-[#E8F5E9] w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#1B5E20] transition-colors duration-300">
                    <Mail className="h-6 w-6 text-[#1B5E20] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">Email Us</h3>
                  <a href="mailto:support@greensaver.com" className="text-gray-600 hover:text-[#1B5E20] transition-colors duration-300">
                    support@greensaver.com
                  </a>
                </div>

                <div className="group bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-4 bg-[#E8F5E9] w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#1B5E20] transition-colors duration-300">
                    <Phone className="h-6 w-6 text-[#1B5E20] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">Call Us</h3>
                  <a href="tel:+1(555)123-4567" className="text-gray-600 hover:text-[#1B5E20] transition-colors duration-300">
                    +1 (555) 123-4567
                  </a>
                </div>

                <div className="group bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-4 bg-[#E8F5E9] w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#1B5E20] transition-colors duration-300">
                    <MapPin className="h-6 w-6 text-[#1B5E20] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">Visit Us</h3>
                  <p className="text-gray-600">123 Green Street,<br />Farm City, FC 12345</p>
                </div>

                <div className="group bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-4 bg-[#E8F5E9] w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#1B5E20] transition-colors duration-300">
                    <Clock className="h-6 w-6 text-[#1B5E20] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">Business Hours</h3>
                  <p className="text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat: 10:00 AM - 4:00 PM</p>
                </div>
              </div>

              {/* Map */}
              <div className="mt-8 rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.935242!3d40.730610!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM0x0IHNvbWV3aGVyZSBpbiBOZXcgWW9yaw!5e0!3m2!1sen!2sus!4v1627309374804!5m2!1sen!2sus"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Your message here..."
                    className="w-full p-3 border border-gray-200 rounded-lg min-h-[150px] focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white transition-colors duration-300 py-3 rounded-lg flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Message</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
