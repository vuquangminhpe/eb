import React from "react";
import { FaEdit, FaTrashAlt, FaBan, FaEye } from "react-icons/fa";

const UserList = ({
  users,
  showDetailModal,
  showAddEditModal,
  confirmAction,
  currentPage,
  itemsPerPage,
}) => {
  const userArray = Array.isArray(users)
    ? users
    : users && Array.isArray(users.users)
    ? users.users
    : [];
  const paginatedUsers = userArray.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên người dùng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vai trò
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
          {paginatedUsers.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatarURL || "https://via.placeholder.com/40"}
                      alt=""
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.fullname}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{user.username}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.role}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.action === "unlock"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.action === "unlock" ? "Hoạt động" : "Bị khóa"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => showDetailModal("user", user._id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => showAddEditModal("user", user)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => confirmAction("toggleUser", user._id)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    <FaBan />
                  </button>
                  <button
                    onClick={() => confirmAction("deleteUser", user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
