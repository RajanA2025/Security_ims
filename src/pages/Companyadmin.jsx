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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);



  // 🔹 Fetch cost accounts dynamically
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);

        const cid = localStorage.getItem("company_cid");
        if (!cid) throw new Error("Company ID not found. Please log in again.");

        const response = await fetch(`http://13.212.15.14:8016/api/account/all`);
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Failed to fetch accounts");

        // ✅ Dynamically merge all pillar accounts
        const pillarKeys = Object.keys(result).filter((key) => key.endsWith("accounts"));


        const allAccounts = pillarKeys.flatMap((pillarKey) => {
          const accounts = result[pillarKey] || [];

          return accounts.map((item) => ({
            cid: item.cid,
            account_id: item.account_id,
            account_name: item.account_name,
            access_key: item.access_key,
            secret_key: item.secret_key,
            bucket_name: item.bucket_name,
            prefix: item.prefix,
            pillars: {
              cost: item.cost,
              security: item.security,
              perfops: item.perfops
            },
            status: "approved"
          }));
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
    // Save account data to localStorage for editing
    localStorage.setItem("edit_account", JSON.stringify(acc));
    navigate("/imsproduct/accounts"); // same page as add form
  };

  const handleSave = () => {
    setAccounts(
      accounts.map((acc) => (acc.cid === editingId ? editData : acc))
    );
    setEditingId(null);
  };

  const deleteEntireAccount = async () => {
    try {
      await axios.delete(`http://13.212.15.14:8016/api/account/delete`, {
        data: {
          cid: selectedAccount.cid,
          account_id: selectedAccount.account_id,
          account_name: selectedAccount.account_name,
          access_key: selectedAccount.access_key,
          secret_key: selectedAccount.secret_key,
          bucket_name: selectedAccount.bucket_name,
          prefix: selectedAccount.prefix,
          cost: selectedAccount.pillars.cost,
          security: selectedAccount.pillars.security,
          perfops: selectedAccount.pillars.perfops
        }
      });

      setAccounts(accounts.filter(a => a.account_id !== selectedAccount.account_id));
    } catch (err) {
      console.error("Delete Entire Account Error:", err);
    } finally {
      setShowDeleteModal(false);
    }
  };



  const deletePillar = async (pillarType) => {
    try {
      await axios.delete(`http://13.212.15.14:8016/api/account/delete`, {
        data: {
          cid: selectedAccount.cid,
          account_id: selectedAccount.account_id,
          account_name: selectedAccount.account_name,
          access_key: selectedAccount.access_key,
          secret_key: selectedAccount.secret_key,
          bucket_name: selectedAccount.bucket_name,
          prefix: selectedAccount.prefix,
          cost: pillarType === "cost" ? false : selectedAccount.pillars.cost,
          security: pillarType === "security" ? false : selectedAccount.pillars.security,
          perfops: pillarType === "perfops" ? false : selectedAccount.pillars.perfops
        }
      });

      setAccounts(accounts.map(a => {
        if (a.account_id === selectedAccount.account_id) {
          return {
            ...a,
            pillars: { ...a.pillars, [pillarType]: false }
          };
        }
        return a;
      }));

    } catch (err) {
      console.error("Delete Pillar Error:", err);
    } finally {
      setShowDeleteModal(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 p-0">
      {/* ---------- Header ---------- */}

      {/* ---------- Headers ---------- */}
      <div className="px-0 py-4 mb-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
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
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-50">
              <tr>
                {[
                  // "CID",
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
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAccounts.map((acc) => (
                <tr key={acc.cid} className="hover:bg-gray-50">
                  {/* <td className="px-4 py-3">{acc.cid}</td> */}
                  <td className="px-4 py-3">{acc.account_id}</td>
                  <td className="px-4 py-3">{acc.account_name}</td>
                  <td className="px-4 py-3">{acc.access_key}</td>
                  <td className="px-4 py-3">••••••••</td>
                  <td className="px-4 py-3">{acc.bucket_name || "Nil"}</td>
                  <td className="px-4 py-3">{acc.prefix || "Nil"}</td>
                  <td className="px-4 py-3">
                    <div className="flex  justify-center flex-wrap gap-1">
                      {Object.entries(acc.pillars)
                        .filter(([_, value]) => value)
                        .map(([pillar]) => {
                          const PillarNames = {
                            cost: "Cost",
                            security: "Security",
                            perfops: "operational & performance"
                          };

                          return (
                            <span
                              key={pillar}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize"
                            >
                              {PillarNames[pillar] || pillar}
                            </span>
                          );
                        })}

                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
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
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
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
                          onClick={() => {
                            setSelectedAccount(acc);
                            setShowDeleteModal(true);
                          }}
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


      {showDeleteModal && selectedAccount && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80">
            <h3 className="text-lg font-semibold text-gray-800">
              Are you sure you want to delete this account?
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              This action is permanent and cannot be undone.
            </p>

            <button
              onClick={deleteEntireAccount}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Yes, Delete Account
            </button>

            <button
              onClick={() => setShowDeleteModal(false)}
              className="w-full mt-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>

      )}


    </div>
  );
};

export default Companyadmin;


