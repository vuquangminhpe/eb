import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState(null);
  const [editedQuantities, setEditedQuantities] = useState({});

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser?.role === "seller") {
      setSellerId(currentUser.id);
    }
  }, []);

  useEffect(() => {
    if (!sellerId) return;

    fetch("http://localhost:5000/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        const filteredData = data.filter(
          (item) => item.productId?.sellerId === sellerId
        );
        setInventory(filteredData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching inventory:", err);
        setLoading(false);
      });
  }, [sellerId]);

  const filteredInventory = inventory.filter((item) =>
    item.productId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (itemId, value) => {
    setEditedQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleUpdate = async (item) => {
    const newQuantity = parseInt(editedQuantities[item._id]);
    if (isNaN(newQuantity) || newQuantity < 0) {
      alert("Số lượng không hợp lệ");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/inventory/${item.productId._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (!response.ok) throw new Error("Lỗi khi cập nhật");

      const updatedItem = await response.json();
      setInventory((prev) =>
        prev.map((inv) =>
          inv._id === item._id
            ? { ...inv, quantity: updatedItem.quantity }
            : inv
        )
      );
      alert("Cập nhật thành công");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi cập nhật");
    }
  };

  return (
    <>
      {/* HEADER + SEARCH như ProductList */}
      <div className="border-b mb-6">
        <nav className="flex items-center justify-between w-full mx-auto max-w-[1200px]">
          <div className="flex items-center w-full bg-white">
            <div className="flex justify-between gap-10 max-w-[1150px] w-full px-3 py-5 mx-auto">
              <Link to="/">
                <img width="120" src="/images/logo.svg" alt="Logo" />
              </Link>
              <div className="w-full">
                <div className="relative">
                  <div className="flex items-center w-full">
                    <div className="relative flex items-center border-2 border-gray-900 w-full p-2">
                      <Search size={22} />
                      <input
                        className="w-full placeholder-gray-400 text-sm pl-3 focus:outline-none"
                        placeholder="Search inventory"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  {searchQuery.length > 0 && (
                    <div className="absolute bg-white max-w-[910px] w-full z-20 left-0 top-12 border p-1">
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                          <div key={item._id} className="p-1">
                            <div className="flex justify-between w-full px-2 py-1 hover:bg-gray-200">
                              <span>{item.productId?.title}</span>
                              <span>Số lượng: {item.quantity}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">
                          Không tìm thấy sản phẩm
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* MAIN TABLE */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Product Image</th>
                  <th className="px-4 py-2 border">Product Name</th>
                  <th className="px-4 py-2 border">Current Quantity</th>
                  <th className="px-4 py-2 border">Edit Quantity</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-2 border">
                        <img
                          src={item.productId?.image || "/placeholder.jpg"}
                          alt={item.productId?.title || "Product Image"}
                          className="w-20 h-20 object-cover"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        {item.productId?.title || "No Title"}
                      </td>
                      <td className="px-4 py-2 border">{item.quantity}</td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          min="0"
                          className="w-24 border p-1 rounded"
                          value={
                            editedQuantities[item._id] !== undefined
                              ? editedQuantities[item._id]
                              : item.quantity
                          }
                          onChange={(e) =>
                            handleInputChange(item._id, e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleUpdate(item)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Cập nhật
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 text-center border">
                      No inventory available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
