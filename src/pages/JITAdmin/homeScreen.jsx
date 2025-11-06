import React, { useState, useMemo, useEffect, useContext } from "react";
import { Plus, Edit, Trash2, Check, X, Search, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CostContext } from "../../Context/CostContext"; // ✅ Import context

const Admin = () => {
  const navigate = useNavigate();
  const { getAllCompanies, loading, error } = useContext(CostContext);

  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // ✅ Fetch data from API
  useEffect(() => {
    const fetchCompanies = async () => {
      const result = await getAllCompanies();

      // ✅ Handle API format correctly
      const companyList = result?.companies || [];

      if (Array.isArray(companyList)) {
        const formatted = companyList.map((item, index) => ({
          cid: item.cid || index + 1,
          company_id: `C${item.cid || index + 1}`,
          company_name: item.company_name || "N/A",
          admin_name: item.admin_name || "N/A", // ✅ ADD THIS LINE
          mail_id: item.email || "N/A",
          password: "Test@1234", // 🔐 password shouldn't come from backend
          features: {
            cost: !!item.cost,
            security: !!item.security,
            operational_excellence: !!item.operational_excellence,
            performance: !!item.performance,
          },
          status: "active",
        }));


        setAccounts(formatted);
      }
    };

    fetchCompanies();
    setTimeout((

    ) => { fetchCompanies() }, 2000);

  }, [getAllCompanies]);




  // 🔍 Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const q = searchQuery.toLowerCase();
      return (
        acc.company_id.toLowerCase().includes(q) ||
        acc.company_name.toLowerCase().includes(q) ||
        acc.mail_id.toLowerCase().includes(q)
      );
    });
  }, [accounts, searchQuery]);

  // ✏️ Edit Handlers
  const handleEdit = (acc) => {
    setEditingId(acc.cid);
    setEditData({ ...acc });
  };

  const handleSave = () => {
    setAccounts(accounts.map((acc) => (acc.cid === editingId ? editData : acc)));
    setEditingId(null);
  };

  const handleDelete = async (cid) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;

    try {
      const response = await fetch(`http://13.212.15.14:8006/api/company/delete/${cid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete (status: ${response.status})`);
      }

      // ✅ Remove locally after successful deletion
      setAccounts((prev) => prev.filter((acc) => acc.cid !== cid));

      // alert("✅ Company deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Failed to delete company. Please try again.");
    }
  };


  const handleStatusToggle = (cid) => {
    setAccounts(
      accounts.map((acc) =>
        acc.cid === cid
          ? { ...acc, status: acc.status === "active" ? "inactive" : "active" }
          : acc
      )
    );
  };

  const handleFeatureToggle = (feature) => {
    setEditData((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: !prev.features[feature] },
    }));
  };

  const togglePasswordVisibility = (cid) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [cid]: !prev[cid],
    }));
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gray-100 p-0">
      {/* Header */}
      <div className="px-0 py-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 ">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Company Management
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-end gap-4 w-full">
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by ID, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-sm font-normal focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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



      {/* Loading / Error */}
      {loading && (
        <div className="text-center text-gray-500 py-8">Loading companies...</div>
      )}
      {error && (
        <div className="text-center text-red-500 py-8">
          Failed to load companies: {error}
        </div>
      )}

      {/* Accounts Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Company ID",
                  "Company Name",
                  "Mail ID",
                  "Password",
                  "Features",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredAccounts.map((acc) => (

                <tr key={acc.cid} className="hover:bg-gray-50">
                  {/* Company ID */}
                  {console.log('filteredAccounts', filteredAccounts)}
                  <td className="px-4 py-3">{acc.company_id}</td>

                  {/* Company Name */}
                  <td className="px-4 py-3">
                    {editingId === acc.cid ? (
                      <input
                        type="text"
                        value={editData.company_name}
                        onChange={(e) =>
                          setEditData({ ...editData, company_name: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      acc.company_name
                    )}
                  </td>

                  {/* Mail ID */}
                  <td className="px-4 py-3">
                    {editingId === acc.cid ? (
                      <input
                        type="email"
                        value={editData.mail_id}
                        onChange={(e) =>
                          setEditData({ ...editData, mail_id: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full !text-green-800" />
                    ) : (
                      acc.mail_id
                    )}
                  </td>

                  {/* Password */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {editingId === acc.cid ? (
                        <input
                          type={visiblePasswords[acc.cid] ? "text" : "password"}
                          value={editData.password}
                          onChange={(e) =>
                            setEditData({ ...editData, password: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <span>
                          {visiblePasswords[acc.cid]
                            ? acc.password
                            : "••••••••"}
                        </span>
                      )}
                      <button
                        onClick={() => togglePasswordVisibility(acc.cid)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {visiblePasswords[acc.cid] ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Features */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(
                        editingId === acc.cid ? editData.features : acc.features
                      ).map(([feature, value]) => (
                        <button
                          key={feature}
                          onClick={
                            editingId === acc.cid
                              ? () => handleFeatureToggle(feature)
                              : undefined
                          }
                          className={`px-2 py-1 rounded text-xs font-medium ${value
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-600"
                            }`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStatusToggle(acc.cid)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${acc.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {acc.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 space-x-2">
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
                          onClick={() => navigate("/admin/edit", { state: { company: acc } })}
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

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No accounts match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
