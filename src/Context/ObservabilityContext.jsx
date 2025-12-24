import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import axios from "axios";
const ObservabilityContext = createContext();

export const ObservabilityProvider = ({ children }) => {
  const API_BASE_URL = "http://47.130.218.97:8012";
  
  const [loading, setLoading] = useState(false);
  const [securityData, setSecurityData] = useState([]);
  const [eipData, setEipData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [s3Data, setS3Data] = useState([]);
  const [ec2Data, setEc2Data] = useState([]);
let jwt_token = localStorage.getItem("jwt_token");
  // ---------------------------------------------------
  // ✅ Load account IDs safely from localStorage
  // ---------------------------------------------------
  let storedAccountIds = localStorage.getItem("account_ids");
  try {
    storedAccountIds = JSON.parse(storedAccountIds);
  } catch {
    storedAccountIds = storedAccountIds ? [storedAccountIds] : [];
  }

  if (!Array.isArray(storedAccountIds)) {
    storedAccountIds = [storedAccountIds];
  }

  const POST_BODY = { account_ids: storedAccountIds };

  // ---------------------------------------------------
  // 🔥 Unified POST request helper (Clean & DRY)
  // ---------------------------------------------------
  const postRequest = async (url, setter) => {
    setLoading(true);

    try {
      const res = await axios.post(url, POST_BODY, {
        headers: { Authorization: `Bearer ${jwt_token}` },
      });

      console.log(`📌 ${url} →`, res.data);

      setter(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(`❌ Error fetching ${url}`, err);
      setter([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // 🔥 API functions (POST only, NO FILTERING)
  // ---------------------------------------------------
  const fetchKeyPairs = () =>
    postRequest(`${API_BASE_URL}/keypairs2/filter`, setSecurityData,  {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      });

  const fetchEIP = () =>
    postRequest(`${API_BASE_URL}/orphaned-eip/filter`, setEipData ,  {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      });

  const fetchVolumes = () =>
    postRequest(`${API_BASE_URL}/orphaned-volumes/filter`, setVolumeData,  {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      });
  const fetchS3 = () =>
    postRequest(`${API_BASE_URL}/s3/filter`, setS3Data ,  {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      });

  const fetchEC2 = () =>
    postRequest(`${API_BASE_URL}/ec2/filter`, setEc2Data,  {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      });

  // ---------------------------------------------------
  // 🔥 Auto-fetch on mount
  // ---------------------------------------------------
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

export const useObservability = () => useContext(ObservabilityContext);
