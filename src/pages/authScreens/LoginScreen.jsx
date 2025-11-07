import { useState, useContext } from "react";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { CostContext } from "../../Context/CostContext";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginScreen() {
  const { loginCompany, } = useContext(CostContext);
  const [loginLoading, setLoginLoading] = useState(false);

  const { login: setAuthLogin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      // ✅ Hardcoded Admin Login
      if (
        formData.email === "admin@Jit.com" &&
        formData.password === "Test@1234"
      ) {
        setAuthLogin("admin-auth");
        localStorage.setItem("company_cid", "admin");

        setToast({ type: "success", message: "Welcome Admin!" });
        setTimeout(() => {
          setToast(null);
          navigate("/admin");
        }, 2000);
        return;
      }

      // ✅ Normal company login
      const result = await loginCompany(formData);

      if (result?.message === "Login successful" && result?.cid) {
        if (result.token) setAuthLogin(result.token);
        else if (localStorage.getItem("auth_token"))
          setAuthLogin(localStorage.getItem("auth_token"));

        localStorage.setItem("company_cid", result.cid);

        const pillars = {
          cost: result.cost,
          security: result.security,
          operational_excellence: result.operational_excellence,
          performance: result.performance,
        };
        localStorage.setItem("pillars", JSON.stringify(pillars));

        setToast({
          type: "success",
          message: `Welcome ${result.admin_name || "User"}!`,
        });

        setTimeout(() => {
          setToast(null);
          navigate("/Imsproduct");
        }, 2500);
        return;
      }

      // ❌ On failed login
      setToast({
        type: "error",
        message: "Login failed!",
        subMessage: result?.error || "Please check your credentials.",
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      // ✅ Always stop the loading spinner
      setLoginLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4 relative">
      {/* ✅ Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-500 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
        >
          <p>{toast.message}</p>
          {toast.subMessage && (
            <p className="text-xs text-white/80 mt-1">{toast.subMessage}</p>
          )}
        </div>
      )}

      {/* ✅ Login Card */}
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-indigo-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 mb-3">
            <LogIn size={28} className="text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Log in to access your dashboard
          </p>
        </div>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-3.5 p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${loginLoading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
              }`}
          >
            {loginLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
