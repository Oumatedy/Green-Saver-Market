import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, ShoppingBasket, Tractor, ShieldCheck } from "lucide-react";

export default function AuthLanding() {
  const [selectedRole, setSelectedRole] = useState('customer');
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <Leaf className="h-16 w-16 text-[#1B5E20]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Green Saver Market
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fresh, local produce delivered from farm to your table. Join our
            sustainable community of farmers and food lovers.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="text-center p-6">
            <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBasket className="h-10 w-10 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Fresh Produce</h3>
            <p className="text-gray-600 text-sm">
              Direct from local farms, seasonal and organic options available
            </p>
          </motion.div>

          <motion.div variants={item} className="text-center p-6">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tractor className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">
              Same-day delivery with real-time tracking and flexible scheduling
            </p>
          </motion.div>

          <motion.div variants={item} className="text-center p-6">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Community</h3>
            <p className="text-gray-600 text-sm">
              Support local farmers and connect with sustainable food enthusiasts
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Join Green Saver Market
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Choose your role to get started
            </p>

            <div className="grid grid-cols-3 gap-1 p-2 bg-green-50 rounded-lg mb-8">
              <button
                onClick={() => setSelectedRole('customer')}
                className={`py-2 px-4 text-center rounded-lg transition-all duration-300 ${
                  selectedRole === 'customer' ? 'bg-white shadow-md' : 'hover:bg-white/50'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => setSelectedRole('farmer')}
                className={`py-2 px-4 text-center rounded-lg transition-all duration-300 ${
                  selectedRole === 'farmer' ? 'bg-white shadow-md' : 'hover:bg-white/50'
                }`}
              >
                Farmer
              </button>
              <button
                onClick={() => setSelectedRole('admin')}
                className={`py-2 px-4 text-center rounded-lg transition-all duration-300 ${
                  selectedRole === 'admin' ? 'bg-white shadow-md' : 'hover:bg-white/50'
                }`}
              >
                Admin
              </button>
            </div>

            <motion.div
              key={selectedRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              {selectedRole === 'customer' && (
                <>
                  <h3 className="text-2xl font-semibold mb-4">Shop Fresh Produce</h3>
                  <p className="text-gray-600 mb-6">
                    Browse local farms, order fresh produce, and enjoy healthy eating
                  </p>
                  <Link
                    to="/sign-up?role=customer"
                    className="block w-full bg-[#1B5E20] text-white py-3 rounded-lg hover:bg-[#2E7D32] transition-colors duration-300"
                  >
                    Sign up as Customer
                  </Link>
                </>
              )}

              {selectedRole === 'farmer' && (
                <>
                  <h3 className="text-2xl font-semibold mb-4">Sell Your Harvest</h3>
                  <p className="text-gray-600 mb-6">
                    List your products, manage inventory, and reach local customers
                  </p>
                  <Link
                    to="/sign-up?role=farmer"
                    className="block w-full bg-[#1B5E20] text-white py-3 rounded-lg hover:bg-[#2E7D32] transition-colors duration-300"
                  >
                    Sign up as Farmer
                  </Link>
                </>
              )}

              {selectedRole === 'admin' && (
                <>
                  <h3 className="text-2xl font-semibold mb-4">Platform Management</h3>
                  <p className="text-gray-600 mb-6">
                    Oversee operations, manage users, and analyze platform performance
                  </p>
                  <Link
                    to="/sign-up?role=admin"
                    className="block w-full bg-[#1B5E20] text-white py-3 rounded-lg hover:bg-[#2E7D32] transition-colors duration-300"
                  >
                    Admin Sign in
                  </Link>
                </>
              )}
            </motion.div>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link to="/sign-in" className="text-[#1B5E20] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
