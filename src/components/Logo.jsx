import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Logo = ({ className = '', ...props }) => {
  return (
    <Link to="/" className={`flex items-center ${className}`} {...props}>
      <img 
        src={logo} 
        alt="Logo" 
        className="h-8 w-auto"
      />
      <span className="ml-2 text-xl font-semibold text-gray-800">
        Your Brand Name
      </span>
    </Link>
  );
};

export default Logo;
