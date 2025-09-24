import React, { createContext, useState, useEffect } from "react";

export const CostContext = createContext();

export const CostProvider = ({ children }) => {
  const [costData, setCostData] = useState(null);
  const [resourcesData, setResourcesData] = useState(null);
  const [tagData, setTagData] = useState([]);
  const [tagSummary, setTagSummary] = useState({
    fully_tagged: 0,
    partially_tagged: 0,
    not_tagged: 0,
    total_resources: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    account_id: null, // null = all accounts
    app: null,
    start_date: null,
    end_date: null,
  });
  console.log("filters", filters);

  // Accounts & Apps for filters
  const [accounts, setAccounts] = useState([]);
  const [apps, setApps] = useState([]);

  const [Current_acc, setCurrent_acc] = useState();

  useEffect(() => {
    const account = localStorage.getItem("current_acc");
    setCurrent_acc(account);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 🔹 Build query param URL correctly
     const { account_id, start_date, end_date } = filters;

const params = new URLSearchParams();

// Only add if value exists
if (account_id && account_id !== "ALL") params.append("account_id", account_id);
if (start_date) params.append("start_date", start_date);
if (end_date) params.append("end_date", end_date);

const costUrl = `http://13.212.15.14:8010/cost-summary?${params.toString()}`;

        const [costRes, resourcesRes, tagRes] = await Promise.all([
          fetch(costUrl),
            fetch("http://13.212.15.14:8003/resources"),
          fetch("http://13.212.15.14:8007/tags"),
        ]);

        if (!costRes.ok || !resourcesRes.ok || !tagRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const costJson = await costRes.json();
        const resourcesJson = await resourcesRes.json();
        const tagsJson = await tagRes.json();

        // Accounts & Apps
        const accountList = costJson?.all_account_ids || [];
        const orderedAccounts = accountList.includes("ALL")
          ? accountList
          : ["ALL", ...accountList];
        const appList =
          costJson?.top_5?.top_apps_current_month?.map((a) => a.app_name) || [];

        setAccounts(orderedAccounts);
        setApps(appList);

        // Tag data processing
        const processedTagData = Array.isArray(tagsJson)
          ? tagsJson.map((resource, index) => ({
              id: resource.id || index + 1,
              account: resource.account || "",
              region: resource.region || "",
              service: resource.service || "",
              resource: resource.resource || "",
              tags: resource.tags || {},
            }))
          : [];

        const requiredTags = ["Name", "Owner", "Project", "Environment"];
        const summary = {
          fully_tagged: 0,
          partially_tagged: 0,
          not_tagged: 0,
          total_resources: processedTagData.length,
        };

        processedTagData.forEach((res) => {
          const tags = res.tags;
          const matched = requiredTags.filter(
            (tag) =>
              tags[tag] !== null &&
              tags[tag] !== "" &&
              tags[tag] !== undefined
          ).length;

          if (matched === requiredTags.length) summary.fully_tagged++;
          else if (matched > 0) summary.partially_tagged++;
          else summary.not_tagged++;
        });

        setCostData(costJson);
        setResourcesData(resourcesJson);
        setTagData(processedTagData);
        setTagSummary(summary);
      } catch (err) {
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
      }}
    >
      {children}
    </CostContext.Provider>
  );
};
