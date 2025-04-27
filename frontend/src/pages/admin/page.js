"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
// Import các component mới
import Sidebar from "./components/Sidebar";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorDisplay from "./components/ErrorDisplay";
import UserList from "./components/UserManagement/UserList";
import UserForm from "./components/UserManagement/UserForm";
import UserActions from "./components/UserManagement/UserActions";
import ProductList from "./components/ProductManagement/ProductList";
import ProductForm from "./components/ProductManagement/ProductForm";
import ProductActions from "./components/ProductManagement/ProductActions";
import OrderList from "./components/OrderManagement/OrderList";
import CategoryList from "./components/CategoryManagement/CategoryList";
import CategoryForm from "./components/CategoryManagement/CategoryForm";
import Pagination from "./components/Pagination";
import Modal from "./components/Modal";
import StoreList from "./components/StoreManagement/StoreList";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]); // Add this line
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState({
    show: false,
    action: null,
    id: null,
  });
  const [showAddEdit, setShowAddEdit] = useState({
    show: false,
    type: null,
    data: null,
  });
  const [showAddEditCategory, setShowAddEditCategory] = useState({
    show: false,
    data: null,
  });
  const [showDetail, setShowDetail] = useState({
    show: false,
    type: null,
    data: null,
  });
  const itemsPerPage = 12;

  // Hàm lọc dữ liệu theo searchTerm
  const filterData = (data, type) => {
    if (!searchTerm) return data;

    switch (type) {
      case "users":
        return data.filter(
          (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "products":
        return data.filter((product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "orders":
        return data.filter(
          (order) =>
            order.order_id.toString().includes(searchTerm) ||
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "categories":
        return data.filter((category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      default:
        return data;
    }
  };

  // Hàm xử lý phân trang
  const getTotalPages = (data) => Math.ceil(data.length / itemsPerPage);
  const handlePageChange = (page) => setCurrentPage(page);

  // Hàm xử lý hiển thị trạng thái
  const getProductStatusBadge = (status) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      out_of_stock: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status]}`}
      >
        {status === "active"
          ? "Đang bán"
          : status === "inactive"
          ? "Ngừng bán"
          : "Hết hàng"}
      </span>
    );
  };

  const getOrderStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status]}`}
      >
        {status === "pending"
          ? "Chờ xử lý"
          : status === "processing"
          ? "Đang xử lý"
          : status === "completed"
          ? "Hoàn thành"
          : "Đã hủy"}
      </span>
    );
  };

  // Hàm xử lý modal
  const showDetailModal = (type, id) => {
    const data =
      type === "user"
        ? users.find((u) => u._id === id)
        : type === "product"
        ? products.find((p) => p._id === id)
        : type === "order"
        ? orders.find((o) => o._id === id)
        : categories.find((c) => c._id === id);

    setShowDetail({ show: true, type, data });
  };

  const showAddEditModal = (type, data = null) => {
    setShowAddEdit({ show: true, type, data });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const usersResponse = await fetch(
          "http://localhost:5000/api/admin/users",
          {
            headers,
          }
        );
        const usersData = await usersResponse.json();
        console.log("Users data received:", usersData);
        setUsers(usersData.users); // Sửa thành usersData.users

        const ordersResponse = await fetch(
          "http://localhost:5000/api/admin/orders",
          {
            headers,
          }
        );
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || ordersData); // Thêm fallback

        const categoriesResponse = await fetch(
          "http://localhost:5000/api/admin/categories",
          { headers }
        );
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || categoriesData); // Thêm fallback

        const productsResponse = await fetch(
          "http://localhost:5000/api/products",
          { headers }
        );
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Add fetch for stores
        const storesResponse = await fetch(
          "http://localhost:5000/api/admin/stores",
          {
            headers,
          }
        );
        const storesData = await storesResponse.json();
        // Ensure stores is always an array
        setStores(Array.isArray(storesData.stores) ? storesData.stores : Array.isArray(storesData) ? storesData : []);

        setLoading(false);
      } catch (err) {
        setError("Không thể tải dữ liệu từ server");
        setLoading(false);
        console.error("Lỗi khi fetch dữ liệu:", err);
      }
    };
    const checkAuth = async () => {
      const user = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");

      if (!user || !token) {
        navigate("/auth");
        return;
      }

      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== "admin") {
        navigate("/");
        return;
      }
    };
    fetchData();
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/auth");
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
    );
  const handleUserSubmit = async (userData) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (userData._id) {
        // Cập nhật user
        const response = await fetch(
          `http://localhost:5000/api/admin/users/${userData._id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(userData),
          }
        );

        if (response.ok) {
          setUsers(
            users.map((user) => (user._id === userData._id ? userData : user))
          );
        }
      } else {
        // Thêm user mới
        const response = await fetch("http://localhost:5000/api/admin/users", {
          method: "POST",
          headers,
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const newUser = await response.json();
          setUsers([...users, newUser]);
        }
      }
      setShowAddEdit({ show: false, type: null, data: null });
    } catch (err) {
      setError("Không thể xử lý yêu cầu");
      console.error("Lỗi khi xử lý user:", err);
    }
  };

  const handleProductSubmit = async (productData) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (productData._id) {
        // Cập nhật sản phẩm
        const response = await fetch(
          `http://localhost:5000/api/products/${productData._id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(productData),
          }
        );

        if (response.ok) {
          setProducts(
            products.map((product) =>
              product._id === productData._id ? productData : product
            )
          );
        }
      } else {
        // Thêm sản phẩm mới
        const response = await fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers,
          body: JSON.stringify(productData),
        });

        if (response.ok) {
          const newProduct = await response.json();
          setProducts([...products, newProduct]);
        }
      }
      setShowAddEdit({ show: false, type: null, data: null });
    } catch (err) {
      setError("Không thể xử lý yêu cầu");
      console.error("Lỗi khi xử lý sản phẩm:", err);
    }
  };

  const handleCategorySubmit = async (categoryData) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (categoryData._id) {
        // Cập nhật danh mục
        const response = await fetch(
          `http://localhost:5000/api/admin/categories/${categoryData._id}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(categoryData),
          }
        );

        if (response.ok) {
          setCategories(
            categories.map((category) =>
              category._id === categoryData._id ? categoryData : category
            )
          );
        }
      } else {
        // Thêm danh mục mới
        const response = await fetch(
          "http://localhost:5000/api/admin/categories",
          {
            method: "POST",
            headers,
            body: JSON.stringify(categoryData),
          }
        );

        if (response.ok) {
          const newCategory = await response.json();
          setCategories([...categories, newCategory]);
        }
      }
      setShowAddEditCategory({ show: false, data: null });
    } catch (err) {
      setError("Không thể xử lý yêu cầu");
      console.error("Lỗi khi xử lý danh mục:", err);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(`http://localhost:5000/api/${type}/${id}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        switch (type) {
          case "users":
            setUsers(users.filter((user) => user._id !== id));
            break;
          case "products":
            setProducts(products.filter((product) => product._id !== id));
            break;
          case "categories":
            setCategories(categories.filter((category) => category._id !== id));
            break;
          default:
            break;
        }
      }
    } catch (err) {
      setError("Không thể xóa");
      console.error("Lỗi khi xóa:", err);
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status } : order
          )
        );
      }
    } catch (err) {
      setError("Không thể cập nhật trạng thái đơn hàng");
      console.error("Lỗi khi cập nhật đơn hàng:", err);
    }
  };
  const handleApproveStore = async (storeId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `http://localhost:5000/api/admin/stores/${storeId}/approve`,
        {
          method: "PATCH",
          headers,
        }
      );

      if (response.ok) {
        setStores(
          stores.map((store) =>
            store._id === storeId ? { ...store, status: "approved" } : store
          )
        );
      }
    } catch (err) {
      setError("Không thể phê duyệt cửa hàng");
      console.error("Lỗi khi phê duyệt cửa hàng:", err);
    }
  };

  const handleRejectStore = async (storeId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `http://localhost:5000/api/admin/stores/${storeId}/reject`,
        {
          method: "PATCH",
          headers,
        }
      );

      if (response.ok) {
        setStores(stores.filter((store) => store._id !== storeId));
      }
    } catch (err) {
      setError("Không thể từ chối cửa hàng");
      console.error("Lỗi khi từ chối cửa hàng:", err);
    }
  };
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const newStatus = currentStatus === "active" ? "blocked" : "active";

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}/toggle-status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user
          )
        );
      }
    } catch (err) {
      setError("Không thể thay đổi trạng thái người dùng");
      console.error("Lỗi khi thay đổi trạng thái:", err);
    }
  };

  const confirmAction = (action, id) => {
    setShowConfirm({
      show: true,
      action,
      id,
    });
  };

  const executeAction = async () => {
    const { action, id } = showConfirm;
    try {
      if (action === "delete") {
        await handleDelete(activeTab.slice(0, -1), id);
      }
      setShowConfirm({ show: false, action: null, id: null });
    } catch (err) {
      setError("Không thể thực hiện hành động");
      console.error("Lỗi khi thực hiện hành động:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Add stores tab */}
        {activeTab === "sellers" && (
          <StoreList
            stores={stores}
            onApprove={handleApproveStore}
            onReject={handleRejectStore}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        )}

        {/* Content based on active tab */}
        {activeTab === "users" && (
          <>
            <UserActions
              onAdd={() => showAddEditModal("user")}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <UserList
              users={filterData(users, "users")}
              showDetailModal={showDetailModal}
              showAddEditModal={showAddEditModal}
              confirmAction={confirmAction}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}

        {activeTab === "products" && (
          <>
            <ProductActions
              onAdd={() => showAddEditModal("product")}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <ProductList
              products={filterData(products, "products")}
              showDetailModal={showDetailModal}
              showAddEditModal={showAddEditModal}
              confirmAction={confirmAction}
              getProductStatusBadge={getProductStatusBadge}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}

        {activeTab === "orders" && (
          <OrderList
            orders={filterData(orders, "orders")}
            showDetailModal={showDetailModal}
            showAddEditModal={showAddEditModal}
            confirmAction={confirmAction}
            getOrderStatusBadge={getOrderStatusBadge}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        )}

        {activeTab === "categories" && (
          <>
            <CategoryList
              categories={filterData(categories, "categories")}
              showAddEditCategory={setShowAddEditCategory}
              confirmAction={confirmAction}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
            <button
              onClick={() => setShowAddEditCategory({ show: true, data: null })}
              className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Thêm danh mục
            </button>
          </>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={getTotalPages(
            activeTab === "users"
              ? users
              : activeTab === "products"
              ? products
              : activeTab === "orders"
              ? orders
              : categories
          )}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirm.show}
        onClose={() => setShowConfirm({ show: false, action: null, id: null })}
        title="Xác nhận"
      >
        <div className="p-4">
          <p>Bạn có chắc chắn muốn thực hiện hành động này?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() =>
                setShowConfirm({ show: false, action: null, id: null })
              }
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              onClick={executeAction}
              className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetail.show}
        onClose={() => setShowDetail({ show: false, type: null, data: null })}
        title={`Chi tiết ${
          showDetail.type === "user"
            ? "người dùng"
            : showDetail.type === "product"
            ? "sản phẩm"
            : showDetail.type === "order"
            ? "đơn hàng"
            : "danh mục"
        }`}
      >
        {/* Render detail content based on type */}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddEdit.show}
        onClose={() => setShowAddEdit({ show: false, type: null, data: null })}
        title={`${showAddEdit.data ? "Sửa" : "Thêm"} ${
          showAddEdit.type === "user"
            ? "người dùng"
            : showAddEdit.type === "product"
            ? "sản phẩm"
            : showAddEdit.type === "order"
            ? "đơn hàng"
            : "danh mục"
        }`}
      >
        {showAddEdit.type === "user" && (
          <UserForm
            user={showAddEdit.data}
            onSubmit={handleUserSubmit}
            onClose={() =>
              setShowAddEdit({ show: false, type: null, data: null })
            }
          />
        )}
        {showAddEdit.type === "product" && (
          <ProductForm
            product={showAddEdit.data}
            categories={categories}
            onSubmit={handleProductSubmit}
            onClose={() =>
              setShowAddEdit({ show: false, type: null, data: null })
            }
          />
        )}
        {showAddEdit.type === "category" && (
          <CategoryForm
            category={showAddEdit.data}
            onSubmit={handleCategorySubmit}
            onClose={() =>
              setShowAddEdit({ show: false, type: null, data: null })
            }
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
