import React, { useState, useEffect, useCallback, useContext, memo } from "react";
import { useNavigate } from 'react-router-dom';

import { Plus, Minus } from "lucide-react";
import { CostContext } from "../../Context/CostContext";

const InputField = memo(({ label, value, onChange, type = "text", placeholder, error, readOnly }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label} {label !== "Company CID" && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${error ? "border-red-500" : "border-gray-300"
        } ${readOnly ? "bg-gray-200 text-gray-500" : "bg-white"}`}
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
));

const PillarDropdown = memo(({ pillars, selected, onChange, error }) => {
  // ✅ Combine operational_excellence & performance into one button
  const available = [
    { key: "cost", label: "Cost" },
    { key: "security", label: "Security" },
    { key: "operational_performance", label: "Operational & Performance" },
  ].filter((item) => {
    if (item.key === "operational_performance") {
      return pillars?.operational_excellence || pillars?.performance;
    }
    return pillars?.[item.key];
  });

  const toggle = useCallback(
    (pillarKey) => {
      let updated = [...selected];

      if (pillarKey === "operational_performance") {
        // ✅ Toggle both operational_excellence & performance together
        const hasBoth =
          selected.includes("operational_excellence") &&
          selected.includes("performance");

        updated = hasBoth
          ? selected.filter(
              (p) => p !== "operational_excellence" && p !== "performance"
            )
          : [...selected, "operational_excellence", "performance"];
      } else {
        updated = selected.includes(pillarKey)
          ? selected.filter((p) => p !== pillarKey)
          : [...selected, pillarKey];
      }

      onChange(updated);
    },
    [selected, onChange]
  );

  const isActive = (pillarKey) => {
    if (pillarKey === "operational_performance") {
      return (
        selected.includes("operational_excellence") &&
        selected.includes("performance")
      );
    }
    return selected.includes(pillarKey);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        Select Pillars (Multiple) <span className="text-red-500">*</span>
      </label>

      <div
        className={`flex flex-wrap gap-2 p-2 border rounded-lg transition ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        {available.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No available pillars.</p>
        ) : (
          available.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                isActive(item.key)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
});




const AccountCard = memo(({ index, acc, errors, updateAccount, removeAccount, canRemove }) => {
  const handleChange = useCallback(
    (field, value) => updateAccount(index, field, value),
    [index, updateAccount]
  );

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-medium text-gray-700">Account {index + 1}</h3>
        {canRemove && (
          <button
            onClick={() => removeAccount(index)}
            className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
          >
            <Minus size={14} />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InputField label="Company CID" value={acc.cid} onChange={() => { }} readOnly />
        <InputField
          label="Account ID"
          value={acc.accountId}
          onChange={(v) => handleChange("accountId", v)}
          error={errors[`accountId_${index}`]}
          placeholder="Enter account ID"
        />
        <InputField
          label="Account Name"
          value={acc.accountName}
          onChange={(v) => handleChange("accountName", v)}
          error={errors[`accountName_${index}`]}
          placeholder="Enter account name"
        />
        <InputField
          label="Access Key"
          value={acc.accessKey}
          onChange={(v) => handleChange("accessKey", v)}
          error={errors[`accessKey_${index}`]}
          placeholder="Enter access key"
        />
        <InputField
          label="Secret Key"
          type="password"
          value={acc.secretKey}
          onChange={(v) => handleChange("secretKey", v)}
          error={errors[`secretKey_${index}`]}
          placeholder="Enter secret key"
        />
        <InputField
          label="Bucket Name"
          value={acc.bucketName}
          onChange={(v) => handleChange("bucketName", v)}
          placeholder="Enter bucket name"
        />
        <InputField
          label="Prefix"
          value={acc.prefix}
          onChange={(v) => handleChange("prefix", v)}
          placeholder="Enter prefix (e.g., data/)"
        />
        <PillarDropdown
          pillars={acc.pillars}
          selected={acc.selectedPillars}
          onChange={(v) => handleChange("selectedPillars", v)}
          error={errors[`pillars_${index}`]} // ✅ Pass error
        />
      </div>
    </div>
  );
});

export default function AccountsScreen() {
  const { addAccount } = useContext(CostContext);
  const [formData, setFormData] = useState({
    accounts: [
      {
        cid: "",
        accountId: "",
        accountName: "",
        accessKey: "",
        secretKey: "",
        bucketName: "",
        prefix: "",
        pillars: {},
        selectedPillars: [],
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCid = localStorage.getItem("company_cid");
    const storedPillars = JSON.parse(localStorage.getItem("pillars")) || {};
    if (storedCid) {
      setFormData((prev) => ({
        ...prev,
        accounts: prev.accounts.map((acc, i) =>
          i === 0 ? { ...acc, cid: storedCid, pillars: storedPillars } : acc
        ),
      }));
    }
  }, []);

  const updateAccount = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updatedAccounts = [...prev.accounts];
      updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
      return { ...prev, accounts: updatedAccounts };
    });
  }, []);

  const handleAddAccount = useCallback(() => {
    const storedCid = localStorage.getItem("company_cid") || "";
    const storedPillars = JSON.parse(localStorage.getItem("pillars")) || {
      cost: false,
      security: false,
      operational_excellence: false,
      performance: false,
    };

    setFormData((prev) => ({
      ...prev,
      accounts: [
        ...prev.accounts,
        {
          cid: storedCid,
          accountId: "",
          accountName: "",
          accessKey: "",
          secretKey: "",
          bucketName: "",
          prefix: "",
          pillars: storedPillars,
          selectedPillars: [],
        },
      ],
    }));
  }, []);

  const removeAccount = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((_, i) => i !== index),
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    formData.accounts.forEach((acc, i) => {
      if (!acc.accountId.trim()) newErrors[`accountId_${i}`] = "Account ID required";
      if (!acc.accountName.trim()) newErrors[`accountName_${i}`] = "Account name required";
      if (!acc.accessKey.trim()) newErrors[`accessKey_${i}`] = "Access key required";
      if (!acc.secretKey.trim()) newErrors[`secretKey_${i}`] = "Secret key required";

      // ✅ Require at least one pillar to be selected
      if (!acc.selectedPillars || acc.selectedPillars.length === 0) {
        newErrors[`pillars_${i}`] = "Select at least one pillar";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);


  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      setToast({ type: "error", message: "Please fill all required fields." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const payload = {
        accounts: formData.accounts.map((acc) => {
          const selectedPillarsObj = {};
          acc.selectedPillars.forEach((pillar) => {
            selectedPillarsObj[pillar] = true;
          });

          return {
            cid: acc.cid || 0,
            account_id: acc.accountId,
            account_name: acc.accountName,
            access_key: acc.accessKey,
            secret_key: acc.secretKey,
            bucket_name: acc.bucketName,
            prefix: acc.prefix,
            pillars: selectedPillarsObj,
          };
        }),
      };

      console.log("📦 Sending Payload:", payload);
      const result = await addAccount(payload);

      if (result?.message === "Accounts added successfully (no duplicates inserted)") {
        // ✅ Store account IDs in localStorage
        const accountIds = formData.accounts.map((acc) => acc.accountId);
        localStorage.setItem("account_ids", JSON.stringify(accountIds));

        setToast({ type: "success", message: result.message });
        setTimeout(() => setToast(null), 3000);

        // ✅ Navigate after storing
        navigate("/imsproduct");
      } else {
        setToast({ type: "error", message: "Failed to add accounts." });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setToast({ type: "error", message: "Something went wrong. Try again." });
      setTimeout(() => setToast(null), 3000);
    }
  }, [formData, validateForm, addAccount, navigate]);



  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-6">
      {/* ✅ Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-500 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Account Registration</h1>
          <p className="text-gray-600">Enter account details below</p>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Accounts</h2>
            <button
              onClick={handleAddAccount}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm"
            >
              <Plus size={14} />
              <span>Add Account</span>
            </button>
          </div>

          {formData.accounts.map((acc, index) => (
            <AccountCard
              key={index}
              index={index}
              acc={acc}
              errors={errors}
              updateAccount={updateAccount}
              removeAccount={removeAccount}
              canRemove={formData.accounts.length > 1}
            />
          ))}

          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                handleSubmit();         
                navigate('/imsproduct/accounts');  }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl"
              navigation
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
