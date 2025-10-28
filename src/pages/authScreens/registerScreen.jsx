import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { CostContext } from "../../Context/CostContext";

const RegistrationForm = () => {
  const { registerCompany, loading } = useContext(CostContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    mailId: "",
    password: "",
    features: {
      Cost: false,
      Security: false,
      Performance: false,
      Operational: false,
    },
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const featuresList = ["Cost", "Security", "Performance", "Operational"];

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Feature toggle
  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.name.trim()) newErrors.name = "Admin name is required";
    if (!formData.mailId.trim()) newErrors.mailId = "Mail ID is required";
    if (!formData.password.trim())
      newErrors.password = "Password is required";
    if (!Object.values(formData.features).some(Boolean))
      newErrors.features = "Select at least one feature";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toast handler
  const showToast = (message, color = "bg-red-600") => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { features } = formData;

    // ✅ Build flat JSON payload
    const payload = {
      company_name: formData.companyName,
      admin_name: formData.name,
      email: formData.mailId,
      password: formData.password,
      cost: features.Cost,
      security: features.Security,
      performance: features.Performance,
      operational_excellence: features.Operational,
    };

    console.log("Payload to send:", payload);

    try {
      const res = await registerCompany(payload);
      console.log("Response:", res);

      if (res?.message === "Registered successfully") {
        showToast("Registered successfully", "bg-green-600");
        setTimeout(() => navigate("/admin"), 1500);
      } else if (res?.detail === "Email already registered") {
        showToast("Email already registered", "bg-yellow-600");
      } else {
        showToast("Unexpected error occurred", "bg-red-600");
      }
    } catch (err) {
      console.error("Register error:", err);
      showToast("Server connection failed", "bg-red-600");
    }
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed top-5 right-5 ${toast.color} text-white px-4 py-3 rounded-lg shadow-lg text-sm transition-all duration-300 ease-in-out z-50`}
        >
          {toast.message}
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center p-0 relative">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-md mb-3">
              <Building2 size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Company Registration
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Fill in the details to create your account
            </p>
          </div>

          <div className="space-y-5">
            {["companyName", "name", "mailId", "password"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <div className="relative">
                  {field === "companyName" && (
                    <Building2
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  )}
                  {field === "name" && (
                    <User
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  )}
                  {field === "mailId" && (
                    <Mail
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  )}
                  {field === "password" && (
                    <Lock
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  )}
                  <input
                    type={
                      field === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : field === "mailId"
                          ? "email"
                          : "text"
                    }
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    placeholder={`Enter ${field
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()}`}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors[field] ? "border-red-500" : "border-gray-300"
                      }`}
                  />

                  {/* Password toggle button */}
                  {field === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
                {errors[field] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
                )}
              </div>
            ))}

            {/* Features */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Features
              </label>
              <div className="flex flex-wrap gap-3">
                {featuresList.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${formData.features[feature]
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50"
                      }`}
                  >
                    <ShieldCheck size={14} className="inline-block mr-1" />
                    {feature}
                  </button>
                ))}
              </div>
              {errors.features && (
                <p className="text-red-500 text-xs mt-1">{errors.features}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default RegistrationForm;
