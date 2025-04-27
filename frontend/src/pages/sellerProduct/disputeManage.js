import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DisputeManage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [tempResolution, setTempResolution] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/disputes');
      setDisputes(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách khiếu nại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dispute) => {
    setEditingId(dispute._id);
    setTempResolution(dispute.resolution || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempResolution('');
  };

  const handleStatusChange = async (id, status) => {
    try {
      const currentDispute = disputes.find(d => d._id === id);
      const response = await axios.put(`http://localhost:5000/api/disputes/${id}`, {
        status,
        resolution: currentDispute.resolution
      });
      setDisputes(prev => prev.map(d => (d._id === id ? response.data : d)));
    } catch (err) {
      console.error(err);
      alert('Cập nhật trạng thái thất bại');
    }
  };

  const handleSaveResolution = async (id) => {
    try {
      const currentDispute = disputes.find(d => d._id === id);
      const response = await axios.put(`http://localhost:5000/api/disputes/${id}`, {
        status: currentDispute.status,
        resolution: tempResolution
      });
      setDisputes(prev => prev.map(d => (d._id === id ? response.data : d)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Cập nhật phản hồi thất bại');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'open':
        return 'Đang mở';
      case 'under_review':
        return 'Đang xem xét';
      case 'resolved':
        return 'Đã giải quyết';
      case 'closed':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4 mx-auto max-w-4xl">
      <strong className="font-bold">Lỗi!</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link 
            to="/sell"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý khiếu nại</h1>
        </div>
        <button 
          onClick={fetchDisputes}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg">Không có khiếu nại nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người khiếu nại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phản hồi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {disputes.map(dispute => (
                <tr key={dispute._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dispute.orderId?._id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispute.raisedBy?.fullname || dispute.raisedBy?.username || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="line-clamp-2">{dispute.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(dispute.status)}`}>
                        {formatStatus(dispute.status)}
                      </span>
                      <div className="ml-2">
                        <select
                          value={dispute.status}
                          onChange={(e) => handleStatusChange(dispute._id, e.target.value)}
                          className="block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                          <option value="open">Đang mở</option>
                          <option value="under_review">Đang xem xét</option>
                          <option value="resolved">Đã giải quyết</option>
                          <option value="closed">Đã đóng</option>
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {editingId === dispute._id ? (
                      <textarea
                        value={tempResolution}
                        onChange={(e) => setTempResolution(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                      />
                    ) : (
                      <div className="line-clamp-2">{dispute.resolution || 'Chưa có phản hồi'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === dispute._id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveResolution(dispute._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(dispute)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Sửa phản hồi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisputeManage;