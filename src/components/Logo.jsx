import React from 'react';

const Logo = ({ className = '', ...props }) => {
  return (
    <div className={`flex items-center ${className}`} {...props}>
      <span className="text-2xl font-bold text-blue-600">IMS</span>
    </div>
  );
};

export default Logo;
