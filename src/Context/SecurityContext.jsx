import React, { createContext, useContext } from 'react';
import api from '../lib/api';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;


  const endpoints = {
    securityGroups: '/security-groups',
    cloudTrail: '/cloud-trail',
    iamInsights: '/iam-insights',
    securityTools: '/security-tools',
  };


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