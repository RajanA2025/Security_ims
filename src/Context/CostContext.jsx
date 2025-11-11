import React, { createContext, useState, useEffect, useRef } from "react";

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

  const [accounts, setAccounts] = useState([]);
  const [apps, setApps] = useState([]);
  const [Current_acc, setCurrent_acc] = useState();

  // 🔸 To prevent duplicate API calls
  const hasFetchedCompanies = useRef(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL1;

  useEffect(() => {
    const account = localStorage.getItem("current_acc");
    setCurrent_acc(account);
  }, []);

  // 🔹 Register new company
  const registerCompany = async (companyData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBaseUrl}/api/company/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyData),
      });
      return await response.json();
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message);
      return { error: "Network Error" };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Login company
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
      localStorage.setItem("auth_token", true);
      // Some backends may return 200 without a token. Treat any successful login (200)
      // as authenticated: store the token if provided, otherwise store a boolean flag.
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

  // 🔹 Add account
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

  // 🔹 Get all companies (fixed)
  const getAllCompanies = async (forceRefresh = false) => {
    // Prevent infinite loop fetches
    if (hasFetchedCompanies.current && !forceRefresh) {
      console.log("✅ Using cached company list");
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
      hasFetchedCompanies.current = true; // ✅ mark as fetched
      return result;
    } catch (err) {
      console.error("Get All Companies Error:", err);
      setError(err.message);
      return { error: err.message || "Network Error" };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get all accounts for a specific company
  const getAllAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔸 Get the company CID dynamically from localStorage
      const cid = localStorage.getItem("company_cid");
      if (!cid) throw new Error("Company ID not found. Please log in again.");

      // 🔸 Dynamic endpoint using template literal
      const response = await fetch(`${apiBaseUrl}/api/accounts/all/${cid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`, // optional if backend needs token
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



  // 🔹 Fetch cost & tag data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Retrieve filters and localStorage account IDs
        const { account_id, start_date, end_date } = filters;
        const accountIds = JSON.parse(localStorage.getItem("account_ids")) || [];

        // Prepare POST body
        const postBody = {
          account_ids: account_id && account_id !== "ALL" ? [account_id] : accountIds,
          start_date: start_date || "",
          end_date: end_date || "",
        };

        console.log("🔹 Sending POST body:", postBody);

        // POST request instead of GET
        const costUrl = `http://47.130.218.97:8021/cost-summary`;

        const [costRes, resourcesRes, tagRes] = await Promise.all([
          fetch(costUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
          }),
          fetch("http://47.130.218.97:8003/resources"),
          fetch("http://47.130.218.97:8007/tags"),
        ]);

        if (!costRes.ok || !resourcesRes.ok || !tagRes.ok)
          throw new Error("Failed to fetch data");

        const costJson = await costRes.json();
        const resourcesJson = await resourcesRes.json();
        const tagsJson = await tagRes.json();

        // Build account list
        const accountList = costJson?.all_account_ids || [];
        console.log("🔹 Fetched account IDs:", accountList);
        const orderedAccounts = accountList.includes("ALL")
          ? accountList
          : ["ALL", ...accountList];

        const appList =
          costJson?.top_5?.top_apps_current_month?.map((a) => a.app_name) || [];

        setAccounts(orderedAccounts);
        setApps(appList);

        // Process tags
        // Get selected account from filters or localStorage
        // const selectedAcc = filters.account_id || localStorage.getItem("account_ids");

        // Process + Filter tags by selected account
        let processedTagData = Array.isArray(tagsJson)
          ? tagsJson.map((res, i) => ({
            id: res.id || i + 1,
            account_name: res.account_name || "",
            account_id: res.account_id || "",
            region: res.region || "",
            service: res.service || "",
            resource: res.resource || "",
            tags: res.tags || {},
          }))
          : [];

        // Apply filter only if selectedAcc exists and is not ALL
        const storedIds = JSON.parse(localStorage.getItem("account_ids")) || [];

        const selectedAcc =
          filters.account_id && filters.account_id !== "ALL"
            ? filters.account_id
            : storedIds[0] || null;

        if (selectedAcc) {
          processedTagData = processedTagData.filter(
            (item) => String(item.account_id) === String(selectedAcc)
          );
        }



        // Compute tagging summary
        const requiredTags = ["Name", "Owner", "Project", "Environment"];
        const summary = {
          fully_tagged: 0,
          partially_tagged: 0,
          not_tagged: 0,
          total_resources: processedTagData.length,
        };

        processedTagData.forEach((res) => {
          const matched = requiredTags.filter(
            (t) => res.tags[t] !== null && res.tags[t] !== "" && res.tags[t] !== undefined
          ).length;

          if (matched === requiredTags.length) summary.fully_tagged++;
          else if (matched > 0) summary.partially_tagged++;
          else summary.not_tagged++;
        });

        // Set final states
        setCostData(costJson);
        setResourcesData(resourcesJson);
        setTagData(processedTagData);
        setTagSummary(summary);

      } catch (err) {
        console.error("❌ Fetch error:", err);
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
        registerCompany,
        loginCompany,
        addAccount,
        getAllCompanies,
        companies,
        getAllAccounts
      }}
    >
      {children}
    </CostContext.Provider>
  );
};
