import React, { createContext, useState, useEffect, useRef } from "react";
import api from "../lib/api";

export const CostContext = createContext();

export const CostProvider = ({ children }) => {
  const [costData, setCostData] = useState(null);
  const [resourcesData, setResourcesData] = useState(null);
  const [tagData, setTagData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [tagSummary, setTagSummary] = useState({
    fully_tagged: 0,
    partially_tagged: 0,
    not_tagged: 0,
    total_resources: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    account_id: null,
    app: null,
    start_date: null,
    end_date: null,
  });

  const [accounts, setAccounts] = useState([]); // full list for dropdown
  const [apps, setApps] = useState([]);
  const [Current_acc, setCurrent_acc] = useState();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL1;

  // 🔥 FIX ADDED → TreeSelect ONLY using POST returned accounts
  const [treeData, setTreeData] = useState([]);

  const hasFetchedCompanies = useRef(false);

  useEffect(() => {
    const account = localStorage.getItem("current_acc");
    setCurrent_acc(account);
  }, []);

  // Register Company
  const registerCompany = async (companyData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/api/company/register`, companyData);
      return response.data;
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message);
      return { error: "Network Error" };
    } finally {
      setLoading(false);
    }
  };

  // Login
  const loginCompany = async (loginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/company/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Login failed");

      const authValue = result.token ? result.token : "true";
      localStorage.setItem("auth_token", authValue);

      if (result.cid) localStorage.setItem("company_cid", result.cid);

      return result;
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message);
      return { error: err.message || "Network Error" };
    } finally {
      setLoading(false);
    }
  };

  // Add Account
  const addAccount = async (accountData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");

      const response = await fetch(`http://47.130.218.97:8016/api/account/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(accountData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Account creation failed");

      return result;
    } catch (err) {
      console.error("Add Account Error:", err);
      setError(err.message);
      return { error: err.message || "Network Error" };
    } finally {
      setLoading(false);
    }
  };

  // All Companies
  const getAllCompanies = async (forceRefresh = false) => {
    if (hasFetchedCompanies.current && !forceRefresh) {
      return companies;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${apiBaseUrl}/api/company/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to fetch companies");

      setCompanies(result);
      hasFetchedCompanies.current = true;

      return result;
    } catch (err) {
      console.error("Get All Companies Error:", err);
      setError(err.message);
      return { error: err.message || "Network Error" };
    } finally {
      setLoading(false);
    }
  };

  // All Accounts for a Company
  const getAllAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const cid = localStorage.getItem("company_cid");
      if (!cid) throw new Error("Company ID missing");

      const response = await fetch(`${apiBaseUrl}/api/accounts/all/${cid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to fetch accounts");

      return result;
    } catch (err) {
      console.error("Fetch Accounts Error:", err);
      setError(err.message);
      return { error: err.message || "Network Error" };
    } finally {
      setLoading(false);
    }
  };

  // Main Data Fetch
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // ---------------------------
        // 1️⃣ Get stored + selected IDs
        // ---------------------------
        const storedIds = JSON.parse(localStorage.getItem("account_ids")) || [];
        const { account_id } = filters;

        const postBody = {
          account_ids: account_id && account_id !== "ALL" ? [account_id] : storedIds,
        };

        console.log("➡️ POST Body:", postBody);

        // ---------------------------
        // 2️⃣ API Calls (ALL POST)
        // ---------------------------
        const [costRes, resourcesRes, tagRes] = await Promise.all([
          // COST SUMMARY
          fetch("http://47.130.218.97:8021/cost-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
          }),

          // RESOURCES FILTER
          fetch("http://47.130.218.97:8003/resources/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
          }),

          // TAGS FILTER
          fetch("http://47.130.218.97:8007/tags/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
          }),
        ]);

        // ---------------------------
        // 3️⃣ Parse JSON
        // ---------------------------
        const costJson = await costRes.json();
        const resourcesJson = await resourcesRes.json();
        const tagsJson = await tagRes.json();

        // ---------------------------
        // 4️⃣ Build TreeSelect
        // ---------------------------
        const apiAccountIds = costJson?.account_ids || [];

        setTreeData(
          apiAccountIds.map((id) => ({
            title: id,
            value: id,
          }))
        );

        // ---------------------------
        // 5️⃣ Build Accounts Dropdown
        // ---------------------------
        const allIds = costJson?.all_account_ids || [];
        const orderedAccounts = allIds.includes("ALL")
          ? allIds
          : ["ALL", ...allIds];

        setAccounts(orderedAccounts);

        // ---------------------------
        // 6️⃣ Tag Data (Already filtered from backend)
        // ---------------------------
        const processedTagData = Array.isArray(tagsJson)
          ? tagsJson.map((res, i) => ({
            id: res.id || i + 1,
            account_name: res.account_name,
            account_id: res.account_id,
            region: res.region,
            service: res.service,
            resource: res.resource,
            tags: res.tags || {},
          }))
          : [];

        // ---------------------------
        // 7️⃣ Apps
        // ---------------------------
        const appList =
          costJson?.top_5?.top_apps_current_month?.map((a) => a.app_name) || [];
        setApps(appList);

        // ---------------------------
        // 8️⃣ Tag Summary
        // ---------------------------
        const requiredTags = ["Name", "Owner", "Project", "Environment"];
        const summary = {
          fully_tagged: 0,
          partially_tagged: 0,
          not_tagged: 0,
          total_resources: processedTagData.length,
        };

        processedTagData.forEach((res) => {
          const matched = requiredTags.filter((t) => res.tags[t]).length;
          if (matched === requiredTags.length) summary.fully_tagged++;
          else if (matched > 0) summary.partially_tagged++;
          else summary.not_tagged++;
        });

        // ---------------------------
        // 9️⃣ Set All Final Data
        // ---------------------------
        setTagData(processedTagData);
        setTagSummary(summary);
        setCostData(costJson);
        setResourcesData(resourcesJson);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [filters]);


  return (
    <CostContext.Provider
      value={{
        costData,
        resourcesData,
        tagData,
        tagSummary,
        loading,
        error,
        filters,
        setFilters,
        accounts,
        apps,
        treeData,          // 🔥 FIX ADDED
        setTreeData,       // 🔥 FIX ADDED
        registerCompany,
        loginCompany,
        addAccount,
        getAllCompanies,
        companies,
        getAllAccounts,
      }}
    >
      {children}
    </CostContext.Provider>
  );
};
