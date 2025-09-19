import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Globe, MapPin } from 'lucide-react';
import Logo from '../../../components/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Check if we're in a dashboard route
  const isDashboardRoute = window.location.pathname.startsWith('/hr/') || 
                         window.location.pathname.startsWith('/company/') ||
                         window.location.pathname.startsWith('/candidate/') ||
                         window.location.pathname.startsWith('/super-admin/');

  if (isDashboardRoute) {
    return (
      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} IMS. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Privacy Policy</span>
                <span className="text-sm">Privacy</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">TeIMS</span>
                <span className="text-sm">TeIMS</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-b from-[#181ed4] to-[#0f1399] text-white relative z-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white p-2 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Logo className="h-12 w-12 object-contain" />
              </div>
              {/* <span className="text-2xl font-bold text-white">RMnS</span> */}
            </div>
            <p className="text-white/80 max-w-md mb-6 text-sm leading-relaxed">
              Revolutionizing recruitment with intelligent automation and seamless candidate management. 
              Built by JIT Global Info Systems for the modern workforce.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 bg-white/10 p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 bg-white/10 p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 bg-white/10 p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="lg:pl-8">
            <h4 className="text-lg font-bold text-white mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-blue-400">Quick Links</h4>
            <ul className="space-y-3.5">
              <li>
                <Link to="/" className="text-white/80 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-slate-400 hover:text-white transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/why-IMS" className="text-slate-400 hover:text-white transition-colors">
                  Why IMS
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="lg:pl-8">
            <h4 className="text-lg font-bold text-white mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-blue-400">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="mt-0.5 p-1.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                <MapPin className="h-4 w-4 text-blue-300 flex-shrink-0" />
              </div>
              <p className="text-white/80 text-sm group-hover:text-white transition-colors">
                  2/181, AGS Colony, Phase – 3, 1st floor, 4th Avenue, Mugalivakkam, Chennai - 600125
                </p>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                <Phone className="h-4 w-4 text-blue-300 flex-shrink-0" />
              </div>
              <a href="tel:+917810099942" className="text-white/80 hover:text-white transition-colors">
                  +91 78100 99942
                </a>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                <Mail className="h-4 w-4 text-blue-300 flex-shrink-0" />
              </div>
              <a href="mailto:sales@jitglobalinfosystems.com" className="text-white/80 hover:text-white transition-colors">
                  sales@jitglobalinfosystems.com
                </a>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                <Globe className="h-4 w-4 text-blue-300 flex-shrink-0" />
              </div>
              <a href="https://jitglobalinfosystems.com/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                  jitglobalinfosystems.com
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              &copy; {currentYear} JIT Global Info Systems Pvt Limited. All Rights Reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm hover:underline">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm hover:underline">
                TeIMS of Service
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm hover:underline">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;