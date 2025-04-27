import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import Footer from "../../components/Footer";
import SimilarProducts from "../../components/SimilarProducts";


export default function AuctionProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const fetchProductAndAuctionData = async () => {
      try {
        // Fetch product details
        const response = await fetch(`http://localhost:9999/products?id=${id}`);
        const data = await response.json();
        if (data && data[0]) {
          setProduct(data[0]);
          setCurrentBid(data[0].currentBid || data[0].startingBid || 0); // Giả sử có trường currentBid/startingBid
          
          // Tính thời gian còn lại (giả sử có auctionEndDate trong dữ liệu)
          const endTime = new Date(data[0].auctionEndDate || Date.now() + 24 * 60 * 60 * 1000); // Mặc định 24h nếu không có
          const updateTimer = () => {
            const now = new Date();
            const timeDiff = endTime - now;
            if (timeDiff <= 0) {
              setTimeLeft("Auction Ended");
            } else {
              const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
              setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            }
          };
          updateTimer();
          const timer = setInterval(updateTimer, 60000); // Cập nhật mỗi phút
          return () => clearInterval(timer);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndAuctionData();
  }, [id]);

  const handlePlaceBid = async () => {
    if (!currentUser) {
      alert("Please login to place a bid");
      navigate("/auth");
      return;
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= currentBid) {
      alert(`Your bid must be higher than the current bid (£${currentBid.toFixed(2)})`);
      return;
    }

    try {
      // Gửi bid lên server (giả sử có API cập nhật bid)
      await fetch(`http://localhost:9999/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentBid: bidValue,
          highestBidder: currentUser.id,
        }),
      });
      setCurrentBid(bidValue);
      setBidAmount("");
      alert("Bid placed successfully!");
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid");
    }
  };

  const handleBuyItNow = async () => {
    if (!currentUser) {
      alert("Please login to buy");
      navigate("/auth");
      return;
    }

    try {
      // Giả sử cập nhật trạng thái sản phẩm thành "sold" khi mua ngay
      await fetch(`http://localhost:9999/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "sold",
          buyerId: currentUser.id,
        }),
      });
      alert("Product purchased successfully!");
      navigate("/cart"); // Chuyển hướng đến giỏ hàng hoặc trang xác nhận
    } catch (error) {
      console.error("Error buying product:", error);
      alert("Failed to purchase");
    }
  };

  if (isLoading) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div>
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div className="text-center py-20">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div>
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div className="text-center py-20">Product not found</div>
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
      <div className="max-w-[1200px] mx-auto">
        <div className="flex px-4 py-10">
          {product?.url ? (
            <img className="w-[40%] rounded-lg" src={`${product.url}/280`} alt={product.title} />
          ) : (
            <div className="w-[40%]"></div>
          )}

          <div className="px-4 w-full">
            <div className="font-bold text-xl">{product.title}</div>
            <div className="text-sm text-gray-700 pt-2">Brand New - Full Warranty</div>

            <div className="border-b py-1" />

            <div className="pt-3 pb-2">
              <div className="flex items-center">
                Condition: <span className="font-bold text-[17px] ml-2">New</span>
              </div>
            </div>

            <div className="border-b py-1" />

            <div className="pt-3">
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    Current Bid:
                    <div className="font-bold text-[20px] ml-2">
                      GBP £{(currentBid / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Time Left: {timeLeft}</div>
                </div>

                {product.status === "available" && timeLeft !== "Auction Ended" ? (
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Enter bid (> £${(currentBid / 100).toFixed(2)})`}
                      className="border p-2 rounded w-1/2"
                      step="0.01"
                    />
                    <button
                      onClick={handlePlaceBid}
                      className="bg-[#3498C9] hover:bg-[#0054A0] text-white py-2 px-8 rounded-full cursor-pointer"
                    >
                      Place Bid
                    </button>
                  </div>
                ) : (
                  <div className="text-red-500 font-semibold">Auction Ended or Sold</div>
                )}

                {product.buyItNowPrice && product.status === "available" && timeLeft !== "Auction Ended" && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      Buy It Now:
                      <div className="font-bold text-[18px] ml-2">
                        GBP £{(product.buyItNowPrice / 100).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={handleBuyItNow}
                      className="bg-[#e67e22] hover:bg-[#d35400] text-white py-2 px-8 rounded-full cursor-pointer"
                    >
                      Buy It Now
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b py-1" />

            <div className="pt-3">
              <div className="font-semibold pb-1">Description:</div>
              <div className="text-sm">{product.description}</div>
            </div>

            {!currentUser && (
              <div className="mt-4 text-sm text-gray-500">
                Please{" "}
                <button onClick={() => navigate("/auth")} className="text-blue-500 hover:underline">
                  login
                </button>{" "}
                to place a bid or buy
              </div>
            )}
          </div>
        </div>

        <SimilarProducts categoryId={product.categoryId} />
      </div>
      <Footer />
    </div>
  );
}