import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    image: "",
    categoryId: "",
    description: "",
    quantity: "", // Thêm quantity vào state
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const sellerId = currentUser?.role === "seller" ? currentUser.id : null;

  useEffect(() => {
    if (!sellerId) return;

    fetch(`http://localhost:5000/api/products?sellerId=${sellerId}`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, [sellerId]);

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProduct = async () => {
    try {
      if (!sellerId) {
        console.error("Seller ID is required but not found.");
        return;
      }
  
      const productData = {
        title: newProduct.title,
        description: newProduct.description,
        price: parseFloat(newProduct.price) * 100, // Price in cents
        image: newProduct.image,
        categoryId: newProduct.categoryId,
        sellerId,
      };
  
      // First, create the product without quantity
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // Create the inventory record with quantity
        const inventoryData = {
          productId: data._id,  // Use product ID from the newly created product
          quantity: parseInt(newProduct.quantity) || 0,
        };
  
        // Send the inventory data to a separate endpoint
        await fetch("http://localhost:5000/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inventoryData),
        });
  
        // Refresh the product list
        fetch(`http://localhost:5000/api/products?sellerId=${sellerId}`)
          .then(res => res.json())
          .then(data => setProducts(data))
          .catch(err => console.error("Error fetching updated products:", err));
  
        setShowModal(false);
        setNewProduct({
          title: "",
          price: "",
          image: "",
          categoryId: "",
          description: "",
          quantity: "",
        });
      } else {
        console.error("Error adding product:", data.error);
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };
  
  
  return (
    <>
      {/* HEADER + SEARCH */}
      <div className="border-b">
        <nav className="flex items-center justify-between w-full mx-auto max-w-[1200px]">
          <div className="flex items-center w-full bg-white">
            <div className="flex justify-between gap-10 max-w-[1150px] w-full px-3 py-5 mx-auto">
              <a href="/">
                <img width="120" src="/images/logo.svg" alt="Logo" />
              </a>
              <div className="w-full">
                <div className="relative">
                  <div className="flex items-center w-full">
                    <div className="relative flex items-center border-2 border-gray-900 w-full p-2">
                      <Search size={22} />
                      <input
                        className="w-full placeholder-gray-400 text-sm pl-3 focus:outline-none"
                        placeholder="Search for anything"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  {searchQuery.length > 0 && (
                    <div className="absolute bg-white max-w-[910px] w-full z-20 left-0 top-12 border p-1">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                          <div key={product._id} className="p-1">
                            <Link
                              to={`/product/${product._id}`}
                              className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-200 p-1 px-2"
                            >
                              <div className="truncate ml-2">{product.title}</div>
                              <div className="truncate">${(product.price / 100)}</div>
                            </Link>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No products found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* PRODUCT LIST */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">All Products</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="border p-4 rounded hover:shadow-md">
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.title}
                  className="w-full h-40 object-cover mb-2"
                />
                <h2 className="font-semibold text-sm">{product.title}</h2>
                <p className="text-gray-600 text-sm">${(product.price / 100)}</p>
                <p className="text-xs text-gray-500">{product.quantity} available</p>
              </Link>
            ))
          ) : (
            <p>No products available</p>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold mb-2">Add New Product</h2>

            <input
              type="text"
              placeholder="Title"
              className="w-full border p-2 rounded"
              value={newProduct.title}
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              className="w-full border p-2 rounded"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <input
              type="text"
              placeholder="Image URL"
              className="w-full border p-2 rounded"
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
            />
            <select
              className="w-full border p-2 rounded"
              value={newProduct.categoryId}
              onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
            >
              <option value="">-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <textarea
              placeholder="Description"
              className="w-full border p-2 rounded"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              className="w-full border p-2 rounded"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleCreateProduct}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
