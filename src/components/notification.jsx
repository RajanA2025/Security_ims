import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

// Mock notifications data
const mockRequests = [
  {
    id: 1,
    companyName: 'Alpha Corp',
    accounts: [
      { accountId: 'ACC001', permissions: ['Cost', 'Security'] },
      { accountId: 'ACC002', permissions: ['Performance'] },
    ],
  },
  {
    id: 2,
    companyName: 'Beta Ltd',
    accounts: [
      { accountId: 'ACC101', permissions: ['Cost'] },
      { accountId: 'ACC102', permissions: ['Security', 'Performance'] },
    ],
  },
  {
    id: 3,
    companyName: 'Gamma Inc',
    accounts: [
      { accountId: 'ACC201', permissions: ['Cost', 'Performance'] },
    ],
  },
];

const JITAdminNotifications = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [isOpen, setIsOpen] = useState(true);

  const handleAccept = (id) => {
    alert(`Accepted request ID: ${id}`);
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleReject = (id) => {
    alert(`Rejected request ID: ${id}`);
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto rounded-xl shadow-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Company Requests</h1>
          <p className="text-gray-600">Accept or reject incoming company requests</p>
        </div>

        {/* Requests */}
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center mt-12">No pending requests</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {requests.map(request => (
              <div key={request.id} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">{request.companyName}</h2>

                {/* Accounts */}
                <div className="mb-2">
                  <p className="font-medium text-gray-700 mb-1">Accounts:</p>
                  <div className="flex flex-wrap gap-2">
                    {request.accounts.map((acc, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {acc.accountId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-4">
                  <p className="font-medium text-gray-700 mb-1">Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {request.accounts.flatMap(acc => acc.permissions).map((perm, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded cursor-not-allowed">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Check size={14} />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JITAdminNotifications;
