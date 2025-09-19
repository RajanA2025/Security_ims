import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#181ed4] text-white flex items-center justify-center">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-white mb-4">
              404
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Page Not Found</h2>
            <p className="text-xl text-white max-w-2xl mx-auto mb-8">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-white text-[#181ed4] font-bold py-4 px-8 rounded-xl text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-white hover:text-[#181ed4] transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </button>
          </div>

          <div className="mt-12 text-gray-400">
            <p className="mb-4">Looking for something specific? Try these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/solutions" className="hover:text-white transition-colors">Solutions</Link>
              <Link to="/why-IMS" className="hover:text-white transition-colors">Why IMS</Link>
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;