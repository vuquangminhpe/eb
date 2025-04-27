import React, { useState } from "react";

const PersonalInfo = ({ userInfo, onSave, onSaveAddress, addresses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Initialize form data with user info and potentially the default address
  const [formData, setFormData] = useState({
    username: userInfo?.username || '',
    fullname: userInfo?.fullname || '',
    email: userInfo?.email || '',
    // Address fields will be populated based on the selected address for editing
    addressId: '',
    address_fullName: '',
    address_phone: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_country: '',
    address_isDefault: false,
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null for new, address object for edit

  // Function to open the user info modal
  const openUserInfoModal = () => {
    setFormData({
      ...formData,
      username: userInfo.username,
      fullname: userInfo.fullname,
      email: userInfo.email,
    });
    setIsModalOpen(true);
  };

  // Function to open the address modal (for adding or editing)
  const openAddressModal = (addressToEdit = null) => {
    setEditingAddress(addressToEdit);
    if (addressToEdit) {
      // Populate form for editing existing address
      setFormData({
        ...formData, // Keep user details if needed, though not edited here
        addressId: addressToEdit._id,
        address_fullName: addressToEdit.fullName,
        address_phone: addressToEdit.phone,
        address_street: addressToEdit.street,
        address_city: addressToEdit.city,
        address_state: addressToEdit.state,
        address_country: addressToEdit.country,
        address_isDefault: addressToEdit.isDefault,
      });
    } else {
      // Reset form for adding new address
      setFormData({
        ...formData, // Keep user details
        addressId: '',
        address_fullName: userInfo.fullname || '', // Pre-fill with user's fullname
        address_phone: '',
        address_street: '',
        address_city: '',
        address_state: '',
        address_country: '',
        address_isDefault: addresses?.length === 0, // Default if it's the first address
      });
    }
    setIsAddressModalOpen(true);
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle saving user info (username, fullname, email)
  const handleUserInfoSubmit = (e) => {
    e.preventDefault();
    // Extract only user fields for saving
    const userInfoToSave = {
      username: formData.username,
      fullname: formData.fullname,
      email: formData.email,
    };
    onSave(userInfoToSave); // Call the main save function passed from Account
    setIsModalOpen(false);
  };

  // Handle saving address (add or update)
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    // Extract address fields
    const addressData = {
      fullName: formData.address_fullName,
      phone: formData.address_phone,
      street: formData.address_street,
      city: formData.address_city,
      state: formData.address_state,
      country: formData.address_country,
      isDefault: formData.address_isDefault,
    };
    onSaveAddress(addressData, editingAddress ? editingAddress._id : null); // Pass data and ID (if editing)
    setIsAddressModalOpen(false);
  };


  // If no user info is available yet, show loading or placeholder
  if (!userInfo) return <div>Loading personal information...</div>;

  return (
    <div className="border rounded p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-semibold">Thông tin cá nhân</h3>
        <button
          onClick={openUserInfoModal}
          className="text-blue-500 hover:underline text-sm"
        >
          Chỉnh sửa
        </button>
      </div>
      <p className="text-gray-600 mb-1">Tên người dùng: {userInfo.username}</p>
      <p className="text-gray-600 mb-1">Họ và tên: {userInfo.fullname || "Chưa cập nhật"}</p>
      <p className="text-gray-600 mb-3">Email: {userInfo.email}</p>

      <div className="flex justify-between items-start mb-2">
         <h4 className="text-md font-semibold">Sổ địa chỉ</h4>
         <button
            onClick={() => openAddressModal()} // Button to add new address
            className="text-blue-500 hover:underline text-sm"
          >
            Thêm địa chỉ
          </button>
      </div>
      {addresses && addresses.length > 0 ? (
        addresses.map(addr => (
          <div key={addr._id} className="border-t pt-2 mt-2 text-sm text-gray-600">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-medium">{addr.fullName} {addr.isDefault && <span className="text-xs text-green-600 font-normal">(Mặc định)</span>}</p>
                    <p>{addr.street}, {addr.city}</p>
                    <p>{addr.state}, {addr.country}</p>
                    <p>Điện thoại: {addr.phone}</p>
                </div>
                <button
                    onClick={() => openAddressModal(addr)} // Button to edit this address
                    className="text-blue-500 hover:underline text-xs ml-4 flex-shrink-0"
                >
                    Sửa
                </button>
                {/* Add delete button here if needed */}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">Chưa có địa chỉ nào.</p>
      )}


      {/* User Info Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cập nhật thông tin cá nhân</h3>
            <form onSubmit={handleUserInfoSubmit}>
              {/* Username, Fullname, Email fields */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tên người dùng</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
               <div className="mb-4">
                <label className="block text-gray-700 mb-1">Họ và tên</label>
                <input type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800"> Hủy </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"> Lưu thay đổi </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Add/Edit Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
            <form onSubmit={handleAddressSubmit}>
              {/* Address fields */}
               <div className="mb-4">
                <label className="block text-gray-700 mb-1">Họ và tên người nhận</label>
                <input type="text" name="address_fullName" value={formData.address_fullName} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Số điện thoại</label>
                <input type="tel" name="address_phone" value={formData.address_phone} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
               <div className="mb-4">
                <label className="block text-gray-700 mb-1">Địa chỉ (Số nhà, tên đường)</label>
                <input type="text" name="address_street" value={formData.address_street} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-gray-700 mb-1">Thành phố/Tỉnh</label>
                    <input type="text" name="address_city" value={formData.address_city} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                 </div>
                 <div>
                    <label className="block text-gray-700 mb-1">Quận/Huyện</label> {/* Assuming state maps to district/county */}
                    <input type="text" name="address_state" value={formData.address_state} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                 </div>
              </div>
               <div className="mb-4">
                <label className="block text-gray-700 mb-1">Quốc gia</label>
                <input type="text" name="address_country" value={formData.address_country} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input type="checkbox" name="address_isDefault" checked={formData.address_isDefault} onChange={handleInputChange} className="mr-2" disabled={addresses?.length === 1 && editingAddress?._id === addresses[0]._id && addresses[0].isDefault} />
                  <span>Đặt làm địa chỉ mặc định</span>
                </label>
              </div>
              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800"> Hủy </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"> {editingAddress ? 'Lưu thay đổi' : 'Thêm địa chỉ'} </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;