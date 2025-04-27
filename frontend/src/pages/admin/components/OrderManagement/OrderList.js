import React from "react";
import { FaEdit, FaBan, FaEye } from "react-icons/fa";

const OrderList = ({
  orders,
  showDetailModal,
  showAddEditModal,
  confirmAction,
  getOrderStatusBadge,
  currentPage,
  itemsPerPage,
}) => {
  // Add check to ensure orders is an array
  const orderArray = Array.isArray(orders) ? orders : [];
  const paginatedOrders = orderArray.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mã đơn hàng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Khách hàng
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedOrders.map((order) => (
            <tr key={order._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  #{order._id}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(order.orderDate).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.buyerId?.fullname || "N/A"}
                </div>
                <div className="text-sm text-gray-500">
                  {order.buyerId?.email || "N/A"}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {getOrderStatusBadge(order.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => showDetailModal("order", order._id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => showAddEditModal("order", order)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    <FaEdit />
                  </button>
                  {order.status !== "cancelled" && (
                    <button
                      onClick={() => confirmAction("cancelOrder", order._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaBan />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
