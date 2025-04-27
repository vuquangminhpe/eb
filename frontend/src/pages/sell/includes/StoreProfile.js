import React, { useState, useEffect } from "react";

const StoreProfile = ({ storeInfo, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Initialize with storeInfo or defaults if no store exists yet
  const [formData, setFormData] = useState({
    storeName: storeInfo?.storeName || "",
    description: storeInfo?.description || "",
    bannerImageURL: storeInfo?.bannerImageURL || "",
  });

  // Update local form state when storeInfo prop changes
  useEffect(() => {
    setFormData({
      storeName: storeInfo?.storeName || "",
      description: storeInfo?.description || "",
      bannerImageURL: storeInfo?.bannerImageURL || "",
    });
  }, [storeInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Call the save function passed from Account
    setIsModalOpen(false);
  };

  return (
    <div className="border rounded p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-semibold">Hồ sơ cửa hàng</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-blue-500 hover:underline text-sm"
        >
          {storeInfo ? "Chỉnh sửa" : "Tạo cửa hàng"} {/* Change button text */}
        </button>
      </div>
      {storeInfo ? (
        <>
          <p className="text-gray-600 mb-1">
            Tên cửa hàng: {storeInfo.storeName}
          </p>
          <p className="text-gray-600 mb-1">
            Mô tả: {storeInfo.description || "Chưa có mô tả"}
          </p>
          {storeInfo.bannerImageURL && (
            <div className="mt-2">
              <p className="text-gray-600 mb-1">Ảnh bìa:</p>
              <img
                src={storeInfo.bannerImageURL}
                alt="Store Banner"
                className="max-w-xs max-h-32 object-cover rounded"
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">
          Bạn chưa tạo cửa hàng. Hãy tạo hồ sơ cửa hàng để bắt đầu bán.
        </p>
      )}

      {/* Store Profile Update/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {storeInfo ? "Cập nhật hồ sơ cửa hàng" : "Tạo cửa hàng mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tên cửa hàng</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">URL Ảnh bìa</label>
                <input
                  type="url"
                  name="bannerImageURL"
                  value={formData.bannerImageURL}
                  onChange={handleInputChange}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {" "}
                  Hủy{" "}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {" "}
                  {storeInfo ? "Lưu thay đổi" : "Tạo cửa hàng"}{" "}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreProfile;
