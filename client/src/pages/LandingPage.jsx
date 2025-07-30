import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Truck, Users, Shield, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-background">
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-[#F5F7F5]">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl text-green-900 font-bold mb-6">
            Fresh From Farm to Your Table
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect directly with local farmers and enjoy the freshest, most sustainable produce delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[#1B5E20] hover:bg-[#2E7D32] transition-colors duration-300 px-8 py-3 text-base"
              asChild
            >
              <Link to="/products">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#8B4513]/10 hover:border-[#8B4513] hover:text-[#8B4513] transition-all duration-300 px-8 py-3 text-base"
              asChild
            >
              <Link to="/farmers">Join as Farmer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Green Saver Market?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing how you buy fresh produce by connecting you directly with local farmers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-white rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
              <div className="mb-6 bg-[#E8F5E9] w-20 h-20 mx-auto rounded-full flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:bg-[#1B5E20]">
                <Leaf className="h-10 w-10 text-[#1B5E20] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#1B5E20] transition-colors duration-300">Fresh & Organic</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get the freshest produce directly from local organic farms with no middlemen.
              </p>
            </div>

            <div className="group bg-white rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
              <div className="mb-6 bg-[#E8F5E9] w-20 h-20 mx-auto rounded-full flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:bg-[#1B5E20]">
                <Truck className="h-10 w-10 text-[#1B5E20] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#1B5E20] transition-colors duration-300">Fast Delivery</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Same-day delivery available in most areas. Fresh produce at your doorstep.
              </p>
            </div>

            <div className="group bg-white rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
              <div className="mb-6 bg-[#E8F5E9] w-20 h-20 mx-auto rounded-full flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:bg-[#1B5E20]">
                <Users className="h-10 w-10 text-[#1B5E20] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#1B5E20] transition-colors duration-300">Support Local</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Support local farmers and communities while getting the best quality produce.
              </p>
            </div>

            <div className="group bg-white rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
              <div className="mb-6 bg-[#E8F5E9] w-20 h-20 mx-auto rounded-full flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:bg-[#1B5E20]">
                <Shield className="h-10 w-10 text-[#1B5E20] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#1B5E20] transition-colors duration-300">Quality Guaranteed</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                100% satisfaction guarantee. If you're not happy, we'll make it right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="flex mb-4 transform transition-transform hover:scale-105">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  "The freshest vegetables I've ever tasted! The direct connection with farmers makes all the difference."
                </p>
                <div className="flex items-center group">
                  <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center mr-4 transition-colors duration-300 group-hover:bg-[#1B5E20]">
                    <span className="text-sm font-semibold text-[#1B5E20] group-hover:text-white transition-colors duration-300">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-[#1B5E20] transition-colors duration-300">Jane Doe</p>
                    <p className="text-sm text-gray-600">Happy Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-[#1B5E20] text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Taste the Difference?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of customers who have made the switch to fresh, local produce.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-[#1B5E20] hover:bg-[#E8F5E9] transition-colors duration-300 px-8 py-3 text-base shadow-lg hover:shadow-xl"
            asChild
          >
            <Link to="/auth">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}