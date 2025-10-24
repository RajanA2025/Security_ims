import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Filter, Search } from 'lucide-react';

// Mock Data - Access Requests
const requestsMock = [
  {
    id: 1,
    companyName: 'Alpha Corp',
    accountName: 'Production Account',
    accountId: 'ACC001',
    permissions: ['Cost', 'Security'],
    status: 'pending',
    requestDate: '2025-09-28'
  },
  {
    id: 2,
    companyName: 'Alpha Corp',
    accountName: 'Development Account',
    accountId: 'ACC002',
    permissions: ['Performance'],
    status: 'pending',
    requestDate: '2025-09-28'
  },
  {
    id: 3,
    companyName: 'Beta Ltd',
    accountName: 'Main Account',
    accountId: 'ACC101',
    permissions: ['Cost'],
    status: 'approved',
    requestDate: '2025-09-27'
  },
  {
    id: 4,
    companyName: 'Beta Ltd',
    accountName: 'Secondary Account',
    accountId: 'ACC102',
    permissions: ['Security', 'Performance'],
    status: 'pending',
    requestDate: '2025-09-29'
  },
  {
    id: 5,
    companyName: 'Gamma Inc',
    accountName: 'Operations Account',
    accountId: 'ACC201',
    permissions: ['Cost', 'Performance'],
    status: 'rejected',
    requestDate: '2025-09-26'
  },
  {
    id: 6,
    companyName: 'Delta Systems',
    accountName: 'Testing Account',
    accountId: 'ACC301',
    permissions: ['Security'],
    status: 'approved',
    requestDate: '2025-09-25'
  },
  {
    id: 7,
    companyName: 'Epsilon Technologies',
    accountName: 'Cloud Infrastructure',
    accountId: 'ACC401',
    permissions: ['Cost', 'Security', 'Performance'],
    status: 'pending',
    requestDate: '2025-09-29'
  },
  {
    id: 8,
    companyName: 'Zeta Innovations',
    accountName: 'Analytics Platform',
    accountId: 'ACC501',
    permissions: ['Performance'],
    status: 'approved',
    requestDate: '2025-09-24'
  },
  {
    id: 9,
    companyName: 'Theta Solutions',
    accountName: 'Database Services',
    accountId: 'ACC601',
    permissions: ['Cost', 'Security'],
    status: 'rejected',
    requestDate: '2025-09-23'
  },
  {
    id: 10,
    companyName: 'Iota Enterprises',
    accountName: 'Backup Account',
    accountId: 'ACC701',
    permissions: ['Security'],
    status: 'pending',
    requestDate: '2025-09-30'
  },
  {
    id: 11,
    companyName: 'Kappa Digital',
    accountName: 'Web Services',
    accountId: 'ACC801',
    permissions: ['Cost', 'Performance'],
    status: 'approved',
    requestDate: '2025-09-22'
  },
  {
    id: 12,
    companyName: 'Lambda Networks',
    accountName: 'Network Operations',
    accountId: 'ACC901',
    permissions: ['Security', 'Performance'],
    status: 'pending',
    requestDate: '2025-09-30'
  },
];

const JITAdminRequests = () => {
  const [requests, setRequests] = useState(requestsMock);
  const [filteredRequests, setFilteredRequests] = useState(requestsMock);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  const ITEMS_PER_PAGE = 7;

  useEffect(() => {
    // Calculate stats
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const approvedRequests = requests.filter(r => r.status === 'approved').length;
    const rejectedRequests = requests.filter(r => r.status === 'rejected').length;

    setStats({ totalRequests, pendingRequests, approvedRequests, rejectedRequests });
  }, [requests]);

  useEffect(() => {
    // Filter requests based on status and search query
    let filtered = requests;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.companyName.toLowerCase().includes(query) ||
        r.accountName.toLowerCase().includes(query) ||
        r.accountId.toLowerCase().includes(query) ||
        r.permissions.some(p => p.toLowerCase().includes(query))
      );
    }
    
    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [statusFilter, searchQuery, requests]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handleApprove = (id) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      )
    );
  };

  const handleReject = (id) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    );
  };

  const handleNotificationClick = () => {
    alert('Show notifications!');
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Access Requests</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleNotificationClick}
            className="relative p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {stats.pendingRequests}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approvedRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm font-medium text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejectedRequests}</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search Bar */}
          <div className="relative flex-1 md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by company, account, or permissions..."
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
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.companyName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.accountName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{request.accountId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {request.permissions.map((perm, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{request.requestDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="inline-flex items-center p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="inline-flex items-center p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No requests found for the selected filter.</p>
          </div>
        )}
        
        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, filteredRequests.length)}</span> of{' '}
              <span className="font-medium">{filteredRequests.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JITAdminRequests;