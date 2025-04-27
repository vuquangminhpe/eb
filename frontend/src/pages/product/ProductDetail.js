import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Search, ArrowLeft } from "lucide-react";

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data);
        setEditData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  const [reviews, setReviews] = useState([]);

useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  fetchReviews();
}, [id]);


  const handleEdit = () => setShowEditModal(true);

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, editData);
      alert("Product updated successfully");
      setShowEditModal(false);
      navigate("/products");
    } catch (err) {
      alert("Error updating product: " + err.message);
    }
  };

  const handleHide = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}/hide`);
      alert("Product hidden successfully");
      navigate("/products");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      alert("Product deleted successfully");
      navigate("/products");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <>
      {/* HEADER */}
      <div className="border-b bg-white sticky top-0 z-40">
        <nav className="flex items-center justify-between max-w-[1200px] mx-auto py-5 px-3">
          <Link to="/products" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft size={20} />
            <span>Back to Products</span>
          </Link>
          <a href="/">
            <img width="120" src="/images/logo.svg" alt="Logo" />
          </a>
          <div className="w-full max-w-md">
            <div className="relative">

            </div>
          </div>
        </nav>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image || "photo.png"}
              alt={product.title}
              className="w-full h-80 object-cover mb-4"
            />
          </div>
          <div>
            {/* PRICE HIỂN THỊ (ở dưới hình ảnh) */}
            <p className="text-lg font-semibold">
              Price: ${((product.price || 0) / 100)}
            </p>

            <p className="text-md text-gray-600 mt-2">Category: {product.categoryId?.name || "N/A"}</p>
            <p className="text-md text-gray-600 mt-2">Quantity: {product.quantity}</p>
            <p className="text-md text-gray-600 mt-2">Description: {product.description || "No description available."}</p>

            <div className="mt-4 space-x-4">
              <button onClick={handleEdit} className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Edit</button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-md w-[90%] max-w-md shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                    <p className="mb-6 text-gray-700">Are you sure you want to delete this product?</p>
                    <div className="flex justify-end space-x-3">
                      <button onClick={() => setShowDeleteModal(false)} className="bg-gray-400 px-4 py-2 rounded">Cancel</button>
                      <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Yes, Delete</button>
                    </div>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
        {/* USER REVIEWS */}
<div className="mt-12">
  <h2 className="text-2xl font-bold mb-4">User Reviews</h2>
  {reviews.length === 0 ? (
    <p className="text-gray-500">No reviews yet.</p>
  ) : (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="border rounded p-4 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold">{review.reviewerId?.fullname || review.reviewerId?.username || "Anonymous"}</span>
            <span className="text-yellow-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
          </div>
          <p className="text-sm text-gray-700">{review.comment || "No comment."}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  )}
</div>


        {/* EDIT MODAL */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md w-[90%] max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">Edit Product</h2>
              <input
                className="w-full border p-2 mb-3"
                placeholder="Title"
                value={editData.title || ""}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
              <input
                className="w-full border p-2 mb-3"
                placeholder="Price"
                type="number"
                value={editData.price || ""}
                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              />
              <textarea
                className="w-full border p-2 mb-3"
                placeholder="Description"
                value={editData.description || ""}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowEditModal(false)} className="bg-gray-400 px-4 py-2 rounded">Cancel</button>
                <button onClick={handleSaveEdit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
