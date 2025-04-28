import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Footer from "../../components/Footer";
import SubMenu from "../../components/SubMenu";
import MainHeader from "../../components/MainHeader";
import TopMenu from "../../components/TopMenu";
import { React } from "react";
// Định nghĩa CheckoutItem

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [addressDetails, setAddressDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  console.log("cartItems", cartItems);
  console.log("addressDetails", addressDetails);

  // Sử dụng useRef để tránh re-render không cần thiết
  const currentUserRef = useRef(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  const cartItemsRef = useRef([]);
  const addressDetailsRef = useRef(null);
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);

  // Cập nhật ref khi state thay đổi
  useEffect(() => {
    cartItemsRef.current = cartItems;
    addressDetailsRef.current = addressDetails;
  }, [cartItems, addressDetails]);

  // Memoized function để fetch cart items
  const fetchCartItems = useCallback(async () => {
    // Nếu đang fetch hoặc component unmounted, không tiếp tục
    if (
      fetchingRef.current ||
      !isMountedRef.current ||
      !currentUserRef.current
    ) {
      return;
    }

    fetchingRef.current = true;
    try {
      const cartResponse = await fetch(
        `http://localhost:9999/shoppingCart?userId=${currentUserRef.current.id}`
      );
      if (!cartResponse.ok) {
        throw new Error(`Failed to fetch cart: ${cartResponse.status}`);
      }
      const cartData = await cartResponse.json();

      if (!cartData || cartData.length === 0) {
        if (isMountedRef.current) {
          setCartItems([]);
        }
        return;
      }

      const itemsWithDetails = await Promise.all(
        cartData.flatMap((cartItem) =>
          cartItem.productId.map(async (product) => {
            try {
              const productResponse = await fetch(
                `http://localhost:9999/products?id=${product.idProduct}`
              );
              if (!productResponse.ok) return null;

              const productData = await productResponse.json();
              let productInfo = Array.isArray(productData)
                ? productData[0]
                : productData;

              if (productInfo) {
                return {
                  ...productInfo,
                  quantity: parseInt(product.quantity),
                  idProduct: product.idProduct,
                  cartItemId: cartItem.id,
                };
              }
              return null;
            } catch (err) {
              return null;
            }
          })
        )
      );

      const filteredItems = itemsWithDetails.filter((item) => item !== null);

      // Chỉ cập nhật state nếu dữ liệu mới khác dữ liệu cũ
      if (isMountedRef.current) {
        // So sánh dữ liệu mới và dữ liệu cũ
        const currentItems = JSON.stringify(cartItemsRef.current);
        const newItems = JSON.stringify(filteredItems);

        if (currentItems !== newItems) {
          setCartItems(filteredItems);
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        setCartItems([]);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Memoized function để fetch địa chỉ
  const fetchAddressDetails = useCallback(async () => {
    if (!currentUserRef.current || !isMountedRef.current) return;

    try {
      const userResponse = await fetch(
        `http://localhost:9999/user?id=${currentUserRef.current.id}`
      );
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user: ${userResponse.status}`);
      }
      const userData = await userResponse.json();
      const user = userData.find(
        (user) => user.id === currentUserRef.current.id
      );

      if (user) {
        const newAddressDetails = {
          name: user.fullname,
          address: user.address?.street || "N/A",
          zipcode: user.address?.zipcode || "N/A",
          city: user.address?.city || "N/A",
          country: user.address?.country || "N/A",
        };

        // Chỉ cập nhật state nếu dữ liệu mới khác dữ liệu cũ
        if (
          isMountedRef.current &&
          JSON.stringify(newAddressDetails) !==
            JSON.stringify(addressDetailsRef.current)
        ) {
          setAddressDetails(newAddressDetails);
        }
      } else if (isMountedRef.current) {
        setAddressDetails({
          name: "N/A",
          address: "N/A",
          zipcode: "N/A",
          city: "N/A",
          country: "N/A",
        });
      }
    } catch (error) {
      if (isMountedRef.current) {
        setAddressDetails({
          name: "N/A",
          address: "N/A",
          zipcode: "N/A",
          city: "N/A",
          country: "N/A",
        });
      }
    }
  }, []);

  // Memoized function để tính tổng giỏ hàng
  const getCartTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  // Memoized function để xử lý thanh toán
  const handlePayment = useCallback(async () => {
    if (!currentUserRef.current) {
      alert("Please login to checkout");
      navigate("/auth");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      setIsLoading(true);
      const orderId = "ORD" + Math.floor(100 + Math.random() * 900);
      const orderData = {
        order_id: orderId,
        user_id: currentUserRef.current.id,
        order_date: new Date().toISOString(),
        total_amount: parseFloat((getCartTotal() / 100).toFixed(2)),
        status: "pending",
        items: cartItems.map((item) => ({
          product_name: item.title,
          quantity: item.quantity,
          price: parseFloat((item.price / 100).toFixed(2)),
        })),
      };

      // 1. Lưu đơn hàng mới vào orders
      const orderResponse = await fetch("http://localhost:9999/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      // 2. Cập nhật user.order_id
      const updatedOrderIds = [
        ...(currentUserRef.current.order_id || []),
        orderId,
      ];
      const userResponse = await fetch(
        `http://localhost:9999/user/${currentUserRef.current.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: updatedOrderIds }),
        }
      );

      if (!userResponse.ok) {
        throw new Error("Failed to update user");
      }

      // 3. Xoá toàn bộ giỏ hàng sau khi thanh toán
      const cartRes = await fetch(
        `http://localhost:9999/shoppingCart?userId=${currentUserRef.current.id}`
      );
      const cartData = await cartRes.json();

      await Promise.all(
        cartData.map((cart) =>
          fetch(`http://localhost:9999/shoppingCart/${cart.id}`, {
            method: "DELETE",
          })
        )
      );

      // Cập nhật localStorage
      const updatedUser = {
        ...currentUserRef.current,
        order_id: updatedOrderIds,
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      currentUserRef.current = updatedUser;

      // Điều hướng đến trang success
      navigate("/success", {
        state: {
          cartItems: cartItems,
          addressDetails: addressDetails,
          orderTotal: getCartTotal(),
        },
      });
    } catch (error) {
      alert("Đã xảy ra lỗi khi thanh toán.");
      setIsLoading(false);
    }
  }, [cartItems, addressDetails, getCartTotal, navigate]);

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        await Promise.all([fetchCartItems(), fetchAddressDetails()]);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // cleanup khi unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchCartItems, fetchAddressDetails]);

  // Hiển thị trang login nếu chưa đăng nhập
  if (!currentUserRef.current) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div>
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div className="text-center py-20">
          Please{" "}
          <button
            onClick={() => navigate("/auth")}
            className="text-blue-500 hover:underline"
          >
            login
          </button>{" "}
          to proceed to checkout
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div>
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div id="CheckoutPage" className="mt-4 max-w-[1100px] mx-auto">
          <div className="text-2xl font-bold mt-4 mb-4">Checkout</div>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="relative flex items-baseline gap-4 justify-between mx-auto w-full">
              <div className="w-[65%]">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-xl font-semibold mb-2">
                    Shipping Address
                  </div>
                  <div>
                    <a
                      href="/address"
                      className="text-blue-500 text-sm underline"
                    >
                      Update Address
                    </a>
                    {addressDetails ? (
                      <ul className="text-sm mt-2">
                        <li>Name: {addressDetails.name}</li>
                        <li>Address: {addressDetails.address}</li>
                        <li>Zip: {addressDetails.zipcode}</li>
                        <li>City: {addressDetails.city}</li>
                        <li>Country: {addressDetails.country}</li>
                      </ul>
                    ) : (
                      <div className="text-sm mt-2">No address available</div>
                    )}
                  </div>
                </div>

                <div id="Items" className="bg-white rounded-lg mt-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-4">No items in cart</div>
                  ) : (
                    cartItems.map((product) => (
                      <div className="flex items-center gap-4 p-4 border-b">
                        <img
                          src={`${product?.image}/100`}
                          alt={product?.title}
                          className="w-[100px] h-[100px] object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-semibold">{product?.title}</div>
                          <div className="text-sm text-gray-500">
                            {product?.description}
                          </div>
                          <div className="font-bold mt-2">
                            £
                            {(
                              (product?.price * product?.quantity) /
                              100
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div
                id="PlaceOrder"
                className="relative -top-[6px] w-[35%] border rounded-lg"
              >
                <div className="p-4">
                  <div className="flex items-baseline justify-between text-sm mb-1">
                    <div>
                      Items (
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                    </div>
                    <div>£{(getCartTotal() / 100).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div>Shipping:</div>
                    <div>Free</div>
                  </div>

                  <div className="border-t" />

                  <div className="flex items-center justify-between my-4">
                    <div className="font-semibold">Order total</div>
                    <div className="text-2xl font-semibold">
                      £{(getCartTotal() / 100).toFixed(2)}
                    </div>
                  </div>

                  <div className="border border-gray-500 p-2 rounded-sm mb-4">
                    <div className="text-gray-500 text-center">
                      Payment Form
                    </div>
                  </div>

                  <button
                    className="mt-4 bg-blue-600 text-lg w-full text-white font-semibold p-3 rounded-full hover:bg-blue-700"
                    onClick={handlePayment}
                    disabled={isLoading || cartItems.length === 0}
                  >
                    {isLoading ? "Processing..." : "Confirm and pay"}
                  </button>
                </div>

                <div className="flex items-center p-4 justify-center gap-2 border-t">
                  <img width={50} src="/images/logo.svg" alt="Logo" />
                  <div className="font-light mb-2 mt-2">
                    MONEY BACK GUARANTEE
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <Footer />
        </div>
      </div>
    </>
  );
}
