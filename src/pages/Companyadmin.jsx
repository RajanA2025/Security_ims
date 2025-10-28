import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Check, X, Search, Filter } from "lucide-react";

const Companyadmin = () => {
  // ---------- Initial Data ----------
  const [accounts, setAccounts] = useState([
    {
      cid: 1,
      account_id: "ACC001",
      account_name: "Main AWS Account",
      access_key: "AKIA123456",
      secret_key: "SECRET123456",
      bucket_name: "company-bucket",
      prefix: "prod/",
      pillars: {
        cost: true,
        security: true,
        operational_excellence: false,
        performance: true,
      },
      status: "approved",
    },
    {
      cid: 2,
      account_id: "ACC002",
      account_name: "Dev Account",
      access_key: "AKIA987654",
      secret_key: "SECRET987654",
      bucket_name: "dev-bucket",
      prefix: "test/",
      pillars: {
        cost: false,
        security: true,
        operational_excellence: true,
        performance: false,
      },
      status: "pending",
    },
  ]);

  const [newAccount, setNewAccount] = useState({
    cid: 0,
    account_id: "",
    account_name: "",
    access_key: "",
    secret_key: "",
    bucket_name: "",
    prefix: "",
    pillars: {
      cost: false,
      security: false,
      operational_excellence: false,
      performance: false,
    },
    status: "pending",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
  const handleAddAccount = () => {
    if (!newAccount.account_id || !newAccount.account_name) {
      alert("Please fill required fields");
      return;
    }
    const newEntry = {
      ...newAccount,
      cid: accounts.length + 1,
    };
    setAccounts([...accounts, newEntry]);
    setNewAccount({
      cid: 0,
      account_id: "",
      account_name: "",
      access_key: "",
      secret_key: "",
      bucket_name: "",
      prefix: "",
      pillars: {
        cost: false,
        security: false,
        operational_excellence: false,
        performance: false,
      },
      status: "pending",
    });
  };

  const handleDelete = (cid) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      setAccounts(accounts.filter((acc) => acc.cid !== cid));
    }
  };

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

  const handlePillarToggle = (pillar) => {
    setEditData((prev) => ({
      ...prev,
      pillars: { ...prev.pillars, [pillar]: !prev.pillars[pillar] },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ---------- Header ---------- */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Account Management
      </h1>

      {/* ---------- Stats Cards ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500">Total Accounts</p>
          <p className="text-2xl font-bold text-gray-800">
            {stats.totalRequests}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pendingRequests}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.approvedRequests}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {stats.rejectedRequests}
          </p>
        </div>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
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

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
            </div>
            <div className="flex space-x-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? status === "approved"
                        ? "bg-green-600 text-white"
                        : status === "pending"
                        ? "bg-yellow-600 text-white"
                        : status === "rejected"
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Add Account Form ---------- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <Plus size={18} className="mr-2 text-blue-600" /> Add New Account
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Account ID"
            value={newAccount.account_id}
            onChange={(e) =>
              setNewAccount({ ...newAccount, account_id: e.target.value })
            }
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Account Name"
            value={newAccount.account_name}
            onChange={(e) =>
              setNewAccount({ ...newAccount, account_name: e.target.value })
            }
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleAddAccount}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Add Account
          </button>
        </div>
      </div>

      {/* ---------- Table ---------- */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
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
                <td className="px-4 py-3">
                  {editingId === acc.cid ? (
                    <input
                      type="text"
                      value={editData.account_id}
                      onChange={(e) =>
                        setEditData({ ...editData, account_id: e.target.value })
                      }
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    acc.account_id
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === acc.cid ? (
                    <input
                      type="text"
                      value={editData.account_name}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          account_name: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    acc.account_name
                  )}
                </td>
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
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      acc.status === "approved"
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

        {filteredAccounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No accounts match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Companyadmin;
