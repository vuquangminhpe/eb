import React, { useState, useEffect } from 'react';
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function TopMenu() {
  const [isMenu, setIsMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!currentUser) {
        setCartCount(0);
        return;
      }

      try {
        //console.log("Fetching cart count for user:", currentUser.id);
        const response = await fetch(
          `http://localhost:9999/shoppingCart?userId=${currentUser.id}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch cart: ${response.status}`);
        }
        const cartItems = await response.json();
        console.log("Cart items for count:", cartItems);
        const totalProducts = cartItems.reduce(
          (sum, item) => sum + item.productId.length,
          0
        );
        setCartCount(totalProducts);
      } catch (error) {
        //console.error("Error fetching cart count:", error);
        setCartCount(0);
      }
    };

    //fetchCartCount();
    const interval = setInterval(fetchCartCount, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const fetchCartCount = async () => {
        try {
          console.log(
            "Fetching cart count on route change for user:",
            currentUser.id
          );
          const response = await fetch(
            `http://localhost:9999/shoppingCart?userId=${currentUser.id}`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch cart: ${response.status}`);
          }
          const cartItems = await response.json();
          console.log("Cart items on route change:", cartItems);
          const totalProducts = cartItems.reduce(
            (sum, item) => sum + item.productId.length,
            0
          );
          setCartCount(totalProducts);
        } catch (error) {
          console.error("Error fetching cart count:", error);
        }
      };
      fetchCartCount();
    }
  }, [location.pathname, currentUser]);

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setCartCount(0);
    setIsMenu(false);
    navigate("/");
  };

  return (
    <div id="TopMenu" className="border-b">
      <div className="flex items-center justify-between w-full mx-auto max-w-[1200px]">
        <ul
          id="TopMenuLeft"
          className="flex items-center text-[11px] text-[#333333] px-2 h-8"
        >
          <li className="relative px-3">
            {currentUser ? (
              <button
                onClick={() => setIsMenu(!isMenu)}
                className="flex items-center gap-2 hover:underline cursor-pointer"
              >
                <div>Hi, {currentUser.fullname}</div>
                <ChevronDown size={12} />
              </button>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 hover:underline cursor-pointer"
              >
                <div>Login</div>
                <ChevronDown size={12} />
              </Link>
            )}

            {currentUser && (
              <div
                id="AuthDropdown"
                className={`
                                    absolute bg-white w-[200px] text-[#333333] z-40 top-[20px] left-0 border shadow-lg
                                    ${isMenu ? "visible" : "hidden"}
                                `}
              >
                <div>
                  <div className="flex items-center justify-start gap-1 p-3">
                    <img
                      src={`https://picsum.photos/id/${currentUser.id}/50`}
                      alt="User Avatar"
                      className="w-[50px] h-[50px] rounded-full"
                    />
                    <div className="font-bold text-[13px]">
                      {currentUser.fullname}
                    </div>
                  </div>
                </div>

                <div className="border-b" />

                <ul className="bg-white">
                  <li className="text-[11px] py-2 px-4 w-full hover:underline text-blue-500 hover:text-blue-600 cursor-pointer">
                    <Link to="/order-history">My orders</Link>
                  </li>
                  <li
                    onClick={handleSignOut}
                    className="text-[11px] py-2 px-4 w-full hover:underline text-blue-500 hover:text-blue-600 cursor-pointer"
                  >
                    Sign out
                  </li>
                </ul>
              </div>
            )}
          </li>
          <li className="px-3 hover:underline cursor-pointer">
            <Link to="/daily-deals">Daily Deals</Link>
          </li>
          <li className="px-3 hover:underline cursor-pointer">
            <Link to="/help">Help & Contact</Link>
          </li>
        </ul>

        <ul
          id="TopMenuRight"
          className="flex items-center text-[11px] text-[#333333] px-2 h-8"
        >
          {currentUser?.role === "admin" && (
            <li className="flex items-center gap-2 px-3 hover:underline cursor-pointer">
              <Link
                to="/adminDashboard"
                className="flex items-center gap-2 text-blue-400 font-bold"
              >
                Admin Panel
              </Link>
            </li>
          )}
          <li className="flex items-center gap-2 px-3 hover:underline cursor-pointer">
            <Link to="/sell" className="flex items-center gap-2">
              My eBay
            </Link>
          </li>
          <li className="flex items-center gap-2 px-3 hover:underline cursor-pointer">
            <Link to="/sell" className="flex items-center gap-2">
              <img width={32} src="/images/vn.png" alt="UK flag" />
              Ship to
            </Link>
          </li>
          <li className="flex items-center gap-2 px-3 hover:underline cursor-pointer">
            <Link to="/wishlist">Wishlist</Link>
          </li>
          <li className="px-3 hover:underline cursor-pointer">
            <Link to="/cart" className="relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <div className="absolute text-[10px] -top-[2px] -right-[5px] bg-red-500 w-[14px] h-[14px] rounded-full text-white">
                  <div className="flex items-center justify-center -mt-[1px]">
                    {cartCount}
                  </div>
                </div>
              )}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
