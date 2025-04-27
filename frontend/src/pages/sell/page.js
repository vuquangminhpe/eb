import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Activity from "./includes/activity";
import Messages from "./includes/messages";
import Coupon from "../coupon/coupon";
import PendingOrder from "../pendingOrder/pendingOrder";
import Shipping from "../shipping/shipping";
import Account from "./includes/account";
import MainHeader from "../../components/MainHeader";
import TopMenu from "../../components/TopMenu";
import SubMenu from "../../components/SubMenu";

const Sell = () => {
  const [activeTab, setActiveTab] = useState("Activity");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOnSale, setTotalOnSale] = useState(0)
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSellerRegistrationModal, setShowSellerRegistrationModal] =
    useState(false);
  const [error, setError] = useState("");
  const [store, setStore] = useState(null);
  const navigate = useNavigate();
  const userData = localStorage.getItem('currentUser')

  // Get user and store data
  useEffect(() => {
    const fetchData = async () => {
      const user = localStorage.getItem("currentUser");
      if (user) {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);

        if (parsedUser.role === "seller") {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(
              "http://localhost:5000/api/auth/store",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const data = await response.json();
            if (response.ok) {
              setStore(data.store);
            }
          } catch (error) {
            console.error("Error fetching store:", error);
          }
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
      const fetchTotalOnSale = async () => {
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
  
      fetchTotalOnSale()
    }, [])

  useEffect(() => {
      const fetchTotalRevenue = async () => {
        
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
  
      fetchTotalRevenue()
    }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate("/auth");
    }
  }, [currentUser, isLoading, navigate]);

  // Define tabs based on user role
  const getTabs = () => {
    const commonTabs = ["Messages", "Account"];

    if (!currentUser || currentUser.role === "buyer") {
      return ["Activity", ...commonTabs];
    } else {
      return ["Activity", ...commonTabs, "Coupon", "Pending Order", "Shipping"];
    }
  };

  // Map tab names to their respective components
  const tabComponents = {
    Activity: <Activity userRole={currentUser?.role} />,
    Messages: <Messages />,
    Account: <Account />,
    Coupon: <Coupon />,
    "Pending Order": <PendingOrder />,
    Shipping: <Shipping />,
  };

  // Function to handle seller registration
  const handleNavigateToCreateStore = () => {
    navigate("/create-store");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  // Modify the seller content section
  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      {/* Header Section from MainLayout */}
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      {/* Main Content */}
      <div className="flex p-4">
        {/* Main Content Area */}
        <div className="w-3/4 pr-4">
          <h1 className="text-2xl font-bold mb-4">
            {currentUser.role === "seller" ? "Seller Dashboard" : "My eBay"}
          </h1>

          {currentUser.role === "seller" ? (
            store?.status === "approved" ? (
              // Seller Dashboard content for approved sellers
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Sản phẩm đang bán
                  </h3>
                  <p className="text-3xl font-bold mt-2">{totalOnSale}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Tổng doanh thu
                  </h3>
                  <p className="text-3xl font-bold mt-2">${totalRevenue}</p>
                </div>
              </div>
            ) : (
              // Message for pending/rejected sellers
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                {store?.status === "pending" ? (
                  <p>
                    Cửa hàng của bạn đang chờ được phê duyệt. Vui lòng đợi quản
                    trị viên xem xét.
                  </p>
                ) : (
                  <p>
                    Yêu cầu mở cửa hàng của bạn đã bị từ chối. Vui lòng liên hệ
                    quản trị viên để biết thêm chi tiết.
                  </p>
                )}
              </div>
            )
          ) : (
            // Buyer content - Register as Seller banner
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg shadow mb-6 text-white">
              <h3 className="text-xl font-bold mb-2">
                Bắt đầu bán hàng trên eBay
              </h3>
              <p className="mb-4">
                Tiếp cận hàng triệu người mua và phát triển doanh nghiệp của
                bạn.
              </p>
              <button
                onClick={handleNavigateToCreateStore}
                className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Đăng ký làm người bán
              </button>
            </div>
          )}

          <div className="flex space-x-4 mb-4">
            {getTabs().map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`p-2 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-700 hover:text-blue-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Render the selected tab's component */}
          <div>{tabComponents[activeTab]}</div>
        </div>

        {/* Right Sidebar */}
        <div className="w-1/4 pl-4">
          <div className="p-4 border rounded">
            <h3 className="text-lg font-bold mb-2">
              Chat with an expert Online Now
            </h3>
            <p className="text-gray-600 mb-2">
              A Technician Will Answer Your Questions in Minutes. Chat Now.
            </p>
            <img
              src="https://via.placeholder.com/50"
              alt="Support Agent"
              className="rounded-full mb-2"
            />
            <p className="text-sm text-gray-500">JustAnswer</p>
            <button className="mt-2 bg-blue-500 text-white p-2 rounded flex items-center justify-between w-full">
              Open <span>▶</span>
            </button>
          </div>
          <div className="mt-4 text-right">
            <a href="#" className="text-blue-500">
              Tell us what you think
            </a>
            <span className="ml-2 text-gray-500">mi_123456 (0) 🗨️</span>
          </div>
        </div>
      </div>

      {/* Seller Registration Modal */}
      {showSellerRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Đăng ký trở thành người bán
            </h2>
            <p className="mb-4">
              Bằng cách đăng ký làm người bán, bạn đồng ý với các điều khoản và
              điều kiện của eBay dành cho người bán.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSellerRegistrationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleNavigateToCreateStore}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sell;
