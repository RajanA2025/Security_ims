import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Briefcase, Clock, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// import Logo from '../../../components/Logo';

const Header = ({ isDashboard }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const solutionsRef = useRef(null);
  const productsButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (solutionsRef.current && 
          !solutionsRef.current.contains(event.target) && 
          !productsButtonRef.current?.contains(event.target)) {
        setIsProductsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' }
  ];

  const products = [
    { key: 'rms', label: 'RMS', path: '/' },
    { key: 'rid', label: 'RID' },
    { key: 'ims', label: 'IMS' },
    { key: 'intellichat', label: 'IntelliChat' }
  ];

  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [productModal, setProductModal] = useState('');

  // Dropdown animation variants
  const dropdownAnim = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.2 }
  };

  // Hide body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <Link to="/" className="flex items-center space-x-2 group">
            {/* <Logo className="h-12 w-auto" /> */}
          </Link>
          
          <nav className={`${isMobileMenuOpen ? 'hidden' : 'hidden md:flex'} items-center space-x-10`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-lg font-semibold px-2 py-1 transition-colors duration-300 group ${
                  isActive(item.path)
                    ? 'text-[#181ed4] after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-[#181ed4] after:to-[#6a82fb] after:rounded-full after:transition-all after:duration-300'
                    : 'text-slate-700 hover:text-[#181ed4]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#181ed4] to-[#6a82fb] rounded-full transition-all duration-300 ${
                    isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
            {/* Products Dropdown */}
            <div className="relative" ref={solutionsRef}>
              <button
                ref={productsButtonRef}
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="flex items-center text-lg font-semibold text-slate-700 hover:text-[#181ed4] transition-colors duration-300 px-2 py-1"
                aria-haspopup="true"
                aria-expanded={isProductsOpen}
              >
                <span className="mr-1">Products</span>
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isProductsOpen && (
                  <motion.div
                    {...dropdownAnim}
                    className="absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 border border-slate-200"
                  >
                    {products.map((product) => (
                      product.path ? (
                        <Link
                          key={product.key}
                          to={product.path}
                          className="flex items-center gap-2 px-4 py-3 text-base text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => setIsProductsOpen(false)}
                        >
                          {product.key === 'IMS' && <Logo className="h-5 w-5 object-contain" />}
                          {product.label}
                        </Link>
                      ) : (
                        <button
                          key={product.key}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-base text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={() => { setIsProductsOpen(false); setProductModal(product.label); }}
                        >
                          {product.key === 'IMS' && <Logo className="h-5 w-5 object-contain" />}
                          {product.label}
                        </button>
                      )
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Services Dropdown - REMOVED */}
          </nav>
          {/* Product Modal */}
          <AnimatePresence>
            {productModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={() => setProductModal('')}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-2"
                  style={{ pointerEvents: 'auto', minHeight: '100vh' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="relative flex flex-col items-center justify-center w-full max-w-xs sm:max-w-md bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/30 overflow-auto">
                    <button
                      onClick={() => setProductModal('')}
                      className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 transition-colors text-2xl font-bold bg-white/70 rounded-full w-9 h-9 flex items-center justify-center shadow-md"
                      aria-label="Close"
                      style={{ lineHeight: 1 }}
                    >
                      ×
                    </button>
                    <div className="flex flex-col items-center justify-center mt-2 mb-4">
                      <div className="bg-blue-100 p-4 rounded-full mb-3 shadow-sm flex items-center justify-center">
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Coming Soon</h2>
                      <p className="text-base text-slate-700 text-center max-w-xs">
                        Our Developers are working on that.<br />Soon this product will be in Market.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center space-x-4">
            {isDashboard ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/candidate-register')}
                  className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  {/* <Briefcase className="h-5 w-5" /> */}
                  Get Started
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-600 font-bold py-2 px-6 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 ml-2 text-lg"
                >
                  <span className="font-bold">Login</span>
                </button>
              </>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-700 hover:text-blue-600 transition-colors z-50"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[999] md:hidden overflow-hidden">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Menu Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl p-6 space-y-4 flex flex-col z-[1000]"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-gradient-to-br from-[#181ed4] to-[#6a82fb] p-2 rounded-xl shadow-lg">
                    {/* <Logo className="h-6 w-6 object-contain" /> */}
                  </div>
                  <span className="text-2xl font-bold text-[#181ed4]">IMS</span>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-2 text-lg font-semibold text-slate-700 hover:text-[#181ed4] transition-colors ${
                      isActive(item.path) ? 'text-[#181ed4]' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t pt-3">
                  <button
                    className="flex items-center w-full text-lg font-semibold text-slate-700 mb-2 focus:outline-none"
                    onClick={() => setIsMobileProductsOpen((v) => !v)}
                    aria-expanded={isMobileProductsOpen}
                    aria-controls="mobile-products-dropdown"
                  >
                    Products
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isMobileProductsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        id="mobile-products-dropdown"
                        className="overflow-hidden"
                      > 
                        {products.map((product) => (
                          product.path ? (
                            <Link
                              key={product.key}
                              to={product.path}
                              onClick={() => { setIsMobileMenuOpen(false); setIsMobileProductsOpen(false); }}
                              className="block py-2 pl-4 text-base text-slate-700 hover:text-[#181ed4] transition-colors"
                            >
                              {/* <Logo className="h-5 w-5 inline mr-2 object-contain" /> */}
                              {product.label}
                            </Link>
                          ) : (
                            <button
                              key={product.key}
                              className="block w-full text-left py-2 pl-4 text-base text-slate-700 hover:text-[#181ed4] transition-colors"
                              onClick={() => { setIsMobileProductsOpen(false); setProductModal(product.label); }}
                            >
                              {/* <Logo className="h-5 w-5 inline mr-2 object-contain" /> */}
                              {product.label}
                            </button>
                          )
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {!isDashboard && (
                  <>
                    <button
                      onClick={() => {
                        navigate('/candidate-register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 text-lg mt-4"
                    >
                      Get Started
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="w-full mt-2 inline-flex items-center justify-center bg-white text-blue-600 border border-blue-600 font-bold py-2 px-6 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 text-lg"
                    >
                      <span>Login</span>
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;