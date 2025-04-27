import React from "react";
import { FaPlus, FaSearch } from "react-icons/fa";

const UserActions = ({ onAdd, searchTerm, setSearchTerm }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FaPlus className="mr-2" />
        Thêm người dùng
      </button>
    </div>
  );
};

export default UserActions;
