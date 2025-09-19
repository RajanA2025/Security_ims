import React, { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiMenu, FiX } from 'react-icons/fi';
import jitLogo from '../../../assets/jitlogo.png';

const JitHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const navItems = [
    { name: 'Home', href: 'https://jitglobalinfosystems.com/' },
    { name: 'About Us', href: 'https://jitglobalinfosystems.com/about/' },
    {
      name: 'Services',
      items: [
        { name: 'SAP', href: 'https://jitglobalinfosystems.com/portfolio/sap-offerings/' },
        { name: 'Cloud Infra Services', href: 'https://jitglobalinfosystems.com/portfolio/cloud-infra-services/' },
        { name: 'Applications', href: 'https://jitglobalinfosystems.com/portfolio/application-development-services/' },
        { name: 'Data Engineering', href: 'https://jitglobalinfosystems.com/portfolio/data-engineering-services/' },
        { name: 'Cybersecurity', href: 'https://jitglobalinfosystems.com/portfolio/cybersecurity-services/' },
        { name: 'Testing', href: 'https://jitglobalinfosystems.com/portfolio/testing-as-a-service-taas/' },
        { name: 'Project Management', href: 'https://jitglobalinfosystems.com/portfolio/project-management-as-a-service-pmaas/' }
      ]
    },
    {
      name: 'Insights',
      items: [
        { name: 'Case Studies', href: 'https://jitglobalinfosystems.com/case-study/' },
        { name: 'Data Analytics', href: 'https://jitglobalinfosystems.com/portfolio/data-engineering-services/' },
        { name: 'Application Development', href: 'https://jitglobalinfosystems.com/portfolio/application-development-services/' },
        { name: 'PMaaS', href: 'https://jitglobalinfosystems.com/portfolio/project-management-as-a-service-pmaas/' }
      ]
    },
    { name: 'Alliances', href: 'https://jitglobalinfosystems.com/alliances/' },
    { name: 'Company', href: 'https://jitglobalinfosystems.com/company/' },
    { name: 'Contact Us', href: 'https://jitglobalinfosystems.com/contact/' }
  ];

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="https://jitglobalinfosystems.com/" className="flex items-center">
              <img
                src={jitLogo}
                alt="JIT Global"
                className="h-14 w-auto"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.items ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                        activeDropdown === item.name 
                          ? 'text-blue-700 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50/50'
                      }`}
                    >
                      {item.name}
                      <span className="ml-1.5 flex items-center">
                        {activeDropdown === item.name ? (
                          <FiChevronUp size={16} className="text-blue-600" />
                        ) : (
                          <FiChevronDown size={16} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                        )}
                      </span>
                    </button>
                    <div 
                      className={`absolute left-0 mt-2 w-64 rounded-xl bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden transition-all duration-300 transform origin-top z-[1001] ${
                        activeDropdown === item.name 
                          ? 'opacity-100 scale-100 translate-y-0' 
                          : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                      }`}
                    >
                      <div className="py-1.5">
                        {item.items.map((subItem, index) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className={`block px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 ${
                              index === 0 ? 'rounded-t-lg' : ''
                            } ${index === item.items.length - 1 ? 'rounded-b-lg' : ''}
                            hover:pl-6 hover:font-semibold`}
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <a
                    href={item.href}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg transition-colors duration-300"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-all duration-300"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1 bg-white shadow-xl border-t border-gray-100">
          {navItems.map((item) => (
            <div key={item.name} className="border-b border-gray-100 last:border-0">
              {item.items ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`w-full flex justify-between items-center px-4 py-3.5 text-base font-medium rounded-lg transition-colors duration-200 ${
                      activeDropdown === item.name 
                        ? 'text-blue-700 bg-blue-50' 
                        : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                    <span className="ml-2">
                      {activeDropdown === item.name ? (
                        <FiChevronUp className="text-blue-600" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden bg-blue-50/30 rounded-lg mx-2 my-1 ${
                      activeDropdown === item.name ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="pl-4 py-2 space-y-1">
                      {item.items.map((subItem) => (
                        <a
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200 hover:pl-5"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <a
                  href={item.href}
                  className="block px-4 py-3.5 text-base font-medium text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 rounded-lg transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default JitHeader;
