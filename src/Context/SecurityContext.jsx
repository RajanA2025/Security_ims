import React, { createContext, useContext } from 'react';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const securityEndpoints = {
    securityGroups: `${apiBaseUrl}/security-groups`,
    cloudTrail: `${apiBaseUrl}/cloud-trail`,
    iamInsights: `${apiBaseUrl}/iam-insights`,
    securityTools: `${apiBaseUrl}/security-tools`,
  };

  const value = {
    apiBaseUrl,
    endpoints: securityEndpoints,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};