"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import MainHeader from "../../components/MainHeader"
import TopMenu from "../../components/TopMenu"
import SubMenu from "../../components/SubMenu"
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaGavel,
  FaEye,
  FaChartLine,
  FaTimes,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa"

const SellerProducts = () => {
  const navigate = useNavigate()
  const [sellerData, setSellerData] = useState(null)
  const [productsDetails, setProductsDetails] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: 1,
    url: "",
    status: "available",
    isAuction: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [auctionBids, setAuctionBids] = useState([])
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("idProduct")
  const [sortDirection, setSortDirection] = useState("asc")

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.id) {
        setError("Vui lòng đăng nhập để xem sản phẩm của bạn.")
        setLoading(false)
        return
      }

      try {
        const sellerResponse = await fetch(`http://localhost:9999/sellerProduct?userId=${currentUser.id}`)
        if (!sellerResponse.ok) {
          throw new Error(`Không thể lấy danh sách sản phẩm của người bán`)
        }
        const sellerData = await sellerResponse.json()
        const seller = Array.isArray(sellerData)
          ? sellerData.find((item) => item.userId === currentUser.id)
          : sellerData
        if (!seller) {
          throw new Error("Không tìm thấy dữ liệu sản phẩm cho người dùng này.")
        }
        setSellerData(seller)

        const productIds = seller.products.map((p) => p.idProduct)
        if (productIds.length > 0) {
          const productsResponse = await fetch("http://localhost:9999/products")
          if (!productsResponse.ok) {
            throw new Error(`Không thể lấy chi tiết sản phẩm`)
          }
          const allProducts = await productsResponse.json()
          const filteredProducts = allProducts.filter((product) => productIds.includes(product.id))
          setProductsDetails(filteredProducts)
        }
      } catch (err) {
        console.error("Fetch Error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser])

  const generateNewProductId = async () => {
    try {
      const response = await fetch("http://localhost:9999/products")
      if (!response.ok) throw new Error("Không thể lấy danh sách sản phẩm.")
      const allProducts = await response.json()
      const existingIds = allProducts.map((p) => Number.parseInt(p.id.replace("prod", "")))
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0
      return `prod${maxId + 1}`
    } catch (err) {
      console.error("Error generating ID:", err)
      return `prod${Date.now()}`
    }
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!currentUser || !currentUser.id) {
      alert("Vui lòng đăng nhập để thực hiện thao tác này.")
      return
    }

    const isEditing = !!editingProduct
    let productToSave

    if (isEditing) {
      productToSave = { ...editingProduct, id: editingProduct.idProduct }
    } else {
      const newId = await generateNewProductId()
      productToSave = {
        id: newId,
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price,
        quantity: newProduct.quantity,
        categoryId: newProduct.categoryId,
        url: newProduct.url,
        status: newProduct.status,
        isAuction: newProduct.isAuction,
      }
    }

    try {
      const productMethod = isEditing ? "PUT" : "POST"
      const productUrl = isEditing
        ? `http://localhost:9999/products/${productToSave.id}`
        : "http://localhost:9999/products"
      const productResponse = await fetch(productUrl, {
        method: productMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSave),
      })
      if (!productResponse.ok) throw new Error("Không thể lưu chi tiết sản phẩm.")
      const savedProduct = await productResponse.json()

      const updatedSellerProducts = isEditing
        ? sellerData.products.map((p) =>
            p.idProduct === productToSave.id ? { ...p, status: productToSave.status } : p,
          )
        : [...sellerData.products, { idProduct: productToSave.id, status: productToSave.status }]
      const updatedSellerData = { ...sellerData, products: updatedSellerProducts }

      const sellerResponse = await fetch(`http://localhost:9999/sellerProduct/${sellerData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSellerData),
      })
      if (!sellerResponse.ok) throw new Error("Không thể cập nhật danh sách sản phẩm.")

      setSellerData(updatedSellerData)
      setProductsDetails(
        isEditing
          ? productsDetails.map((p) => (p.id === savedProduct.id ? savedProduct : p))
          : [...productsDetails, savedProduct],
      )
      setIsModalOpen(false)
      setEditingProduct(null)
      setNewProduct({
        title: "",
        description: "",
        price: 0,
        quantity: 0,
        categoryId: 1,
        url: "",
        status: "available",
        isAuction: false,
      })
    } catch (err) {
      console.error("Save Error:", err)
      alert("Không thể lưu sản phẩm: " + err.message)
    }
  }

  const handleDeleteProduct = async (idProduct) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return

    try {
      const productResponse = await fetch(`http://localhost:9999/products/${idProduct}`, {
        method: "DELETE",
      })
      if (!productResponse.ok) throw new Error("Không thể xóa sản phẩm.")

      const updatedProducts = sellerData.products.filter((p) => p.idProduct !== idProduct)
      const updatedSellerData = { ...sellerData, products: updatedProducts }

      const sellerResponse = await fetch(`http://localhost:9999/sellerProduct/${sellerData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSellerData),
      })
      if (!sellerResponse.ok) throw new Error("Không thể cập nhật danh sách sản phẩm.")

      setSellerData(updatedSellerData)
      setProductsDetails(productsDetails.filter((p) => p.id !== idProduct))
    } catch (err) {
      console.error("Delete Error:", err)
      alert("Không thể xóa sản phẩm: " + err.message)
    }
  }

  const handleEditProduct = (product) => {
    const detailedProduct = productsDetails.find((p) => p.id === product.idProduct)
    setEditingProduct({
      idProduct: product.idProduct,
      title: detailedProduct?.title || "",
      description: detailedProduct?.description || "",
      price: detailedProduct?.price || 0,
      quantity: detailedProduct?.quantity || 0,
      categoryId: detailedProduct?.categoryId || 1,
      url: detailedProduct?.url || "",
      status: product.status,
      isAuction: detailedProduct?.isAuction || false,
    })
    setIsModalOpen(true)
  }

  const handleToggleAuction = async (idProduct) => {
    try {
      const productToUpdate = productsDetails.find((p) => p.id === idProduct)
      if (!productToUpdate) throw new Error("Không tìm thấy sản phẩm.")

      const newAuctionStatus = !productToUpdate.isAuction
      const updatedProduct = { ...productToUpdate, isAuction: newAuctionStatus }

      const response = await fetch(`http://localhost:9999/products/${idProduct}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAuction: newAuctionStatus }),
      })
      if (!response.ok) throw new Error("Không thể cập nhật trạng thái đấu giá.")

      setProductsDetails(productsDetails.map((p) => (p.id === idProduct ? updatedProduct : p)))
      alert(`Đã ${newAuctionStatus ? "bật" : "tắt"} chế độ đấu giá cho sản phẩm ${idProduct}`)
    } catch (err) {
      console.error("Toggle Auction Error:", err)
      alert("Không thể thay đổi trạng thái đấu giá: " + err.message)
    }
  }

  const handleViewBids = async (idProduct) => {
    try {
      // Lấy danh sách đấu giá cho sản phẩm
      const bidsResponse = await fetch(`http://localhost:9999/auctionBids?productId=${idProduct}`)
      if (!bidsResponse.ok) throw new Error("Không thể lấy danh sách đấu giá.")
      const bids = await bidsResponse.json()

      // Lấy thông tin người dùng từ API user
      const usersResponse = await fetch("http://localhost:9999/user")
      if (!usersResponse.ok) throw new Error("Không thể lấy danh sách người dùng.")
      const users = await usersResponse.json()

      // Kết hợp bids với fullname của người dùng
      const enrichedBids = bids.map((bid) => {
        const user = users.find((u) => u.id === bid.userId)
        return {
          ...bid,
          fullname: user ? user.fullname : bid.userId, // Nếu không tìm thấy user, dùng userId làm fallback
        }
      })

      // Sắp xếp theo bidAmount từ cao đến thấp
      const sortedBids = enrichedBids.sort((a, b) => b.bidAmount - a.bidAmount)
      setAuctionBids(sortedBids)
      setSelectedProductId(idProduct)
      setIsBidModalOpen(true)
    } catch (err) {
      console.error("View Bids Error:", err)
      alert("Không thể lấy danh sách đấu giá: " + err.message)
    }
  }

  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(newDirection)
  }

  const getSortIcon = (field) => {
    if (field !== sortField) return <FaSort className="inline ml-1" />
    return sortDirection === "asc" ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />
  }

  const filteredProducts =
    sellerData?.products.filter((product) => {
      const detail = productsDetails.find((p) => p.id === product.idProduct) || {}
      return (
        product.idProduct?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }) || []

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const detailA = productsDetails.find((p) => p.id === a.idProduct) || {}
    const detailB = productsDetails.find((p) => p.id === b.idProduct) || {}

    let valueA, valueB

    switch (sortField) {
      case "idProduct":
        valueA = a.idProduct
        valueB = b.idProduct
        break
      case "title":
        valueA = detailA.title || ""
        valueB = detailB.title || ""
        break
      case "price":
        valueA = detailA.price || 0
        valueB = detailB.price || 0
        break
      case "quantity":
        valueA = detailA.quantity || 0
        valueB = detailB.quantity || 0
        break
      case "status":
        valueA = a.status || ""
        valueB = b.status || ""
        break
      default:
        valueA = a.idProduct
        valueB = b.idProduct
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Có sẵn</span>
      case "sold":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Đã bán</span>
      case "unavailable":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Không có sẵn</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>
    }
  }

  if (!currentUser || !currentUser.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Chưa đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để quản lý sản phẩm của bạn.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!sellerData || !sellerData.products) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Không có dữ liệu</h2>
          <p className="text-gray-600 mb-6">Không tìm thấy dữ liệu sản phẩm cho tài khoản của bạn.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                <p className="mt-1 text-sm text-gray-500">Quản lý danh sách sản phẩm của bạn (ID: {currentUser.id})</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setEditingProduct(null)
                    setIsModalOpen(true)
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <FaPlus className="mr-2" /> Thêm sản phẩm
                </button>
                <button
                  onClick={() => navigate("/totalSell")}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <FaChartLine className="mr-2" /> Xem doanh thu
                </button>
              </div>
            </div>

            {/* Search and filter */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hình ảnh
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("idProduct")}
                  >
                    ID Sản phẩm {getSortIcon("idProduct")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("title")}
                  >
                    Tên {getSortIcon("title")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mô tả
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    Giá (£) {getSortIcon("price")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("quantity")}
                  >
                    Số lượng {getSortIcon("quantity")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    Trạng thái {getSortIcon("status")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Đấu giá
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-10 text-center text-sm text-gray-500">
                      {searchTerm ? "Không tìm thấy sản phẩm phù hợp." : "Chưa có sản phẩm nào."}
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map((product) => {
                    const detail = productsDetails.find((p) => p.id === product.idProduct) || {}
                    return (
                      <tr key={product.idProduct} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {detail.url ? (
                            <img
                              src={`${detail.url}/100`}
                              alt={detail.title}
                              className="w-16 h-16 object-cover rounded-md border border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                              N/A
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.idProduct}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.title || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {detail.description || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          £{(detail.price / 100 || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.quantity || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {detail.isAuction ? (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Đang đấu giá
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              Không
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Sửa sản phẩm"
                            >
                              <FaEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.idProduct)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Xóa sản phẩm"
                            >
                              <FaTrashAlt className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleToggleAuction(product.idProduct)}
                              className={`${
                                detail.isAuction
                                  ? "text-yellow-600 hover:text-yellow-900"
                                  : "text-green-600 hover:text-green-900"
                              } transition-colors`}
                              title={detail.isAuction ? "Tắt đấu giá" : "Bật đấu giá"}
                            >
                              <FaGavel className="h-5 w-5" />
                            </button>
                            {detail.isAuction && (
                              <button
                                onClick={() => handleViewBids(product.idProduct)}
                                className="text-purple-600 hover:text-purple-900 transition-colors"
                                title="Xem xếp hạng đấu giá"
                              >
                                <FaEye className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingProduct(null)
                }}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6">
              {editingProduct && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Sản phẩm</label>
                  <input
                    type="text"
                    value={editingProduct.idProduct}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  value={editingProduct ? editingProduct.title : newProduct.title}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, title: e.target.value })
                      : setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ví dụ: Brown Leather Bag"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={editingProduct ? editingProduct.description : newProduct.description}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, description: e.target.value })
                      : setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ví dụ: Handcrafted genuine leather bag..."
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (penny)</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, price: Number.parseInt(e.target.value) })
                        : setNewProduct({ ...newProduct, price: Number.parseInt(e.target.value) })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ví dụ: 2500 (25.00 GBP)"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.quantity : newProduct.quantity}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, quantity: Number.parseInt(e.target.value) })
                        : setNewProduct({ ...newProduct, quantity: Number.parseInt(e.target.value) })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ví dụ: 10"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Danh mục</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.categoryId : newProduct.categoryId}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({
                            ...editingProduct,
                            categoryId: Number.parseInt(e.target.value),
                          })
                        : setNewProduct({ ...newProduct, categoryId: Number.parseInt(e.target.value) })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={editingProduct ? editingProduct.status : newProduct.status}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, status: e.target.value })
                        : setNewProduct({ ...newProduct, status: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="available">Có sẵn</option>
                    <option value="sold">Đã bán</option>
                    <option value="unavailable">Không có sẵn</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                <input
                  type="text"
                  value={editingProduct ? editingProduct.url : newProduct.url}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, url: e.target.value })
                      : setNewProduct({ ...newProduct, url: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ví dụ: https://picsum.photos/id/7"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingProduct(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingProduct ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auction Bids Modal */}
      {isBidModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Xếp hạng đấu giá - {selectedProductId}</h3>
              <button
                onClick={() => setIsBidModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {auctionBids.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có giá thầu nào cho sản phẩm này.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Người đấu giá
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Giá thầu (£)
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Thời gian
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auctionBids.map((bid, index) => (
                        <tr key={bid.id} className={index === 0 ? "bg-yellow-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bid.fullname}
                            {index === 0 && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Cao nhất
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            £{(bid.bidAmount / 100).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(bid.bidDate).toLocaleString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsBidModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerProducts

