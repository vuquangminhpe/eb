import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function InventoryDetail() {
  const { inventoryId } = useParams();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/inventory/${inventoryId}`)
      .then(res => res.json())
      .then(data => {
        setInventory(data);
        setQuantity(data.quantity);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching inventory details:", err);
        setLoading(false);
      });
  }, [inventoryId]);

  const handleUpdateQuantity = async () => {
    try {
      const updatedInventory = {
        quantity: parseInt(quantity) || 0,
      };

      const res = await fetch(`http://localhost:5000/api/inventory/${inventoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInventory),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Inventory updated successfully!");
        setInventory(data);
      } else {
        alert("Failed to update inventory.");
      }
    } catch (err) {
      console.error("Error updating inventory:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="border p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">{inventory.product.title}</h2>
          <img
            src={inventory.product.image || "/placeholder.jpg"}
            alt={inventory.product.title}
            className="w-full h-64 object-cover mb-4"
          />
          <p className="text-sm text-gray-600">Price: £{(inventory.product.price / 100).toFixed(2)}</p>
          <p className="text-sm text-gray-500">Category: {inventory.product.categoryId.name}</p>
          <p className="text-xs text-gray-500">Current Quantity: {inventory.quantity}</p>
          <div className="my-4">
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              placeholder="Update quantity"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleUpdateQuantity}
            >
              Update Quantity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
