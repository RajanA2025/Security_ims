import React, { createContext, useState, useEffect, useRef } from "react";
import api from "../lib/api";

export const CostContext = createContext();

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL1;

// ---------- Helpers ----------

const logError = (scope, error, extra = {}) => {
  // Centralized, structured error logging
  // eslint-disable-next-line no-console
  console.error(`[${scope}]`, {
    message: error?.message,
    name: error?.name,
    stack: error?.stack,
    ...extra,
  });
};

const getErrorMessage = (fallbackMessage, error) => {
  if (!error) return fallbackMessage;
  if (typeof error === "string") return error || fallbackMessage;
  return error.message || fallbackMessage;
};

const getAuthToken = () => {
  try {
    return localStorage.getItem("auth_token") || null;
  } catch (err) {
    logError("getAuthToken", err);
    return null;
  }
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch (err) {
    logError("parseJsonSafe", err, { url: response?.url, status: response?.status });
    return null;
  }
};

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
  const [treeData, setTreeData] = useState([]); // TreeSelect options

  const hasFetchedCompanies = useRef(false);

  useEffect(() => {
    const account = localStorage.getItem("current_acc");
    setCurrent_acc(account);
  }, []);

  // ---------- Company Registration ----------
  const registerCompany = async (companyData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/api/company/register`, companyData);
      return response.data;
    } catch (err) {
      logError("registerCompany", err);
      const message = getErrorMessage("Unable to register company. Please try again.", err);
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  // ---------- Login ----------
  const loginCompany = async (loginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/company/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await parseJsonSafe(response);

      if (!response.ok) {
        const message = getErrorMessage("Login failed. Please check your credentials.", result);
        setError(message);
        return { error: message };
      }

      const authValue = result?.token || "true";
      try {
        localStorage.setItem("auth_token", authValue);
        localStorage.setItem("jwt_token", authValue);
        if (result?.cid) {
          localStorage.setItem("company_cid", result.cid);
        }
      } catch (err) {
        logError("loginCompany/localStorage", err);
      }

      return result;
    } catch (err) {
      logError("loginCompany", err);
      const message = getErrorMessage("Unable to login. Please try again.", err);
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  // ---------- Add Account ----------
  const addAccount = async (accountData) => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const response = await fetch(`http://47.130.218.97:8016/api/account/add`, {
        method: "POST",
        headers,
        body: JSON.stringify(accountData),
      });

      const result = await parseJsonSafe(response);

      if (!response.ok) {
        const message = getErrorMessage("Account creation failed.", result);
        setError(message);
        return { error: message };
      }

      return result;
    } catch (err) {
      logError("addAccount", err);
      const message = getErrorMessage("Unable to add account. Please try again.", err);
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  // ---------- Get All Companies ----------
  const getAllCompanies = async (forceRefresh = false) => {
    if (hasFetchedCompanies.current && !forceRefresh) {
      return companies;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const response = await fetch(`${apiBaseUrl}/api/company/all`, {
        method: "GET",
        headers,
      });

      const result = await parseJsonSafe(response);

      if (!response.ok) {
        const message = getErrorMessage("Failed to fetch companies.", result);
        setError(message);
        return { error: message };
      }

      setCompanies(result || []);
      hasFetchedCompanies.current = true;

      return result;
    } catch (err) {
      logError("getAllCompanies", err);
      const message = getErrorMessage("Unable to load companies. Please try again.", err);
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  // ---------- Get All Accounts for a Company ----------
  const getAllAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const cid = localStorage.getItem("company_cid");
      if (!cid) {
        const message = "Company ID missing. Please login again.";
        setError(message);
        return { error: message };
      }

      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const response = await fetch(`${apiBaseUrl}/api/accounts/all/${cid}`, {
        method: "GET",
        headers,
      });

      const result = await parseJsonSafe(response);

      if (!response.ok) {
        const message = getErrorMessage("Failed to fetch accounts.", result);
        setError(message);
        return { error: message };
      }

      return result;
    } catch (err) {
      logError("getAllAccounts", err);
      const message = getErrorMessage("Unable to load accounts. Please try again.", err);
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  // ---------- Main Data Fetch (Cost / Resources / Tags) ----------
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Get stored + selected IDs
        const storedAccountIdsRaw = localStorage.getItem("account_ids");
        let storedIds = [];

        try {
          storedIds = storedAccountIdsRaw
            ? JSON.parse(storedAccountIdsRaw)
            : [];
        } catch (err) {
          logError("fetchAllData/account_ids/parse", err);
          storedIds = [];
        }

        const { account_id } = filters;

        const postBody = {
          account_ids:
            account_id && account_id !== "ALL"
              ? [account_id]
              : Array.isArray(storedIds)
              ? storedIds
              : [],
        };

        console.log("➡️ POST Body:", postBody);

        // 2️⃣ API Calls (ALL POST)
        const [costRes, resourcesRes, tagRes] = await Promise.all([
          fetch("http://47.130.218.97:8021/cost-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
          }),
          fetch("http://47.130.218.97:8003/resources/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
          }),
          fetch("http://47.130.218.97:8007/tags/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
          }),
        ]);

        // 3️⃣ Parse JSON safely
        const [costJson, resourcesJson, tagsJson] = await Promise.all([
          parseJsonSafe(costRes),
          parseJsonSafe(resourcesRes),
          parseJsonSafe(tagRes),
        ]);

        // 4️⃣ Build TreeSelect from POST accounts
        const apiAccountIds = costJson?.account_ids || [];
        setTreeData(
          apiAccountIds.map((id) => ({
            title: id,
            value: id,
          }))
        );

        // 5️⃣ Build Accounts Dropdown
        const allIds = costJson?.all_account_ids || [];
        const orderedAccounts = allIds.includes("ALL")
          ? allIds
          : ["ALL", ...allIds];

        setAccounts(orderedAccounts);

        // 6️⃣ Tag Data (Already filtered from backend)
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

        // 7️⃣ Apps
        const appList =
          costJson?.top_5?.top_apps_current_month?.map((a) => a.app_name) ||
          [];
        setApps(appList);

        // 8️⃣ Tag Summary
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

        // 9️⃣ Set All Final Data
        setTagData(processedTagData);
        setTagSummary(summary);
        setCostData(costJson);
        setResourcesData(resourcesJson);
      } catch (err) {
        logError("fetchAllData", err);
        const message = getErrorMessage("Unable to load cost data.", err);
        setError(message);
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
        treeData,
        setTreeData,
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
