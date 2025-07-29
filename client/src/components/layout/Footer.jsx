import { Leaf, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-[#1B5E20]" />
              <span className="text-xl font-bold text-[#1B5E20]">Green Saver Market</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Connecting farmers directly with consumers for fresh, sustainable produce.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="transform transition-transform hover:scale-110">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-[#1B5E20] transition-colors duration-300" />
              </a>
              <a href="#" className="transform transition-transform hover:scale-110">
                <Twitter className="h-5 w-5 text-gray-400 hover:text-[#1B5E20] transition-colors duration-300" />
              </a>
              <a href="#" className="transform transition-transform hover:scale-110">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-[#1B5E20] transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Quick Links</h3>
            <div className="space-y-3">
              <Link 
                to="/products" 
                className="block text-gray-600 hover:text-[#1B5E20] transition-colors duration-300 hover:translate-x-1 transform text-sm"
              >
                Products
              </Link>
              <Link 
                to="/farmers" 
                className="block text-gray-600 hover:text-[#1B5E20] transition-colors duration-300 hover:translate-x-1 transform text-sm"
              >
                For Farmers
              </Link>
              <Link 
                to="/about" 
                className="block text-gray-600 hover:text-[#1B5E20] transition-colors duration-300 hover:translate-x-1 transform text-sm"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="block text-gray-600 hover:text-[#1B5E20] transition-colors duration-300 hover:translate-x-1 transform text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Support</h3>
            <div className="space-y-3">
              <Link 
                to="/faq" 
                className="block text-gray-600 hover:text-[#1B5E20] transition-colors duration-300 hover:translate-x-1 transform text-sm"
              >
                FAQ
              </Link>
              <Link 
                to="/shipping" 
                className="block text-gray-600 hover:text-[#1B5E20] transition-colors duration-300 hover:translate-x-1 transform text-sm"
              >
                Shipping Information
              </Link>
              <Link 
                to="/returns" 
                className="block text-gray-600 hover:text-[#1B5E20] transition-colors duration-300 hover:translate-x-1 transform text-sm"
              >
                Returns Policy
              </Link>
              <Link 
                to="/privacy" 
                className="block text-gray-600 hover:text-[#1B5E20] transition-colors duration-300 hover:translate-x-1 transform text-sm"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="h-5 w-5 text-[#1B5E20]" />
                <a href="mailto:support@greensaver.com" className="text-sm hover:text-[#1B5E20] transition-colors duration-300">
                  support@greensaver.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="h-5 w-5 text-[#1B5E20]" />
                <a href="tel:+1(555)123-4567" className="text-sm hover:text-[#1B5E20] transition-colors duration-300">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-start space-x-3 text-gray-600">
                <MapPin className="h-5 w-5 text-[#1B5E20] mt-1" />
                <p className="text-sm">
                  123 Green Street,<br />
                  Farm City, FC 12345
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Green Saver Market. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
