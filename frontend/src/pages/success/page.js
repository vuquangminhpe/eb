import { CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Success() {
  // Lấy dữ liệu từ Checkout qua useLocation
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems = [], addressDetails = {}, orderTotal = 0 } = location.state || {};

  return (
    <div id="SuccessPage" className="mt-12 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
      <div className="bg-white w-full p-6 min-h-[150px] flex flex-col items-center">
        {/* Thông báo thành công */}
        <div className="flex items-center text-xl mb-6">
          <CheckCircle className="text-green-500 h-8 w-8" />
          <span className="pl-4 font-semibold">Payment Successful</span>
        </div>

        <div className="w-full max-w-[800px]">
          {/* Thông tin hóa đơn */}
          <div className="border-b pb-4 mb-6">
            <h2 className="text-lg font-semibold">Order Confirmation</h2>
            <p className="text-sm text-gray-600">
              Thank you! We've received your payment. Here are your order details:
            </p>
          </div>

          {/* Danh sách sản phẩm (Order Summary) */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Order Summary</h3>
            {cartItems.length > 0 ? (
              <div className="border rounded-lg p-4">
                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center justify-between border-b py-2 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`${item.url}/100`}
                        alt={item.title}
                        className="w-[60px] h-[60px] object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">
                      £{(item.price * item.quantity / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between mt-4 pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-lg">
                    £{(orderTotal / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No items in your order.</p>
            )}
          </div>

          {/* Địa chỉ giao hàng (Shipping Address) */}
          {addressDetails && Object.keys(addressDetails).length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">Shipping Address</h3>
              <div className="border rounded-lg p-4 text-sm">
                <p>{addressDetails.name}</p>
                <p>{addressDetails.address}</p>
                <p>
                  {addressDetails.city}, {addressDetails.zipcode}
                </p>
                <p>{addressDetails.country}</p>
              </div>
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex justify-center gap-4">
            <a
              href="/"
              className="bg-blue-600 text-sm font-semibold text-white p-3 rounded-full hover:bg-blue-700 px-6"
            >
              Back to Shop
            </a>
            <button
              onClick={() => navigate("/order-history")}
              className="bg-green-600 text-sm font-semibold text-white p-3 rounded-full hover:bg-green-700 px-6"
            >
              View Order History
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-200 text-sm font-semibold text-gray-800 p-3 rounded-full hover:bg-gray-300 px-6"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}