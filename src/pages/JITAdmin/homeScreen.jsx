// src/pages/Admin/Admin.jsx
import React, { useState, useMemo, useEffect, useContext } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CostContext } from "../../Context/CostContext";
import { Modal } from "antd";

const { confirm } = Modal;

const statusClassMap = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
};

const Admin = () => {
  const navigate = useNavigate();
  const { getAllCompanies, loading, error } = useContext(CostContext);

  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL1;
      let jwt_token = localStorage.getItem("jwt_token");

  // ✅ Fetch data from API
  useEffect(() => {
    if (!apiBaseUrl && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "apiBaseUrl is empty — check environment variables (VITE_API_BASE_URL1/VITE_API_BASE_URL)"
      );
    }
  }, [apiBaseUrl]);

  // fetch companies
  useEffect(() => {
    let mounted = true;

    const fetchCompanies = async () => {
      try {
        const result = await getAllCompanies();
        // result may be an array or an object containing companies
        const companyList = Array.isArray(result)
          ? result
          : result?.companies ?? result?.data ?? [];

        if (!Array.isArray(companyList)) {
          // defensively convert to empty array
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.warn("getAllCompanies returned unexpected shape:", result);
          }
        }

        if (Array.isArray(companyList) && mounted) {
          const formatted = companyList.map((item, index) => ({
            cid: item.cid ?? index + 1,
            company_id: `C${item.cid ?? index + 1}`,
            company_name: item.company_name ?? item.name ?? "N/A",
            admin_name: item.admin_name ?? item.admin ?? "N/A",
            mail_id: item.email ?? item.mail_id ?? "N/A",
            // placeholder: do not show or store real passwords in UI
            password: item.password_placeholder ?? "••••••••",
            features: {
              cost: !!item.cost,
              security: !!item.security,
              operational_excellence: !!item.operational_excellence,
              performance: !!item.performance,
            },
            status: (item.status ?? "active").toString().toLowerCase(),
          }));

          setAccounts(formatted);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch companies:", err);
      }
    };

    fetchCompanies();

    return () => {
      mounted = false;
    };
  }, [getAllCompanies]);

  const filteredAccounts = useMemo(() => {
    const q = (searchQuery ?? "").toString().toLowerCase().trim();
    if (!q) return accounts;
    return accounts.filter((acc) => {
      return (
        (acc.company_id ?? "").toLowerCase().includes(q) ||
        (acc.company_name ?? "").toLowerCase().includes(q) ||
        (acc.mail_id ?? "").toLowerCase().includes(q)
      );
    });
  }, [accounts, searchQuery]);

  const togglePasswordVisibility = (cid) => {
    setVisiblePasswords((prev) => ({ ...prev, [cid]: !prev[cid] }));
  };

  const handleNavigateToEdit = (acc) => {
    // Navigate to edit page; keep state minimal
    navigate("/admin/edit", { state: { company: acc } });
  };

  const handleDelete = (cid) => {
    confirm({
      title: "Delete company?",
      content: "Are you sure you want to delete this company? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          if (!apiBaseUrl) {
            throw new Error("API base URL is not configured.");
          }

    try {
      const response = await fetch(`${apiBaseUrl}/api/company/delete/${cid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt_token}`,
        },
      });

          if (!resp.ok) {
            const text = await resp.text().catch(() => "");
            throw new Error(`Delete failed (status: ${resp.status}) ${text}`);
          }

          // remove locally
          setAccounts((prev) => prev.filter((acc) => acc.cid !== cid));
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("Delete error:", err);
          // small fallback alert for now — replace with toast/snackbar integration if available
          window.alert("❌ Failed to delete company. Please try again.");
        }
      },
    });
  };

  const handleStatusToggle = (cid) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.cid === cid ? { ...acc, status: acc.status === "active" ? "inactive" : "active" } : acc
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-0">
      <div className="px-0 py-4 mb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 ">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Company Management</h1>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-[250px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by ID, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <button
                onClick={() => navigate("/admin/register")}
                className="py-2.5 px-5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus size={18} className="inline mr-1 mb-0.5" />
                Create Company Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-center text-gray-500 py-8">Loading companies...</div>}
      {error && <div className="text-center text-red-500 py-8">Failed to load companies: {error}</div>}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Company ID", "Company Name", "Mail ID", "Password", "Features", "Status", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredAccounts.map((acc) => {
                const normalizedStatus = (acc.status || "inactive").toLowerCase();
                const statusClass = statusClassMap[normalizedStatus] ?? "bg-gray-100 text-gray-700";

                return (
                  <tr key={acc.cid} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{acc.company_id}</td>

                    <td className="px-4 py-3">{acc.company_name}</td>

                    <td className="px-4 py-3">{acc.mail_id}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span>{visiblePasswords[acc.cid] ? acc.password : "••••••••"}</span>
                        <button onClick={() => togglePasswordVisibility(acc.cid)} className="text-gray-600 hover:text-gray-800" aria-label={`toggle-password-${acc.cid}`}>
                          {visiblePasswords[acc.cid] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(acc.features ?? {}).map(([feature, value]) => (
                          <div
                            key={feature}
                            className={`px-2 py-1 rounded text-xs font-medium ${value ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}
                          >
                            {feature}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleStatusToggle(acc.cid)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                      >
                        {acc.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-2 py-2 sm:px-3 md:px-4 md:py-3 lg:px-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleNavigateToEdit(acc)}
                          className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                          aria-label={`edit-${acc.cid}`}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(acc.cid)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          aria-label={`delete-${acc.cid}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAccounts.length === 0 && <div className="text-center py-8 text-gray-500">No accounts match your search.</div>}
        </div>
      )}
    </div>
  );
};

export default Admin;
