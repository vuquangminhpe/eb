import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import TopMenu from "../../components/TopMenu";
import SubMenu from "../../components/SubMenu";

const CreateStore = () => {
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    bannerImageURL: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      // kiểm tra nếu user đã là seller thì không cho vào trang này nữa
      if (parsedUser.role === "seller") {
        navigate("/sell");
      }
    } else {
      navigate("/auth");
    }
  }, [navigate]);
  // Thay thế hàm handleImageUpload bằng hàm này
  const handleImageURLChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      bannerImageURL: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Bạn phải đăng nhập để tạo cửa hàng");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/create-store",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Cập nhật thông tin người dùng trong localStorage với role mới
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const updatedUser = { ...currentUser, role: "seller" };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        localStorage.setItem("token", data.token); // Cập nhật token mới

        // Chuyển hướng về trang seller dashboard
        navigate("/sell");
      } else {
        setError(data.message || "Không thể tạo cửa hàng");
      }
    } catch (error) {
      console.error("Lỗi khi tạo cửa hàng:", error);
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      {/* Header Section */}
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      {/* Main Content */}
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Create Your Store
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Set up your store to start selling on eBay. Fill in the details
            below to get started.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="storeName"
                className="block text-gray-700 font-medium mb-2"
              >
                Store Name *
              </label>
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter your store name"
              />
              <p className="text-gray-500 text-sm mt-1">
                This is how customers will identify your store.
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-gray-700 font-medium mb-2"
              >
                Store Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Describe your store and what you sell"
              ></textarea>
              <p className="text-gray-500 text-sm mt-1">
                Tell customers about your business, products, and services.
              </p>
            </div>

            <div className="mb-8">
              <label
                htmlFor="bannerImageURL"
                className="block text-gray-700 font-medium mb-2"
              >
                Store Banner Image URL
              </label>
              <input
                type="url"
                id="bannerImageURL"
                name="bannerImageURL"
                value={formData.bannerImageURL}
                onChange={handleImageURLChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter image URL (e.g. https://example.com/image.jpg)"
              />
              {formData.bannerImageURL && (
                <div className="mt-4">
                  <img
                    src={formData.bannerImageURL}
                    alt="Store Banner Preview"
                    className="max-h-40 rounded border"
                    onError={(e) => {
                      e.target.src = ''; // Xóa ảnh nếu URL không hợp lệ
                      setError("Invalid image URL");
                    }}
                  />
                </div>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Enter a valid image URL (e.g. https://example.com/image.jpg)
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/sell")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create Store"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStore;
