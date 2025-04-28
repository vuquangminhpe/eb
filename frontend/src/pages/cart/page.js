import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import SimilarProducts from "../../components/SimilarProducts";
import Footer from "../../components/Footer";

function EmptyCart() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-2xl font-semibold mb-2">Your cart is empty</h3>
      <p className="text-gray-500 mb-6">
        Looks like you haven't added anything to your cart yet
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700"
      >
        Start Shopping
      </button>
    </div>
  );
}

function CartItem({
  product,
  cartItemId,
  onRemove,
  onUpdateQuantity,
  availableStock,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b p-4">
      <div className="flex items-center gap-4">
        <img
          src={`${product.image}/100`}
          alt={product.title}
          className="w-[100px] h-[100px] object-cover rounded-lg"
        />
        <div>
          <div className="font-semibold">{product.title}</div>
          <div className="text-sm text-gray-500">{product.description}</div>
          <div className="font-bold mt-2">
            £{(product.price / 100).toFixed(2)}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() =>
                onUpdateQuantity(
                  cartItemId,
                  product.idProduct,
                  product.quantity - 1
                )
              }
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={product.quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span>{product.quantity}</span>
            <button
              onClick={() =>
                onUpdateQuantity(
                  cartItemId,
                  product.idProduct,
                  product.quantity + 1
                )
              }
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={product.quantity >= availableStock}
            >
              <Plus size={16} />
            </button>
          </div>
          {availableStock === 0 && (
            <div className="text-red-500 text-sm mt-1">Out of stock</div>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(cartItemId, product.idProduct)}
        className="text-blue-500 hover:text-blue-700"
      >
        Remove
      </button>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sử dụng useRef để tránh re-render không cần thiết
  const currentUserRef = useRef(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  const cartItemsRef = useRef([]);
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);

  // Cập nhật ref khi state thay đổi
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // Memoized function để fetch cart items
  const fetchCartItems = useCallback(async () => {
    // Nếu đang fetch hoặc component unmounted, không tiếp tục
    if (fetchingRef.current || !isMountedRef.current) return;
    if (!currentUserRef.current) {
      if (isMountedRef.current) {
        setCartItems([]);
        setIsLoading(false);
      }
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
          setIsLoading(false);
        }
        fetchingRef.current = false;
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
                  availableStock: productInfo.quantity,
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
        setIsLoading(false);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setCartItems([]);
        setIsLoading(false);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Memoized function để thêm vào giỏ hàng
  const addToCart = useCallback(
    async (productId) => {
      if (!currentUserRef.current) {
        alert("Please login to add items to cart");
        navigate("/auth");
        return;
      }

      try {
        // Fetch product data to check stock
        const productResponse = await fetch(
          `http://localhost:9999/products?id=${productId}`
        );
        const productData = await productResponse.json();
        const productInfo = Array.isArray(productData)
          ? productData[0]
          : productData;
        if (!productInfo || productInfo.quantity <= 0) {
          alert("This product is out of stock!");
          return;
        }

        const cartResponse = await fetch(
          `http://localhost:9999/shoppingCart?userId=${currentUserRef.current.id}`
        );
        const cartData = await cartResponse.json();

        let newCartQuantity = 1;
        if (cartData.length > 0) {
          const cartItem = cartData[0];
          const existingProduct = cartItem.productId.find(
            (p) => p.idProduct === productId
          );

          if (existingProduct) {
            const currentQty = parseInt(existingProduct.quantity);
            if (currentQty + 1 > productInfo.quantity) {
              alert("Cannot add more items; stock limit reached!");
              return;
            }
            newCartQuantity = currentQty + 1;
            const updatedProducts = cartItem.productId.map((p) =>
              p.idProduct === productId
                ? { ...p, quantity: newCartQuantity.toString() }
                : p
            );

            await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: updatedProducts }),
            });
          } else {
            await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: [
                  ...cartItem.productId,
                  { idProduct: productId, quantity: "1" },
                ],
              }),
            });
          }
        } else {
          await fetch(`http://localhost:9999/shoppingCart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: currentUserRef.current.id,
              productId: [{ idProduct: productId, quantity: "1" }],
              dateAdded: new Date().toISOString(),
            }),
          });
        }

        // Update product stock
        const newStock = productInfo.quantity - 1;
        const stockResponse = await fetch(
          `http://localhost:9999/products/${productId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: newStock }),
          }
        );
        if (!stockResponse.ok) {
          throw new Error("Failed to update product stock");
        }

        await fetchCartItems();
      } catch (error) {
        alert("Failed to add item to cart");
      }
    },
    [fetchCartItems, navigate]
  );

  // Memoized function để xóa khỏi giỏ hàng
  const removeFromCart = useCallback(
    async (cartItemId, productId) => {
      try {
        const cartResponse = await fetch(
          `http://localhost:9999/shoppingCart/${cartItemId}`
        );
        const cartItem = await cartResponse.json();

        const productToRemove = cartItem.productId.find(
          (p) => p.idProduct === productId
        );
        const quantityRemoved = parseInt(productToRemove.quantity);

        const updatedProducts = cartItem.productId.filter(
          (p) => p.idProduct !== productId
        );

        if (updatedProducts.length === 0) {
          await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, {
            method: "DELETE",
          });
        } else {
          await fetch(`http://localhost:9999/shoppingCart/${cartItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: updatedProducts }),
          });
        }

        // Restore stock to products API
        const productResponse = await fetch(
          `http://localhost:9999/products?id=${productId}`
        );
        const productData = await productResponse.json();
        const productInfo = Array.isArray(productData)
          ? productData[0]
          : productData;
        const newStock = productInfo.quantity + quantityRemoved;

        const stockResponse = await fetch(
          `http://localhost:9999/products/${productId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: newStock }),
          }
        );
        if (!stockResponse.ok) {
          throw new Error("Failed to update product stock");
        }

        await fetchCartItems();
      } catch (error) {
        alert("Failed to remove item from cart");
      }
    },
    [fetchCartItems]
  );

  // Memoized function để cập nhật số lượng
  const updateQuantity = useCallback(
    async (cartItemId, productId, newQuantity) => {
      if (newQuantity < 1) return;

      try {
        // Fetch current product stock
        const productResponse = await fetch(
          `http://localhost:9999/products?id=${productId}`
        );
        const productData = await productResponse.json();
        const productInfo = Array.isArray(productData)
          ? productData[0]
          : productData;
        const currentStock = productInfo.quantity;

        // Fetch current cart quantity
        const cartResponse = await fetch(
          `http://localhost:9999/shoppingCart/${cartItemId}`
        );
        const cartItem = await cartResponse.json();
        const currentCartProduct = cartItem.productId.find(
          (p) => p.idProduct === productId
        );
        const currentCartQty = parseInt(currentCartProduct.quantity);

        // Calculate stock change
        const quantityDifference = newQuantity - currentCartQty;
        const newStock = currentStock - quantityDifference;

        if (newStock < 0) {
          alert("Cannot update quantity; insufficient stock!");
          return;
        }

        // Update cart
        const updatedProducts = cartItem.productId.map((p) =>
          p.idProduct === productId
            ? { ...p, quantity: newQuantity.toString() }
            : p
        );

        const cartUpdateResponse = await fetch(
          `http://localhost:9999/shoppingCart/${cartItemId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: updatedProducts }),
          }
        );

        if (!cartUpdateResponse.ok) {
          throw new Error("Failed to update cart quantity");
        }

        // Update product stock
        const stockResponse = await fetch(
          `http://localhost:9999/products/${productId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: newStock }),
          }
        );

        if (!stockResponse.ok) {
          throw new Error("Failed to update product stock");
        }

        await fetchCartItems();
      } catch (error) {
        alert("Failed to update quantity");
      }
    },
    [fetchCartItems]
  );

  // Memoized function để tính tổng giỏ hàng
  const getCartTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  // Xử lý thanh toán
  const handleCheckout = useCallback(() => {
    if (!currentUserRef.current) {
      alert("Please login to checkout");
      navigate("/auth");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/checkout");
  }, [cartItems, navigate]);

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    isMountedRef.current = true;
    fetchCartItems();

    // cleanup khi unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchCartItems]);

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
          to view your cart
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      <div className="max-w-[1200px] mx-auto mb-8 min-h-[300px]">
        <div className="text-2xl font-bold my-4">Shopping cart</div>
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {cartItems.length === 0 ? (
                <EmptyCart />
              ) : (
                <div className="space-y-4">
                  {cartItems.map((product) => (
                    <CartItem
                      key={`${product.cartItemId}-${product.idProduct}`}
                      product={product}
                      cartItemId={product.cartItemId}
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateQuantity}
                      availableStock={product.availableStock}
                    />
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="md:col-span-1">
                <div className="bg-white p-4 border sticky top-4">
                  <button
                    onClick={handleCheckout}
                    className="flex items-center justify-center bg-blue-600 w-full text-white font-semibold p-3 rounded-full hover:bg-blue-700"
                  >
                    Go to checkout
                  </button>

                  <div className="flex items-center justify-between mt-4 text-sm mb-1">
                    <div>Items ({cartItems.length})</div>
                    <div>£{(getCartTotal() / 100).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div>Shipping:</div>
                    <div>Free</div>
                  </div>

                  <div className="border-b border-gray-300" />

                  <div className="flex items-center justify-between mt-4 mb-1 text-lg font-semibold">
                    <div>Subtotal</div>
                    <div>£{(getCartTotal() / 100).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-12">
          <SimilarProducts />
        </div>
      </div>
      <Footer />
    </div>
  );
}
