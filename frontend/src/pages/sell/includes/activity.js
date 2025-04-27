
"use client"
import { useNavigate } from "react-router-dom"
import React, { useState, useEffect } from "react"
import {
  FaShoppingBag,
  FaHistory,
  FaStore,
  FaRegBookmark,
  FaSearch,
  FaRegEye,
  FaRegHeart,
  FaTag,
  FaArrowRight,
  FaCheckCircle,
  FaRegClock,
  FaMoneyBillWave,
} from "react-icons/fa"

const Activity = ({ userRole }) => {
  const navigate = useNavigate()
  const isSeller = userRole === "seller"
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOnSale, setTotalOnSale] = useState(0)
  const [totalPurchasedProducts, setTotalPurchasedProducts] = useState(0)
  const userData = localStorage.getItem('currentUser')
  //lấy tổng số lượng đa bán
  useEffect(() => {
    const fetchTotalOnSale = async () => {
      if (isSeller) {
        const token = localStorage.getItem("token") // Assuming token is stored in localStorage
        try {
          const response = await fetch(`http://localhost:5000/api/products/seller/${JSON.parse(userData).id}/total-on-sale`)
          const data = await response.json()
          if (response.ok) {
            setTotalOnSale(data.totalDistinctProducts) // Set the total quantity from the response
          } else {
            console.error("Failed to fetch total-on-sale:", data.message)
          }
        } catch (error) {
          console.error("Error fetching total-on-sale:", error)
        }
      }
    }

    fetchTotalOnSale()
  }, [isSeller])
  
  //tổng số lượng đã mua
  useEffect(() => {
    const fetchTotalPurchasedProducts = async () => {
      const token = localStorage.getItem("token") // Assuming token is stored in localStorage
      try {
        const response = await fetch(`http://localhost:5000/api/products/buyer/${JSON.parse(userData).id}/total-purchased-products`)
        const data = await response.json()
        if (response.ok) {
          setTotalPurchasedProducts(data.totalQuantity) // Set the total quantity from the response
        } else {
          console.error("Failed to fetch total-purchased-products:", data.message)
        }
      } catch (error) {
        console.error("Error fetching total-purchased-products:", error)
      }
    }

    fetchTotalPurchasedProducts()
  }, [])
  //tổng doanh thu
  useEffect(() => {
    const fetchTotalRevenue = async () => {
      
      if (isSeller) {
        const token = localStorage.getItem("token") // Assuming token is stored in localStorage
        try {
          const response = await fetch(`http://localhost:5000/api/products/seller/${JSON.parse(userData).id}/sold-products`)
          const data = await response.json()
          if (response.ok) {
            setTotalRevenue(data.totalRevenue || 0) // Set the total revenue from the response
          } else {
            console.error("Failed to fetch total-revenue:", data.message)
          }
        } catch (error) {
          console.error("Error fetching total-revenue:", error)
        }
      }
    }

    fetchTotalRevenue()
  }, [isSeller])
  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">Hoạt động của tôi</h1>
          <p className="text-gray-600 mt-1">Theo dõi các hoạt động mua và bán hàng của bạn tại một nơi</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                <FaShoppingBag size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Sản phẩm đã mua</p>
                <p className="text-2xl font-semibold text-gray-900">{totalPurchasedProducts}</p>
              </div>
            </div>
          </div>

          {isSeller && (
            <>
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                    <FaStore size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sản phẩm đang bán</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalOnSale}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                    <FaMoneyBillWave size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                    <p className="text-2xl font-semibold text-gray-900">${totalRevenue}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Purchase History */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center">
                  <FaHistory className="text-gray-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Lịch sử mua hàng</h2>
                </div>
                <button
                  onClick={() => navigate("/order-history")}
                  className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium"
                >
                  Xem tất cả <FaArrowRight className="ml-1" size={12} />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                        <FaShoppingBag className="text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Tai nghe Bluetooth Sony</h3>
                        <p className="text-sm text-gray-500">Đã nhận: 15/03/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$89.99</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1" size={10} /> Hoàn thành
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                        <FaShoppingBag className="text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Bàn phím cơ Logitech</h3>
                        <p className="text-sm text-gray-500">Đang giao: 22/03/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$129.99</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FaRegClock className="mr-1" size={10} /> Đang giao
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mt-4">
                  Xem lại các đơn hàng đã mua và theo dõi trạng thái giao hàng.
                </p>
              </div>
            </div>

            {/* Selling - Only show for sellers */}
            {isSeller && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div className="flex items-center">
                    <FaStore className="text-gray-500 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">Bán hàng</h2>
                  </div>
                  <button
                    onClick={() => navigate("/sellerProduct")}
                    className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium"
                  >
                    Quản lý sản phẩm <FaArrowRight className="ml-1" size={12} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-blue-700">Đang bán</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          1
                        </span>
                      </div>
                      <ul className="space-y-2">
                        <li className="p-2 bg-white rounded border border-blue-100">
                          <p className="font-medium">Máy ảnh Canon EOS</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-blue-600 font-semibold">$450.00</span>
                            <span className="text-xs text-gray-500">Còn 3 ngày</span>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-green-700">Đã bán</h3>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          1
                        </span>
                      </div>
                      <ul className="space-y-2">
                        <li className="p-2 bg-white rounded border border-green-100">
                          <p className="font-medium">Áo khoác da</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-green-600 font-semibold">$120.00</span>
                            <span className="text-xs text-gray-500">20/03/2025</span>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-red-700">Chưa thanh toán</h3>
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          1
                        </span>
                      </div>
                      <ul className="space-y-2">
                        <li className="p-2 bg-white rounded border border-red-100">
                          <p className="font-medium">Đồng hồ thông minh</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-red-600 font-semibold">$200.00</span>
                            <span className="text-xs text-red-500">Chưa thanh toán</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Tổng doanh thu</h3>
                      <p className="text-sm text-gray-500">Từ trước đến nay</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${totalRevenue}</p>
                      <button
                        onClick={() => navigate("/totalSell")}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          
        </div>
      </div>
    </div>
  )
}

export default Activity

