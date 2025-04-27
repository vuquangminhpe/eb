import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FiHeart, 
  FiShoppingCart, 
  FiClock, 
  FiTruck, 
  FiShield, 
  FiArrowLeft, 
  FiChevronRight,
  FiInfo,
  FiStar,
  FiShare2,
  FiPrinter,
  FiFlag,
  FiChevronDown
} from "react-icons/fi";
import TopMenu from "../../../components/TopMenu";
import MainHeader from "../../../components/MainHeader";
import SubMenu from "../../../components/SubMenu";
import Footer from "../../../components/Footer";
import SimilarProducts from "../../../components/SimilarProducts";

// Import components


export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemAdded, setIsItemAdded] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Mock additional images for the product
  const productImages = [
    { id: 0, url: product?.url || "/placeholder.jpg" },
    { id: 1, url: "https://picsum.photos/id/1/400" },
    { id: 2, url: "https://picsum.photos/id/20/400" },
    { id: 3, url: "https://picsum.photos/id/30/400" }
  ];

  // Check if product is in cart
  const checkItemInCart = async () => {
    if (!currentUser) return false;
    try {
      const response = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`);
      const cartData = await response.json();
      const cartWithProduct = cartData.find((cart) =>
        cart.productId.some((p) => p.idProduct === id)
      );
      return !!cartWithProduct;
    } catch (error) {
      console.error("Error checking cart:", error);
      return false;
    }
  };

  // Check if product is in wishlist
  const checkItemInWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    return wishlist.some(item => item.id === id);
  };

  // Fetch product data, cart status, and bid history
  useEffect(() => {
    const fetchProductAndCartStatus = async () => {
      try {
        // Fetch product details
        const response = await fetch(`http://localhost:9999/products?id=${id}`);
        const data = await response.json();
        if (data && data[0]) {
          setProduct(data[0]);
        }
        
        // Check cart status
        const inCart = await checkItemInCart();
        setIsItemAdded(inCart);
        
        // Check wishlist status
        setIsWishlist(checkItemInWishlist());
        
        // Fetch bid history for auction items
        if (data[0]?.isAuction) {
          const bidsResponse = await fetch(`http://localhost:9999/auctionBids?productId=${id}`);
          const bidsData = await bidsResponse.json();
          setBidHistory(bidsData.sort((a, b) => new Date(b.bidDate) - new Date(a.bidDate)));
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndCartStatus();
  }, [id, currentUser]);

  // Handle cart actions (add/remove)
  const handleCartAction = async () => {
    if (!currentUser) {
      alert("Please login to manage cart");
      navigate("/auth");
      return;
    }

    try {
      const cartResponse = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`);
      const cartData = await cartResponse.json();

      if (isItemAdded) {
        const cartWithProduct = cartData.find((cart) =>
          cart.productId.some((p) => p.idProduct === id)
        );

        if (cartWithProduct) {
          const updatedProducts = cartWithProduct.productId.filter((p) => p.idProduct !== id);

          if (updatedProducts.length === 0) {
            await fetch(`http://localhost:9999/shoppingCart/${cartWithProduct.id}`, {
              method: "DELETE",
            });
          } else {
            await fetch(`http://localhost:9999/shoppingCart/${cartWithProduct.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: updatedProducts,
              }),
            });
          }
          setIsItemAdded(false);
        }
      } else {
        if (cartData.length > 0) {
          const cartItem = cartData[0];
          const existingProduct = cartItem.productId.find((p) => p.idProduct === id);

          if (existingProduct) {
            const updatedProducts = cartItem.productId.map((p) =>
              p.idProduct === id
                ? { ...p, quantity: (parseInt(p.quantity) + quantity).toString() }
                : p
            );

            await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: updatedProducts,
              }),
            });
          } else {
            await fetch(`http://localhost:9999/shoppingCart/${cartItem.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: [...cartItem.productId, { idProduct: id, quantity: quantity.toString() }],
              }),
            });
          }
        } else {
          await fetch("http://localhost:9999/shoppingCart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: currentUser.id,
              productId: [{ idProduct: id, quantity: quantity.toString() }],
              dateAdded: new Date().toISOString(),
            }),
          });
        }
        setIsItemAdded(true);
      }
    } catch (error) {
      console.error("Error managing cart:", error);
      alert("Failed to update cart");
    }
  };

  // Handle placing a bid
  const handlePlaceBid = async () => {
    if (!currentUser) {
      alert("Please login to place a bid");
      navigate("/auth");
      return;
    }

    if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    const bidInPennies = Math.round(parseFloat(bidAmount) * 100);
    if (bidInPennies <= product.price) {
      alert(`Your bid must be higher than the current bid of £${(product.price / 100).toFixed(2)}`);
      return;
    }

    try {
      // Get current bids to check highest
      const bidsResponse = await fetch(`http://localhost:9999/auctionBids?productId=${id}`);
      const existingBids = await bidsResponse.json();
      
      // Create new bid ID
      const newBidId = `bid${Date.now()}`;

      // Determine if this is winning bid
      const highestBid = existingBids.length > 0
        ? Math.max(...existingBids.map((bid) => bid.bidAmount))
        : product.price;
      const isWinning = bidInPennies > highestBid;

      // Create new bid record
      const newBid = {
        id: newBidId,
        productId: id,
        userId: currentUser.id,
        bidAmount: bidInPennies,
        bidDate: new Date().toISOString(),
        isWinningBid: isWinning,
      };

      // Submit new bid
      const response = await fetch("http://localhost:9999/auctionBids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBid),
      });

      if (!response.ok) {
        throw new Error("Failed to place bid");
      }

      // Update other bids if this is highest
      if (isWinning && existingBids.length > 0) {
        const updatePromises = existingBids.map((bid) =>
          fetch(`http://localhost:9999/auctionBids/${bid.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isWinningBid: false }),
          })
        );
        await Promise.all(updatePromises);
      }

      // Update bid history
      setBidHistory([newBid, ...bidHistory]);
      
      alert("Bid placed successfully!");
      setBidAmount("");
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid: " + error.message);
    }
  };

  // Toggle wishlist status
  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    
    if (isWishlist) {
      const updatedWishlist = wishlist.filter(item => item.id !== id);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      setIsWishlist(false);
    } else {
      if (product) {
        localStorage.setItem("wishlist", JSON.stringify([...wishlist, product]));
        setIsWishlist(true);
      }
    }
  };

  // Format time remaining for auction
  const formatTimeRemaining = () => {
    // Mock time remaining calculation
    const days = 2;
    const hours = 3;
    const minutes = 45;
    
    return (
      <div className="flex items-center text-gray-700">
        <FiClock className="mr-2" />
        <span className="font-medium">{days}d {hours}h {minutes}m</span>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <TopMenu />
        <MainHeader />
        <SubMenu />
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <TopMenu />
        <MainHeader />
        <SubMenu />
        <div className="max-w-[1300px] mx-auto px-4 py-16">
          <div className="bg-white p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-[#0053A0] hover:bg-[#00438A]">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopMenu />
      <MainHeader />
      <SubMenu />
      
      <main className="max-w-[1300px] mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-2 text-xs" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1">
            <li>
              <Link to="/" className="text-[#555555] hover:text-[#0053A0] hover:underline">Home</Link>
            </li>
            <li className="flex items-center">
              <FiChevronRight className="h-3 w-3 text-gray-400 mx-1" />
              <Link to={`/list-category/${product.categoryId}`} className="text-[#555555] hover:text-[#0053A0] hover:underline">
                {product.categoryName || "Category"}
              </Link>
            </li>
            <li className="flex items-center">
              <FiChevronRight className="h-3 w-3 text-gray-400 mx-1" />
              <span className="text-[#555555]">{product.title}</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white">
          <div className="lg:flex">
            {/* Left Column - Images */}
            <div className="lg:w-[40%] p-2 lg:p-4 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="relative mb-2">
                <img 
                  src={`${productImages[selectedImage].url}/600`} 
                  alt={product.title} 
                  className="w-full h-[400px] object-contain"
                />
                {product.status !== "available" && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1">
                    {product.isAuction ? "Auction Ended" : "Out of Stock"}
                  </div>
                )}
              </div>
              
              {/* Thumbnail images */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border ${
                      selectedImage === index ? "border-[#0053A0]" : "border-gray-200"
                    }`}
                  >
                    <img 
                      src={`${image.url}/100`} 
                      alt={`Product view ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              {/* Image actions */}
              <div className="flex justify-center mt-4 text-xs text-[#0053A0]">
                <button className="flex items-center hover:underline mx-2">
                  <FiShare2 className="mr-1 h-3 w-3" />
                  Share
                </button>
                <button className="flex items-center hover:underline mx-2">
                  <FiPrinter className="mr-1 h-3 w-3" />
                  Print
                </button>
                <button className="flex items-center hover:underline mx-2">
                  <FiFlag className="mr-1 h-3 w-3" />
                  Report
                </button>
              </div>
              
              {/* Seller info (mobile only) */}
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 lg:hidden">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium">Seller information</p>
                    <p className="text-[#0053A0] hover:underline cursor-pointer">seller123 (254)</p>
                    <div className="flex items-center text-xs mt-1">
                      <div className="flex items-center text-[#0053A0]">
                        98.7% Positive feedback
                      </div>
                    </div>
                  </div>
                  <button className="ml-auto text-xs text-[#0053A0] hover:underline">
                    Contact seller
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Column - Product Details */}
            <div className="lg:w-[60%] p-2 lg:p-4">
              <div className="border-b border-gray-200 pb-2">
                <h1 className="text-xl font-medium text-gray-900">{product.title}</h1>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span className="text-[#0053A0] hover:underline cursor-pointer">Brand New</span>
                  <span className="mx-1">|</span>
                  <span>Condition: <span className="font-medium">New</span></span>
                </div>
              </div>
              
              {/* Auction or Buy Now Section */}
              <div className="py-4 border-b border-gray-200">
                {product.isAuction ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500">Current bid:</div>
                        <div className="text-2xl font-medium text-gray-900">
                          £{(product.price / 100).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          [Approximately US ${((product.price / 100) * 1.25).toFixed(2)}]
                        </div>
                      </div>
                      
                      {product.status === "available" && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Time left:</div>
                          <div className="text-[#e43147] font-medium">2d 3h 45m</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Sunday, 21:45 BST
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {product.status === "available" ? (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">£</span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              placeholder={`${(product.price / 100 + 1).toFixed(2)} or more`}
                              className="block w-full pl-7 pr-12 py-2 border border-gray-300 focus:ring-[#0053A0] focus:border-[#0053A0]"
                            />
                          </div>
                          <button
                            onClick={handlePlaceBid}
                            className="bg-[#0053A0] hover:bg-[#00438A] text-white py-2 px-6 font-medium"
                          >
                            Place bid
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          [Enter £{(product.price / 100 + 1).toFixed(2)} or more]
                        </div>
                        
                        <div className="flex items-center justify-between pt-3">
                          <div>
                            <div className="text-sm text-gray-500">Buy it now:</div>
                            <div className="text-xl font-medium text-gray-900">
                              £{(product.price * 1.2 / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              [Approximately US ${((product.price * 1.2 / 100) * 1.25).toFixed(2)}]
                            </div>
                          </div>
                          <button className="bg-[#0053A0] hover:bg-[#00438A] text-white py-2 px-6 font-medium">
                            Buy it now
                          </button>
                        </div>
                        
                        <div className="flex items-center text-xs text-[#0053A0] mt-2">
                          <button 
                            onClick={() => setShowBidHistory(!showBidHistory)}
                            className="hover:underline flex items-center"
                          >
                            {bidHistory.length} bids
                          </button>
                          <span className="mx-2">|</span>
                          <button className="hover:underline">
                            Add to watchlist
                          </button>
                        </div>
                        
                        {showBidHistory && (
                          <div className="mt-2 border text-xs">
                            <div className="bg-gray-100 p-2 font-medium">
                              Bid History ({bidHistory.length} bids)
                            </div>
                            <table className="min-w-full">
                              <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                  <th className="px-2 py-1 text-left">Bidder</th>
                                  <th className="px-2 py-1 text-left">Bid Amount</th>
                                  <th className="px-2 py-1 text-left">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {bidHistory.length > 0 ? (
                                  bidHistory.map((bid, index) => (
                                    <tr key={bid.id}>
                                      <td className="px-2 py-1 whitespace-nowrap">
                                        u***{bid.userId.substring(0, 2)}
                                      </td>
                                      <td className="px-2 py-1 whitespace-nowrap font-medium">
                                        £{(bid.bidAmount / 100).toFixed(2)}
                                      </td>
                                      <td className="px-2 py-1 whitespace-nowrap text-gray-500">
                                        {new Date(bid.bidDate).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={3} className="px-2 py-2 text-center text-gray-500">
                                      No bids yet. Be the first to bid!
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 p-3 text-sm">
                        <div className="font-medium text-red-800">This auction has ended</div>
                        <p className="mt-1 text-red-700">
                          The auction for this item has ended. Check out similar products below.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Price:</div>
                      <div className="flex items-baseline">
                        <div className="text-2xl font-medium text-gray-900">
                          £{(product.price / 100).toFixed(2)}
                        </div>
                        <div className="ml-2 text-sm text-gray-500 line-through">
                          £{(product.price * 1.2 / 100).toFixed(2)}
                        </div>
                        <div className="ml-2 text-sm font-medium text-green-600">
                          Save 20%
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        [Approximately US ${((product.price / 100) * 1.25).toFixed(2)}]
                      </div>
                    </div>
                    
                    {product.status === "available" ? (
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <label htmlFor="quantity" className="block text-sm text-gray-700 mr-4">
                            Quantity:
                          </label>
                          <div className="flex items-center border border-gray-300">
                            <button
                              type="button"
                              className="p-1 text-gray-500 hover:text-gray-600"
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                              <span className="sr-only">Decrease</span>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <input
                              type="number"
                              id="quantity"
                              name="quantity"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-12 text-center border-0 focus:ring-0"
                            />
                            <button
                              type="button"
                              className="p-1 text-gray-500 hover:text-gray-600"
                              onClick={() => setQuantity(quantity + 1)}
                            >
                              <span className="sr-only">Increase</span>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <div className="ml-2 text-xs text-gray-500">
                            More than 10 available
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <button
                            onClick={handleCartAction}
                            className={`w-full flex items-center justify-center px-6 py-2 text-base font-medium text-white ${
                              isItemAdded 
                                ? "bg-[#e43147] hover:bg-[#c52b3d]" 
                                : "bg-[#0053A0] hover:bg-[#00438A]"
                            }`}
                          >
                            <FiShoppingCart className="mr-2 h-5 w-5" />
                            {isItemAdded ? "Remove from basket" : "Add to basket"}
                          </button>
                          
                          <button
                            onClick={toggleWishlist}
                            className="w-full flex items-center justify-center px-6 py-2 border border-gray-300 text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <FiHeart className={`mr-2 h-5 w-5 ${isWishlist ? "text-[#e43147] fill-[#e43147]" : ""}`} />
                            {isWishlist ? "Remove from watchlist" : "Add to watchlist"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 p-3 text-sm">
                        <div className="font-medium text-red-800">Out of Stock</div>
                        <p className="mt-1 text-red-700">
                          This item is currently out of stock. Please check back later or browse similar products below.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Shipping & Payment */}
              <div className="py-4 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-medium">Shipping</h3>
                      <button 
                        onClick={() => setShowShipping(!showShipping)}
                        className="text-xs text-[#0053A0]"
                      >
                        {showShipping ? "Hide" : "Show"} details
                      </button>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Item location:</span>
                        <span>London, United Kingdom</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Shipping to:</span>
                        <span>United Kingdom</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Delivery:</span>
                        <span className="text-green-600 font-medium">Free Standard Delivery</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Estimated between:</span>
                        <span>Wed, 15 Jun and Mon, 20 Jun</span>
                      </div>
                    </div>
                    
                    {showShipping && (
                      <div className="mt-3 text-xs bg-gray-50 p-3 border border-gray-200">
                        <table className="w-full">
                          <thead className="text-gray-500">
                            <tr>
                              <th className="text-left py-1">Service</th>
                              <th className="text-right py-1">Delivery*</th>
                              <th className="text-right py-1">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-1">Standard Delivery</td>
                              <td className="text-right py-1">3-5 business days</td>
                              <td className="text-right py-1 font-medium">Free</td>
                            </tr>
                            <tr>
                              <td className="py-1">Express Delivery</td>
                              <td className="text-right py-1">1-2 business days</td>
                              <td className="text-right py-1">£4.99</td>
                            </tr>
                          </tbody>
                        </table>
                        <p className="mt-2">* Estimated delivery times</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-medium">Payment</h3>
                      <button 
                        onClick={() => setShowPayment(!showPayment)}
                        className="text-xs text-[#0053A0]"
                      >
                        {showPayment ? "Hide" : "Show"} details
                      </button>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <img src="https://ir.ebaystatic.com/cr/v/c1/payment-icons/visa.svg" alt="Visa" className="h-6" />
                        <img src="https://ir.ebaystatic.com/cr/v/c1/payment-icons/mastercard.svg" alt="Mastercard" className="h-6" />
                        <img src="https://ir.ebaystatic.com/cr/v/c1/payment-icons/paypal.svg" alt="PayPal" className="h-6" />
                      </div>
                      <div className="text-xs text-gray-500">
                        *Terms and conditions apply
                      </div>
                    </div>
                    
                    {showPayment && (
                      <div className="mt-3 text-xs bg-gray-50 p-3 border border-gray-200">
                        <p>Payment methods accepted:</p>
                        <ul className="list-disc list-inside mt-1">
                          <li>Credit/Debit Cards (Visa, Mastercard, Amex)</li>
                          <li>PayPal</li>
                          <li>Google Pay</li>
                          <li>Apple Pay</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Returns */}
              <div className="py-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-medium">Returns</h3>
                  <button 
                    onClick={() => setShowReturns(!showReturns)}
                    className="text-xs text-[#0053A0]"
                  >
                    {showReturns ? "Hide" : "Show"} details
                  </button>
                </div>
                <div className="text-sm">
                  <p>30 day returns. Buyer pays for return shipping.</p>
                </div>
                
                {showReturns && (
                  <div className="mt-3 text-xs bg-gray-50 p-3 border border-gray-200">
                    <p className="font-medium">Return policy details:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Returns accepted within 30 days after the buyer receives the item</li>
                      <li>Buyer pays for return shipping</li>
                      <li>Item must be returned in original condition</li>
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-medium">Description</h3>
                  <button 
                    onClick={() => setShowDescription(!showDescription)}
                    className="text-xs text-[#0053A0]"
                  >
                    {showDescription ? "Hide" : "Show"} details
                  </button>
                </div>
                <div className="text-sm">
                  <p className="line-clamp-3">{product.description}</p>
                </div>
                
                {showDescription && (
                  <div className="mt-3 text-sm">
                    <p>{product.description}</p>
                    <div className="mt-4">
                      <h4 className="font-medium">Product Specifications:</h4>
                      <table className="w-full mt-2 text-xs">
                        <tbody>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">Brand</td>
                            <td className="py-2">Premium Brand</td>
                          </tr>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">Model</td>
                            <td className="py-2">2023 Edition</td>
                          </tr>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">Color</td>
                            <td className="py-2">Black</td>
                          </tr>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">Material</td>
                            <td className="py-2">Premium Quality</td>
                          </tr>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">Dimensions</td>
                            <td className="py-2">30 x 20 x 10 cm</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Seller Information (Desktop) */}
              <div className="hidden lg:block mt-4 p-3 bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Seller information</p>
                    <p className="text-[#0053A0] hover:underline cursor-pointer text-sm">seller123 (254)</p>
                    <div className="flex items-center text-xs mt-1">
                      <div className="flex items-center text-[#0053A0]">
                        98.7% Positive feedback
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="text-xs text-[#0053A0] hover:underline mb-1 block">
                      Contact seller
                    </button>
                    <button className="text-xs text-[#0053A0] hover:underline block">
                      See other items
                    </button>
                  </div>
                </div>
              </div>
              
              {!currentUser && (
                <div className="mt-4 bg-blue-50 border border-blue-200 p-3 text-sm">
                  <p className="text-blue-700">
                    Please{" "}
                    <button onClick={() => navigate("/auth")} className="font-medium text-[#0053A0] underline">
                      sign in
                    </button>{" "}
                    to {product.isAuction ? "place a bid or buy" : "add items to basket"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Similar Products Section */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Similar sponsored items</h2>
          <SimilarProducts categoryId={product.categoryId} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}