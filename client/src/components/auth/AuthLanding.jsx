import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AuthLanding() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-br from-blue-50 to-white text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl space-y-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Welcome to GreenSaver
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Please sign in or create an account to continue.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button asChild className="w-full md:w-auto">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full md:w-auto">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
