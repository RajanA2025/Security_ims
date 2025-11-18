import React, { createContext, useContext } from 'react';
import api from '../lib/api';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
  // Keep the raw base URL available if needed for non-API usage
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Expose relative paths so components can also build URLs if absolutely needed
  const endpoints = {
    securityGroups: '/security-groups',
    cloudTrail: '/cloud-trail',
    iamInsights: '/iam-insights',
    securityTools: '/security-tools',
  };

  // Helper methods that use the centralized api client.
  // Each returns the axios response.data to keep callers simple.
  const getSecurityGroups = async (params = {}) => {
    const res = await api.get(endpoints.securityGroups, { params });
    return res.data;
  };

  const getCloudTrail = async (params = {}) => {
    const res = await api.get(endpoints.cloudTrail, { params });
    return res.data;
  };

  const getIamInsights = async (params = {}) => {
    const res = await api.get(endpoints.iamInsights, { params });
    return res.data;
  };

  const getSecurityTools = async (params = {}) => {
    const res = await api.get(endpoints.securityTools, { params });
    return res.data;
  };

  const value = {
    apiBaseUrl,
    endpoints,
    getSecurityGroups,
    getCloudTrail,
    getIamInsights,
    getSecurityTools,
  };

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) throw new Error('useSecurityContext must be used within a SecurityProvider');
  return context;
};