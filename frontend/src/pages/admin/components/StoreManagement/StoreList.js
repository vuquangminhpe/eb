import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

const StoreList = ({ stores, onApprove, onReject, currentPage, itemsPerPage }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Ensure stores is always an array
  const storesArray = Array.isArray(stores) ? stores : [];
  
  const filteredStores = storesArray.filter(store => 
    store?.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store?.sellerId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status]}`}>
        {status === "pending" ? "Chờ duyệt" : status === "approved" ? "Đã duyệt" : "Từ chối"}
      </span>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm cửa hàng..."
          className="border rounded px-3 py-2 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên cửa hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người bán</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStores
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((store) => (
                <tr key={store._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{store.storeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{store.sellerId?.username || store.sellerId?.fullname || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(store.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {store.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onApprove(store._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => onReject(store._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreList;