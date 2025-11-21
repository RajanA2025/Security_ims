import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const ObservabilityContext = createContext();

export const ObservabilityProvider = ({ children }) => {
  const API_BASE_URL = "http://47.130.218.97:8012";

  const [loading, setLoading] = useState(false);
  const [securityData, setSecurityData] = useState([]);
  const [eipData, setEipData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [s3Data, setS3Data] = useState([]);
  const [ec2Data, setEc2Data] = useState([]);

  // ✅ Get stored account IDs from localStorage
  const storedAccountIds = JSON.parse(localStorage.getItem("account_ids")) || [];

  // ✅ Filter helper
  const filterByAccounts = (data) => {
    if (!storedAccountIds.length) return data;
    return data.filter((item) =>
      storedAccountIds.includes(item.account_id) // Adjust key if needed
    );
  };

  // fetch functions
  const fetchKeyPairs = async () => {
    setLoading(true);
    try {
  const res = await api.get(`${API_BASE_URL}/keypairs2`);
      setSecurityData(filterByAccounts(res.data));
    } finally {
      setLoading(false);
    }
  };

  const fetchEIP = async () => {
    setLoading(true);
    try {
  const res = await api.get(`${API_BASE_URL}/orphaned-eip`);
      setEipData(filterByAccounts(res.data));
    } finally {
      setLoading(false);
    }
  };

  const fetchVolumes = async () => {
    setLoading(true);
    try {
  const res = await api.get(`${API_BASE_URL}/orphaned-volumes`);
      setVolumeData(filterByAccounts(res.data));
    } finally {
      setLoading(false);
    }
  };

  const fetchS3 = async () => {
    setLoading(true);
    try {
  const res = await api.get(`${API_BASE_URL}/s3`);
      setS3Data(filterByAccounts(res.data));
    } finally {
      setLoading(false);
    }
  };

  const fetchEC2 = async () => {
    setLoading(true);
    try {
  const res = await api.get(`${API_BASE_URL}/ec2`);
      setEc2Data(filterByAccounts(res.data));
    } finally {
      setLoading(false);
    }
  };

  // fetch everything once on mount
  useEffect(() => {
    fetchKeyPairs();
    fetchEIP();
    fetchVolumes();
    fetchS3();
    fetchEC2();
  }, []);

  return (
    <ObservabilityContext.Provider
      value={{
        loading,
        securityData,
        eipData,
        volumeData,
        s3Data,
        ec2Data,
        fetchKeyPairs,
        fetchEIP,
        fetchVolumes,
        fetchS3,
        fetchEC2,
      }}
    >
      {children}
    </ObservabilityContext.Provider>
  );
};

// custom hook
export const useObservability = () => useContext(ObservabilityContext);
