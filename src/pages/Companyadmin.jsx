import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Check, X, Search, Filter } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";


const Companyadmin = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();


  // 🔹 Fetch cost accounts dynamically
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);

        const cid = localStorage.getItem("company_cid");
        if (!cid) throw new Error("Company ID not found. Please log in again.");

        const response = await fetch(`http://13.212.15.14:8006/api/accounts/all/${cid}`);
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Failed to fetch accounts");

        // ✅ Dynamically merge all pillar accounts
        const pillarKeys = Object.keys(result).filter((key) => key.endsWith("accounts"));

      const allAccounts = pillarKeys.flatMap((pillarKey) => {
  const accounts = result[pillarKey] || [];

  return accounts.map((item, index) => {
    const type = item.account_type || "unknown"; // e.g., "cost", "security", etc.

    return {
      cid: result.cid || index + 1,
      account_id: item.account_id || "Nill",
      account_name: item.account_name || "Nill",
      access_key: item.access_key || "Nill",
      secret_key: item.secret_key || "Nill",
      bucket_name: item.bucket_name || "Nill",
      prefix: item.prefix || "Nill",
      pillars: {
        cost: type === "cost",
        security: type === "security",
        operational_excellence: type === "operational_excellence",
        performance: type === "performance",
      },
      status: "approved",
    };
  });
});


        setAccounts(allAccounts);
      } catch (err) {
        console.error("Fetch Accounts Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);


  // ---------- Derived Stats ----------
  const stats = useMemo(() => {
    const total = accounts.length;
    const pending = accounts.filter((a) => a.status === "pending").length;
    const approved = accounts.filter((a) => a.status === "approved").length;
    const rejected = accounts.filter((a) => a.status === "rejected").length;
    return {
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
    };
  }, [accounts]);

  // ---------- Filtered Accounts ----------
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch =
        acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.account_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.bucket_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || acc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accounts, searchQuery, statusFilter]);

  // ---------- Handlers ----------
  const handleEdit = (acc) => {
    setEditingId(acc.cid);
    setEditData({ ...acc });
  };

  const handleSave = () => {
    setAccounts(
      accounts.map((acc) => (acc.cid === editingId ? editData : acc))
    );
    setEditingId(null);
  };

  const handleDelete = (cid) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      setAccounts(accounts.filter((acc) => acc.cid !== cid));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-0">
      {/* ---------- Header ---------- */}

      {/* ---------- Headers ---------- */}
      <div className="px-0 py-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Account Management
            </h1>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, account, or bucket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <button
                onClick={() => navigate('/imsproduct/accounts')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-all duration-200"
              >
                <Plus size={18} />
                Add Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Table ---------- */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading accounts...</div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">Error: {error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "CID",
                  "Account ID",
                  "Account Name",
                  "Access Key",
                  "Secret Key",
                  "Bucket Name",
                  "Prefix",
                  "Pillars",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAccounts.map((acc) => (
                <tr key={acc.cid} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{acc.cid}</td>
                  <td className="px-4 py-3">{acc.account_id}</td>
                  <td className="px-4 py-3">{acc.account_name}</td>
                  <td className="px-4 py-3">{acc.access_key}</td>
                  <td className="px-4 py-3">••••••••</td>
                  <td className="px-4 py-3">{acc.bucket_name}</td>
                  <td className="px-4 py-3">{acc.prefix}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(acc.pillars)
                        .filter(([_, value]) => value)
                        .map(([pillar]) => (
                          <span
                            key={pillar}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {pillar}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${acc.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : acc.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {acc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {editingId === acc.cid ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(acc)}
                          className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.cid)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && filteredAccounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No accounts match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Companyadmin;


