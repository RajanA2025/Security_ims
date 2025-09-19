// src/context/CostContext.js
import React, { createContext, useState, useEffect } from "react";

export const CostContext = createContext();

export const CostProvider = ({ children }) => {
  const [costData, setCostData] = useState(null);
  const [resourcesData, setResourcesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [costRes, resourcesRes] = await Promise.all([
          fetch("http://13.212.15.14:8000/cost-summary"),
          fetch("http://13.212.15.14:8003/resources")
        ]);

        if (!costRes.ok || !resourcesRes.ok) throw new Error("Failed to fetch data");

        const costJson = await costRes.json();
        const resourcesJson = await resourcesRes.json();

        setCostData(costJson);
        setResourcesData(resourcesJson);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <CostContext.Provider value={{ costData, resourcesData, loading, error }}>
      {children}
    </CostContext.Provider>
  );
};
