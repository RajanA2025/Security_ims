//invite users
import { useState, useRef, useEffect } from "react";

export default function RegisterScreen() {
  const [selectedAccounts, setSelectedAccounts] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const accounts = ["Account 1", "Account 2", "Account 3"];
  const subOptions = ["Cost", "Security", "Performance"];

  const toggleAccount = (account) => {
    setSelectedAccounts((prev) => ({
      ...prev,
      [account]: prev[account] ? undefined : [],
    }));
  };

  const toggleSubOption = (account, option) => {
    setSelectedAccounts((prev) => {
      const current = prev[account] || [];
      return {
        ...prev,
        [account]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Create label text for dropdown button
  const selectedText = Object.keys(selectedAccounts)
    .filter((acc) => selectedAccounts[acc] !== undefined)
    .map((acc) => {
      const subs = selectedAccounts[acc];
      return subs && subs.length > 0
        ? `${acc} (${subs.join(", ")})`
        : acc;
    })
    .join(", ") || "Select Accounts";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Register
        </h2>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Assign Account Dropdown */}
        <div className="mb-8" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700">
            Assign Account
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="mt-2 w-full px-4 py-3 border rounded-lg bg-white text-left focus:ring-2 focus:ring-indigo-500 truncate"
            >
              {selectedText}
            </button>

            {isDropdownOpen && (
              <div className="absolute mt-2 w-full border rounded-lg bg-white shadow-lg z-10 p-4 max-h-60 overflow-y-auto">
                {accounts.map((account) => (
                  <div key={account} className="mb-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedAccounts[account] !== undefined}
                        onChange={() => toggleAccount(account)}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{account}</span>
                    </label>

                    {/* Sub-options */}
                    {selectedAccounts[account] !== undefined && (
                      <div className="ml-6 mt-2 space-y-2">
                        {subOptions.map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedAccounts[account]?.includes(opt) || false
                              }
                              onChange={() => toggleSubOption(account, opt)}
                              className="rounded text-indigo-600"
                            />
                            <span className="text-sm text-gray-600">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Invite Button */}
        <button
          onClick={() =>
            console.log({
              email: "sample@email.com",
              username: "user123",
              accounts: selectedAccounts,
            })
          }
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium text-lg"
        >
          Invite
        </button>
      </div>
    </div>
  );
}
