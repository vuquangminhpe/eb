import {
  FaUsers,
  FaShoppingBag,
  FaBoxOpen,
  FaList,
  FaSignOutAlt,
  FaUserCheck,
} from "react-icons/fa";

const Sidebar = ({ activeTab, setActiveTab, setCurrentPage, handleLogout }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
      <ul className="space-y-2">
        <li
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            activeTab === "users"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => {
            setActiveTab("users");
            setCurrentPage(1);
          }}
        >
          <FaUsers className="w-5 h-5 mr-3" />
          <span>Quản lý người dùng</span>
        </li>
        <li
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            activeTab === "products"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => {
            setActiveTab("products");
            setCurrentPage(1);
          }}
        >
          <FaBoxOpen className="w-5 h-5 mr-3" />
          <span>Quản lý sản phẩm</span>
        </li>
        <li
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            activeTab === "orders"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => {
            setActiveTab("orders");
            setCurrentPage(1);
          }}
        >
          <FaShoppingBag className="w-5 h-5 mr-3" />
          <span>Quản lý đơn hàng</span>
        </li>
        <li
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            activeTab === "categories"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => {
            setActiveTab("categories");
            setCurrentPage(1);
          }}
        >
          <FaList className="w-5 h-5 mr-3" />
          <span>Quản lý danh mục</span>
        </li>
        <li
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            activeTab === "sellers"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => {
            setActiveTab("sellers");
            setCurrentPage(1);
          }}
        >
          <FaUserCheck className="w-5 h-5 mr-3" />
          <span>Xác minh Seller</span>
        </li>
        <li
          className="flex items-center p-3 rounded-lg cursor-pointer text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="w-5 h-5 mr-3" />
          <span>Đăng xuất</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
