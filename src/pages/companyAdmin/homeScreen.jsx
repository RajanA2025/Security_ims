import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const usersMock = [
  {
    id: 1,
    userName: 'John Doe',
    accountId: 'ACC12345',
    permissions: ['Cost', 'Security']
  },
  {
    id: 2,
    userName: 'Jane Smith',
    accountId: 'ACC67890',
    permissions: ['Performance']
  },
  {
    id: 3,
    userName: 'Alice Johnson',
    accountId: 'ACC54321',
    permissions: ['Cost', 'Performance', 'Security']
  }
];

const CompanyAdminUsers = () => {
  const [users, setUsers] = useState(usersMock);

  const handleCreateUser = () => {
    alert('Redirect to create user form!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button
          onClick={handleCreateUser}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow"
        >
          <Plus size={16} />
          <span>Create</span>
        </button>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{user.userName}</h2>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Account ID:</span> {user.accountId}
            </p>
            <div className="mt-2">
              <span className="font-medium text-gray-700">Permissions:</span>
              <div className="flex flex-wrap mt-1">
                {user.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyAdminUsers;
