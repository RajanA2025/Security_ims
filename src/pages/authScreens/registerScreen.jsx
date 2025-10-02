import React, { useState } from 'react';
import { Plus, Minus, User, CreditCard, Shield } from 'lucide-react';

const RegistrationForm = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    details: {
      adminName: '',
      userName: '',
      mailId: '',
      features: [] // Features dropdown
    },
    accounts: [
      { accountId: '', accountName: '', accessKey: '', secretKey: '', bucketName: '', prefix: '' }
    ],
    permissions: {} // Empty
  });

  const [errors, setErrors] = useState({});

  const featuresList = ["Cost", "Security", "Performance"];

  const toggleFeature = (feature) => {
    setFormData(prev => {
      const current = prev.details.features;
      const updated = current.includes(feature)
        ? current.filter(f => f !== feature)
        : [...current, feature];
      return {
        ...prev,
        details: { ...prev.details, features: updated }
      };
    });
  };

  const addAccount = () => {
    setFormData(prev => ({
      ...prev,
      accounts: [...prev.accounts, { accountId: '', accountName: '', accessKey: '', secretKey: '', bucketName: '', prefix: '' }]
    }));
  };

  const removeAccount = (index) => {
    if (formData.accounts.length > 1) {
      setFormData(prev => ({
        ...prev,
        accounts: prev.accounts.filter((_, i) => i !== index)
      }));
    }
  };

  const updateAccount = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      accounts: prev.accounts.map((account, i) =>
        i === index ? { ...account, [field]: value } : account
      )
    }));
  };

  const updateDetails = (field, value) => {
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details, [field]: value }
    }));
  };

  const validateForm = (tab) => {
    const newErrors = {};

    if (tab === 'details') {
      if (!formData.details.adminName.trim()) {
        newErrors['details.adminName'] = 'Admin name is required';
      }
      if (!formData.details.userName.trim()) {
        newErrors['details.userName'] = 'User name is required';
      }
      if (!formData.details.mailId.trim()) {
        newErrors['details.mailId'] = 'Mail ID is required';
      }
    } else if (tab === 'accounts') {
      formData.accounts.forEach((account, index) => {
        if (!account.accountId.trim()) newErrors[`accounts.${index}.accountId`] = 'Account ID is required';
        if (!account.accountName.trim()) newErrors[`accounts.${index}.accountName`] = 'Account name is required';
        if (!account.accessKey.trim()) newErrors[`accounts.${index}.accessKey`] = 'Access key is required';
        if (!account.secretKey.trim()) newErrors[`accounts.${index}.secretKey`] = 'Secret key is required';

        if (formData.details.features.includes("Cost")) {
          if (!account.bucketName.trim()) newErrors[`accounts.${index}.bucketName`] = 'Bucket name is required';
          if (!account.prefix.trim()) newErrors[`accounts.${index}.prefix`] = 'Prefix is required';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm('details')) {
      setActiveTab('accounts');
    } else {
      alert('Please fill all required fields in Details tab.');
    }
  };

  const handleSubmit = () => {
    if (validateForm('accounts')) {
      alert('Registration request submitted successfully!');
      console.log('Form Data:', formData);
    } else {
      alert('Please fill all required fields in Accounts tab.');
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const InputField = ({ label, value, onChange, type = 'text', placeholder, error, required = true }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );

  const CheckboxField = ({ label, checked, onChange, error }) => (
    <div className="flex items-start space-x-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Form</h1>
          <p className="text-gray-600">Please fill in all required fields to complete your registration.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 border-b pb-4 justify-center">
          <TabButton id="details" label="Details" icon={User} />
          <TabButton id="accounts" label="Accounts" icon={CreditCard} />
          <TabButton id="permissions" label="Permissions" icon={Shield} />
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 rounded-lg p-6 min-h-96">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Basic Details</h2>
              <div className="space-y-4">
                  <InputField
                  label="Company Name"
                  value={formData.details.adminName}
                  onChange={(value) => updateDetails('adminName', value)}
                  placeholder="Enter admin name"
                  error={errors['details.adminName']}
                />
                <InputField
                  label="Admin Name"
                  value={formData.details.adminName}
                  onChange={(value) => updateDetails('adminName', value)}
                  placeholder="Enter admin name"
                  error={errors['details.adminName']}
                />
                <InputField
                  label="User Name"
                  value={formData.details.userName}
                  onChange={(value) => updateDetails('userName', value)}
                  placeholder="Enter user name"
                  error={errors['details.userName']}
                />
                <InputField
                  label="Mail ID"
                  value={formData.details.mailId}
                  onChange={(value) => updateDetails('mailId', value)}
                  placeholder="Enter mail ID"
                  error={errors['details.mailId']}
                />

                {/* Features Dropdown */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Features <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-lg p-3 bg-white shadow-sm">
                    {featuresList.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={formData.details.features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleNext}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
                <button
                  onClick={addAccount}
                  className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus size={14} />
                  <span>Add Account</span>
                </button>
              </div>

              {formData.accounts.map((account, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium text-gray-700">Account {index + 1}</h3>
                    {formData.accounts.length > 1 && (
                      <button
                        onClick={() => removeAccount(index)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors text-sm"
                      >
                        <Minus size={14} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InputField
                      label="Account ID"
                      value={account.accountId}
                      onChange={(value) => updateAccount(index, 'accountId', value)}
                      placeholder="Enter account ID"
                      error={errors[`accounts.${index}.accountId`]}
                    />
                    <InputField
                      label="Account Name"
                      value={account.accountName}
                      onChange={(value) => updateAccount(index, 'accountName', value)}
                      placeholder="Enter account name"
                      error={errors[`accounts.${index}.accountName`]}
                    />
                    <InputField
                      label="Access Key"
                      value={account.accessKey}
                      onChange={(value) => updateAccount(index, 'accessKey', value)}
                      placeholder="Enter access key"
                      error={errors[`accounts.${index}.accessKey`]}
                    />
                    <InputField
                      label="Secret Key"
                      value={account.secretKey}
                      onChange={(value) => updateAccount(index, 'secretKey', value)}
                      type="password"
                      placeholder="Enter secret key"
                      error={errors[`accounts.${index}.secretKey`]}
                    />

                    {formData.details.features.includes("Cost") && (
                      <>
                        <InputField
                          label="Bucket Name"
                          value={account.bucketName}
                          onChange={(value) => updateAccount(index, 'bucketName', value)}
                          placeholder="Enter bucket name"
                          error={errors[`accounts.${index}.bucketName`]}
                        />
                        <InputField
                          label="Prefix"
                          value={account.prefix}
                          onChange={(value) => updateAccount(index, 'prefix', value)}
                          placeholder="Enter prefix (e.g., data/, images/)"
                          error={errors[`accounts.${index}.prefix`]}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Submit Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Submit Request
                </button>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="text-center text-gray-500 py-10">
              Permissions are not required.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;

