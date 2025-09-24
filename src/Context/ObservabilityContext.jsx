import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ObservabilityContext = createContext();

export const ObservabilityProvider = ({ children }) => {
  const API_BASE_URL = "http://13.212.15.14:8016";

  const [loading, setLoading] = useState(false);
  const [securityData, setSecurityData] = useState([]);
  const [eipData, setEipData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [s3Data, setS3Data] = useState([]);
  const [ec2Data, setEc2Data] = useState([]);

  // fetch functions
  const fetchKeyPairs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/keypairs2`);
      setSecurityData(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchEIP = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/orphaned-eip`);
      setEipData(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolumes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/orphaned-volumes`);
      setVolumeData(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchS3 = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/s3`);
      setS3Data(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchEC2 = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/ec2`);
      setEc2Data(res.data);
    } finally {
      setLoading(false);
    }
  };

  // Optionally: fetch everything once on mount
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
