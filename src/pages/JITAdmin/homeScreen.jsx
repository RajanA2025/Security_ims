import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Check, X, Search, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigation

const Admin = () => {
  const navigate = useNavigate();

  // ---------- Initial Data ----------
  const [accounts, setAccounts] = useState([
    {
      cid: 1,
      company_id: "C001",
      company_name: "Tony Stark Industries",
      mail_id: "tony.stark@stark.com",
      password: "Tony@123456",
      features: {
        cost: true,
        security: true,
        operational_excellence: false,
        performance: true,
      },
      status: "active",
    },
    {
      cid: 2,
      company_id: "C002",
      company_name: "Dev Solutions",
      mail_id: "dev@company.com",
      password: "Dev@2024",
      features: {
        cost: false,
        security: true,
        operational_excellence: true,
        performance: false,
      },
      status: "inactive",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // ---------- Filtered Accounts ----------
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

  // ---------- Handlers ----------
  const handleEdit = (acc) => {
    setEditingId(acc.cid);
    setEditData({ ...acc });
  };

  const handleSave = () => {
    setAccounts(accounts.map((acc) => (acc.cid === editingId ? editData : acc)));
    setEditingId(null);
  };

  const handleDelete = (cid) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      setAccounts(accounts.filter((acc) => acc.cid !== cid));
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
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Company Account Management
        </h1>

        {/* ✅ Create Company Admin Button (same style as Login button) */}
        <button
          onClick={() => navigate("/admin/RegistrationForm")}
          className="py-2.5 px-5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus size={18} className="inline mr-1 mb-0.5" />
          Create Company Admin
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 w-full flex justify-start">
        <div className="relative w-[350px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search company by ID, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Accounts Table */}
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
                      className="border rounded px-2 py-1 w-full"
                    />
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

                {/* CRUD Actions */}
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

        {filteredAccounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No accounts match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
