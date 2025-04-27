import React, { useState, useEffect, useCallback } from "react";
// Import the separated components
import PersonalInfo from "./PersonalInfo";
import StoreProfile from "./StoreProfile";

const Account = () => {
  const [userInfo, setUserInfo] = useState(null); // Will include user details, addresses, paymentMethods
  const [storeInfo, setStoreInfo] = useState(null); // For seller's store profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBaseUrl = "http://localhost:5000/api"; // Your backend API URL

  // Use useCallback for fetch function to avoid re-creation on every render
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token"); // Get token from storage

    if (!token) {
      setError("Vui lòng đăng nhập để xem thông tin tài khoản.");
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile (includes addresses and payment methods)
      // --- CHANGE THIS LINE ---
      const userResponse = await fetch(`${apiBaseUrl}/auth/me`, {
        // Corrected endpoint: /auth/me
        // --- END CHANGE ---
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      });

      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          // Handle unauthorized specifically
          setError(
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
          );
          localStorage.removeItem("token"); // Clear invalid token
          // Optionally redirect to login page
        } else {
          const errorData = await userResponse
            .json()
            .catch(() => ({ message: "Không thể lấy thông tin người dùng." }));
          throw new Error(
            errorData.message ||
              "Lỗi không xác định khi lấy thông tin người dùng."
          );
        }
      } else {
        const userData = await userResponse.json();
        if (userData.success) {
          setUserInfo(userData.user); // Set the nested user object

          // If user is a seller, fetch store profile
          if (userData.user.role === "seller") {
            // --- Ensure this endpoint is also correct ---
            const storeResponse = await fetch(`${apiBaseUrl}/stores/profile`, {
              // This seems correct based on store.routes.js
              // --- END Check ---
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (storeResponse.ok) {
              const storeData = await storeResponse.json();
              if (storeData.success) {
                setStoreInfo(storeData.store); // Can be null if no store yet
              }
              // Handle case where store fetch fails but user fetch succeeded?
            } else {
              console.warn("Could not fetch store profile."); // Log warning, don't block UI
            }
          }
        } else {
          throw new Error(
            userData.message || "Lỗi khi lấy dữ liệu người dùng."
          );
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]); // Dependency array includes apiBaseUrl

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Use fetchData in dependency array

  // --- Save Handlers ---

  // Save User Info (username, fullname, email)
  const handleSaveUserInfo = async (updatedInfo) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập lại.");
      return;
    }
    try {
      // --- CHANGE THIS LINE ---
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        // Corrected endpoint for updating user profile
        // --- END CHANGE ---
        method: "PUT", // Assuming PUT updates the user profile via /auth/me
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedInfo), // Send only username, fullname, email
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Không thể cập nhật thông tin người dùng."
        );
      }

      // Update local state partially - keep existing addresses/payments
      setUserInfo((prevInfo) => ({
        ...prevInfo, // Keep addresses, payments, role etc.
        ...data.user, // Update with returned user data (id, username, fullname, email, role, avatarURL)
      }));
      alert("Thông tin cá nhân đã được cập nhật!");
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin cá nhân:", err);
      alert("Lỗi: " + err.message);
    }
  };

  // Save Address (Add or Update)
  const handleSaveAddress = async (addressData, addressId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập lại.");
      return;
    }

    const isUpdating = !!addressId;
    // --- CHECK THESE ENDPOINTS ---
    // Assuming you have separate routes for addresses, e.g., /users/addresses
    // If these routes are under /auth, adjust accordingly.
    // Based on the previous error, it's likely these should NOT be under /users
    // Let's assume you have dedicated address routes like /api/addresses/
    const url = isUpdating
      ? `${apiBaseUrl}/addresses/${addressId}` // Example: /api/addresses/:id
      : `${apiBaseUrl}/addresses`; // Example: /api/addresses
    // --- END CHECK ---
    const method = isUpdating ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Không thể ${isUpdating ? "cập nhật" : "thêm"} địa chỉ.`
        );
      }

      alert(`Địa chỉ đã được ${isUpdating ? "cập nhật" : "thêm"} thành công!`);
      // Refresh all user data to get the updated address list
      fetchData();
    } catch (err) {
      console.error(
        `Lỗi khi ${isUpdating ? "cập nhật" : "thêm"} địa chỉ:`,
        err
      );
      alert("Lỗi: " + err.message);
    }
  };

  // Save Store Profile (Update or Create - backend handles logic)
  const handleSaveStoreProfile = async (storeData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập lại.");
      return;
    }
    try {
      // Use PUT for update, backend controller handles creation if store doesn't exist (or adjust if needed)
      const response = await fetch(`${apiBaseUrl}/stores/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Handle specific errors, e.g., store not found if PUT requires existing store
        if (response.status === 404) {
          throw new Error(
            "Cửa hàng không tồn tại. Có lỗi xảy ra hoặc bạn cần tạo cửa hàng trước."
          );
        } else {
          throw new Error(data.message || "Không thể cập nhật hồ sơ cửa hàng.");
        }
      }

      setStoreInfo(data.store); // Update local state with the returned store data
      alert("Hồ sơ cửa hàng đã được cập nhật!");
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ cửa hàng:", err);
      alert("Lỗi: " + err.message);
    }
  };

  // --- Render Logic ---

  if (loading)
    return (
      <div className="p-4 text-center">Đang tải thông tin tài khoản...</div>
    );
  if (error)
    return <div className="p-4 text-center text-red-500">Lỗi: {error}</div>;
  // Ensure userInfo exists before rendering components that depend on it
  if (!userInfo)
    return (
      <div className="p-4 text-center">
        Không thể tải thông tin người dùng. Vui lòng thử lại.
      </div>
    );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {" "}
      {/* Added max-width and centering */}
      <h2 className="text-xl font-bold mb-4">Tài khoản</h2>
      <p className="text-gray-600 mb-6">
        Quản lý thông tin cá nhân, thanh toán và cửa hàng của bạn.
      </p>
      {/* Use the imported components */}
      <PersonalInfo
        userInfo={userInfo} // Pass basic user info (username, fullname, email)
        addresses={userInfo.addresses} // Pass addresses array
        onSave={handleSaveUserInfo}
        onSaveAddress={handleSaveAddress}
      />
      {/* Conditionally render StoreProfile for sellers */}
      {userInfo.role === "seller" && (
        <StoreProfile storeInfo={storeInfo} onSave={handleSaveStoreProfile} />
      )}
      {/* Static sections - keep as is or make dynamic */}
      <div className="border rounded p-4 mb-4">
        <h3 className="text-md font-semibold mb-2">Tùy chỉnh</h3>
        <p className="text-gray-500 mb-1">Thông báo: Bật (Email + Ứng dụng)</p>
        <p className="text-gray-500 mb-1">Ngôn ngữ: Tiếng Việt</p>
        <p className="text-gray-500 mb-2">
          Chế độ bảo mật: Xác minh 2 bước (Bật)
        </p>
        <button className="text-blue-500 hover:underline text-sm">
          Thay đổi tùy chỉnh
        </button>
      </div>
      {/* Static sections - keep as is or make dynamic */}
      <div className="border rounded p-4">
        <h3 className="text-md font-semibold mb-2">Gói dịch vụ</h3>
        <p className="text-gray-500 mb-2">Theo dõi các gói đăng ký của bạn.</p>
        {/* Replace with dynamic data if applicable */}
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between items-center">
            <span>Gói bán hàng Pro</span>
            <span className="text-gray-400">Hết hạn: 30/04/2025</span>
          </li>
          <li className="flex justify-between items-center">
            <span>Gói quảng cáo nâng cao</span>
            <span className="text-gray-400">Không hoạt động</span>
          </li>
        </ul>
        <button className="text-blue-500 hover:underline mt-2 text-sm">
          Quản lý gói dịch vụ
        </button>
      </div>
    </div>
  );
};

export default Account;
