import React, { useState, useEffect, useRef } from "react";
import { 
  FiSearch, FiHeart, FiShoppingCart, FiUser, FiBell, 
  FiChevronDown, FiChevronRight, FiClock, FiTag, 
  FiTruck, FiPercent, FiStar, FiArrowRight, FiArrowLeft,
  FiGrid, FiList, FiFilter, FiRefreshCw, FiShield
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import Footer from "../../components/Footer";

// Giả định các component này đã được tạo trong dự án của bạn


// Dữ liệu mẫu cho các deal
const FEATURED_DEALS = [
  {
    id: 1,
    title: "Apple AirPods Pro (2nd Generation)",
    originalPrice: 249.99,
    salePrice: 189.99,
    discount: 24,
    image: "https://picsum.photos/id/96/400/400",
    rating: 4.8,
    reviewCount: 12453,
    freeShipping: true,
    timeLeft: 14 * 60 * 60, // 14 hours in seconds
    sold: 756,
    available: 1000,
  },
  {
    id: 2,
    title: "Samsung 55\" Class QLED 4K Smart TV",
    originalPrice: 999.99,
    salePrice: 649.99,
    discount: 35,
    image: "https://picsum.photos/id/60/400/400",
    rating: 4.6,
    reviewCount: 3245,
    freeShipping: true,
    timeLeft: 8 * 60 * 60, // 8 hours in seconds
    sold: 432,
    available: 500,
  },
  {
    id: 3,
    title: "Dyson V11 Cordless Vacuum Cleaner",
    originalPrice: 599.99,
    salePrice: 449.99,
    discount: 25,
    image: "https://picsum.photos/id/26/400/400",
    rating: 4.9,
    reviewCount: 8765,
    freeShipping: true,
    timeLeft: 10 * 60 * 60, // 10 hours in seconds
    sold: 621,
    available: 800,
  },
  {
    id: 4,
    title: "KitchenAid Stand Mixer Professional 5 Plus",
    originalPrice: 449.99,
    salePrice: 279.99,
    discount: 38,
    image: "https://picsum.photos/id/30/400/400",
    rating: 4.7,
    reviewCount: 5432,
    freeShipping: true,
    timeLeft: 6 * 60 * 60, // 6 hours in seconds
    sold: 345,
    available: 400,
  }
];

// Dữ liệu mẫu cho các danh mục deal
const DEAL_CATEGORIES = [
  { id: 1, name: "Tech & Electronics", icon: "💻", count: 1245, image: "https://picsum.photos/id/1/100/100" },
  { id: 2, name: "Home & Garden", icon: "🏡", count: 876, image: "https://picsum.photos/id/20/100/100" },
  { id: 3, name: "Fashion", icon: "👕", count: 1543, image: "https://picsum.photos/id/21/100/100" },
  { id: 4, name: "Sports & Outdoors", icon: "⚽", count: 654, image: "https://picsum.photos/id/22/100/100" },
  { id: 5, name: "Toys & Hobbies", icon: "🧸", count: 432, image: "https://picsum.photos/id/40/100/100" },
  { id: 6, name: "Beauty & Health", icon: "💄", count: 765, image: "https://picsum.photos/id/42/100/100" },
  { id: 7, name: "Automotive", icon: "🚗", count: 321, image: "https://picsum.photos/id/50/100/100" },
  { id: 8, name: "Jewelry & Watches", icon: "💍", count: 543, image: "https://picsum.photos/id/65/100/100" }
];

// Dữ liệu mẫu cho các deal thông thường
const REGULAR_DEALS = [
  {
    id: 5,
    title: "Bose QuietComfort 45 Wireless Noise Cancelling Headphones",
    originalPrice: 329.99,
    salePrice: 249.99,
    discount: 24,
    image: "https://picsum.photos/id/10/300/300",
    rating: 4.7,
    reviewCount: 3456,
    freeShipping: true,
    category: "Tech & Electronics",
    timeLeft: 16 * 60 * 60, // 16 hours in seconds
  },
  {
    id: 6,
    title: "Ninja Foodi 8-Quart 6-in-1 DualZone Air Fryer",
    originalPrice: 199.99,
    salePrice: 139.99,
    discount: 30,
    image: "https://picsum.photos/id/11/300/300",
    rating: 4.8,
    reviewCount: 7654,
    freeShipping: true,
    category: "Home & Garden",
    timeLeft: 12 * 60 * 60, // 12 hours in seconds
  },
  {
    id: 7,
    title: "Adidas Ultraboost 22 Running Shoes",
    originalPrice: 189.99,
    salePrice: 119.99,
    discount: 37,
    image: "https://picsum.photos/id/12/300/300",
    rating: 4.6,
    reviewCount: 2345,
    freeShipping: true,
    category: "Fashion",
    timeLeft: 18 * 60 * 60, // 18 hours in seconds
  },
  {
    id: 8,
    title: "Coleman 4-Person Cabin Tent with Instant Setup",
    originalPrice: 149.99,
    salePrice: 99.99,
    discount: 33,
    image: "https://picsum.photos/id/13/300/300",
    rating: 4.5,
    reviewCount: 1234,
    freeShipping: true,
    category: "Sports & Outdoors",
    timeLeft: 14 * 60 * 60, // 14 hours in seconds
  },
  {
    id: 9,
    title: "LEGO Star Wars Millennium Falcon Building Kit",
    originalPrice: 159.99,
    salePrice: 119.99,
    discount: 25,
    image: "https://picsum.photos/id/14/300/300",
    rating: 4.9,
    reviewCount: 4567,
    freeShipping: true,
    category: "Toys & Hobbies",
    timeLeft: 10 * 60 * 60, // 10 hours in seconds
  },
  {
    id: 10,
    title: "Philips Sonicare DiamondClean Smart Electric Toothbrush",
    originalPrice: 229.99,
    salePrice: 169.99,
    discount: 26,
    image: "https://picsum.photos/id/15/300/300",
    rating: 4.7,
    reviewCount: 3456,
    freeShipping: true,
    category: "Beauty & Health",
    timeLeft: 8 * 60 * 60, // 8 hours in seconds
  },
  {
    id: 11,
    title: "Chemical Guys Car Wash Kit (16 Items)",
    originalPrice: 129.99,
    salePrice: 89.99,
    discount: 31,
    image: "https://picsum.photos/id/16/300/300",
    rating: 4.8,
    reviewCount: 2345,
    freeShipping: true,
    category: "Automotive",
    timeLeft: 20 * 60 * 60, // 20 hours in seconds
  },
  {
    id: 12,
    title: "Fossil Gen 6 Touchscreen Smartwatch",
    originalPrice: 299.99,
    salePrice: 199.99,
    discount: 33,
    image: "https://picsum.photos/id/17/300/300",
    rating: 4.6,
    reviewCount: 1234,
    freeShipping: true,
    category: "Jewelry & Watches",
    timeLeft: 15 * 60 * 60, // 15 hours in seconds
  },
  {
    id: 13,
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    originalPrice: 399.99,
    salePrice: 299.99,
    discount: 25,
    image: "https://picsum.photos/id/18/300/300",
    rating: 4.9,
    reviewCount: 5678,
    freeShipping: true,
    category: "Tech & Electronics",
    timeLeft: 22 * 60 * 60, // 22 hours in seconds
  },
  {
    id: 14,
    title: "Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker",
    originalPrice: 149.99,
    salePrice: 99.99,
    discount: 33,
    image: "https://picsum.photos/id/19/300/300",
    rating: 4.8,
    reviewCount: 8765,
    freeShipping: true,
    category: "Home & Garden",
    timeLeft: 11 * 60 * 60, // 11 hours in seconds
  },
  {
    id: 15,
    title: "Nike Air Force 1 '07 Men's Shoes",
    originalPrice: 109.99,
    salePrice: 79.99,
    discount: 27,
    image: "https://picsum.photos/id/20/300/300",
    rating: 4.7,
    reviewCount: 3456,
    freeShipping: true,
    category: "Fashion",
    timeLeft: 9 * 60 * 60, // 9 hours in seconds
  },
  {
    id: 16,
    title: "Bowflex SelectTech 552 Adjustable Dumbbells (Pair)",
    originalPrice: 429.99,
    salePrice: 329.99,
    discount: 23,
    image: "https://picsum.photos/id/21/300/300",
    rating: 4.8,
    reviewCount: 2345,
    freeShipping: true,
    category: "Sports & Outdoors",
    timeLeft: 13 * 60 * 60, // 13 hours in seconds
  }
];

// Dữ liệu mẫu cho các thương hiệu nổi bật
const FEATURED_BRANDS = [
  { id: 1, name: "Apple", logo: "https://picsum.photos/id/180/100/100", discount: "Up to 30% off" },
  { id: 2, name: "Samsung", logo: "https://picsum.photos/id/181/100/100", discount: "Up to 40% off" },
  { id: 3, name: "Sony", logo: "https://picsum.photos/id/182/100/100", discount: "Up to 25% off" },
  { id: 4, name: "Nike", logo: "https://picsum.photos/id/183/100/100", discount: "Up to 35% off" },
  { id: 5, name: "Adidas", logo: "https://picsum.photos/id/184/100/100", discount: "Up to 30% off" },
  { id: 6, name: "Dyson", logo: "https://picsum.photos/id/185/100/100", discount: "Up to 20% off" }
];

// Component chính
const DailyDeals = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [discountFilter, setDiscountFilter] = useState(0);
  const [filteredDeals, setFilteredDeals] = useState(REGULAR_DEALS);
  const [wishlist, setWishlist] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  const featuredSliderRef = useRef(null);
  const categoriesRef = useRef(null);
  const filtersRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset to 24 hours when countdown reaches zero
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  // Format time left for individual deals
  const formatDealTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${formatTime(hours)}:${formatTime(minutes)}`;
  };

  // Handle category change
  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredDeals(REGULAR_DEALS);
    } else {
      setFilteredDeals(REGULAR_DEALS.filter(deal => deal.category === activeCategory));
    }
  }, [activeCategory]);

  // Handle sorting
  useEffect(() => {
    let sorted = [...filteredDeals];
    
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case "price-high":
        sorted.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case "discount":
        sorted.sort((a, b) => b.discount - a.discount);
        break;
      case "ending":
        sorted.sort((a, b) => a.timeLeft - b.timeLeft);
        break;
      default:
        // Keep original order for "featured"
        break;
    }
    
    setFilteredDeals(sorted);
  }, [sortBy]);

  // Handle price range filter
  useEffect(() => {
    const filtered = REGULAR_DEALS.filter(deal => {
      const matchesCategory = activeCategory === "all" || deal.category === activeCategory;
      const matchesPrice = deal.salePrice >= priceRange[0] && deal.salePrice <= priceRange[1];
      const matchesDiscount = deal.discount >= discountFilter;
      
      return matchesCategory && matchesPrice && matchesDiscount;
    });
    
    setFilteredDeals(filtered);
  }, [priceRange, discountFilter, activeCategory]);

  // Handle sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (filtersRef.current) {
        setIsSticky(window.scrollY > filtersRef.current.offsetTop);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle wishlist
  const toggleWishlist = (dealId) => {
    if (wishlist.includes(dealId)) {
      setWishlist(wishlist.filter(id => id !== dealId));
      showNotificationWithTimeout("Removed from watchlist");
    } else {
      setWishlist([...wishlist, dealId]);
      showNotificationWithTimeout("Added to watchlist");
    }
  };

  // Show notification with timeout
  const showNotificationWithTimeout = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Scroll featured slider
  const scrollFeatured = (direction) => {
    if (featuredSliderRef.current) {
      const scrollAmount = direction === 'left' ? -featuredSliderRef.current.offsetWidth : featuredSliderRef.current.offsetWidth;
      featuredSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      // Update current slide
      const maxSlide = Math.ceil(FEATURED_DEALS.length / 2) - 1;
      if (direction === 'left') {
        setCurrentSlide(prev => Math.max(0, prev - 1));
      } else {
        setCurrentSlide(prev => Math.min(maxSlide, prev + 1));
      }
    }
  };

  // Scroll categories
  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Calculate progress for featured deals
  const calculateProgress = (sold, available) => {
    return (sold / available) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopMenu />
      <MainHeader />
      <SubMenu />
      
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 bg-[#0053A0] text-white px-4 py-2 rounded-md shadow-lg"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="max-w-[1300px] mx-auto px-4 py-4">
        {/* Daily Deals Header */}
        <div className="bg-gradient-to-r from-[#0053A0] to-[#00438A] rounded-lg p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Daily Deals</h1>
              <p className="text-white/80">Incredible savings, updated daily. Don't miss out!</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-center mr-4">
                <p className="text-sm">Deals refresh in:</p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="bg-white text-[#0053A0] rounded px-2 py-1 font-bold">
                    {formatTime(timeLeft.hours)}
                  </div>
                  <span>:</span>
                  <div className="bg-white text-[#0053A0] rounded px-2 py-1 font-bold">
                    {formatTime(timeLeft.minutes)}
                  </div>
                  <span>:</span>
                  <div className="bg-white text-[#0053A0] rounded px-2 py-1 font-bold">
                    {formatTime(timeLeft.seconds)}
                  </div>
                </div>
              </div>
              
              <button className="bg-white text-[#0053A0] hover:bg-white/90 px-4 py-2 rounded-full font-medium">
                Shop All Deals
              </button>
            </div>
          </div>
        </div>
        
        {/* Featured Deals Slider */}
        <div className="mb-8 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Deals</h2>
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(FEATURED_DEALS.length / 2) }).map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-[#0053A0]' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => scrollFeatured('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              disabled={currentSlide === 0}
            >
              <FiArrowLeft className={`h-6 w-6 ${currentSlide === 0 ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
            
            <div 
              ref={featuredSliderRef}
              className="flex overflow-x-hidden scroll-smooth"
            >
              {FEATURED_DEALS.map((deal) => (
                <div key={deal.id} className="min-w-[50%] md:min-w-[33.333%] lg:min-w-[25%] p-2">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col"
                  >
                    <div className="relative">
                      <img 
                        src={deal.image || "/placeholder.svg"} 
                        alt={deal.title} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-0 left-0 bg-[#e43147] text-white text-xs font-bold px-2 py-1 rounded-br-lg">
                        {deal.discount}% OFF
                      </div>
                      <button 
                        onClick={() => toggleWishlist(deal.id)}
                        className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white"
                      >
                        <FiHeart className={`h-5 w-5 ${wishlist.includes(deal.id) ? 'text-[#e43147] fill-[#e43147]' : 'text-gray-600'}`} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1.5 flex justify-between items-center">
                        <div className="flex items-center">
                          <FiClock className="mr-1 h-3 w-3" />
                          {formatDealTime(deal.timeLeft)} left
                        </div>
                        <div>
                          {deal.sold} sold
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 flex-grow">{deal.title}</h3>
                      
                      <div className="flex items-baseline mb-1">
                        <span className="text-lg font-bold text-gray-900">${deal.salePrice.toFixed(2)}</span>
                        <span className="ml-2 text-sm text-gray-500 line-through">${deal.originalPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <div className="flex items-center text-yellow-400 mr-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} className={`h-3 w-3 ${i < Math.floor(deal.rating) ? 'fill-yellow-400' : ''}`} />
                          ))}
                        </div>
                        <span>({deal.reviewCount.toLocaleString()})</span>
                        {deal.freeShipping && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="text-green-600 font-medium">Free shipping</span>
                          </>
                        )}
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div 
                          className="bg-[#0053A0] h-1.5 rounded-full" 
                          style={{ width: `${calculateProgress(deal.sold, deal.available)}%` }}
                        />
                      </div>
                      
                      <button className="w-full bg-[#0053A0] hover:bg-[#00438A] text-white py-2 rounded-full font-medium text-sm">
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => scrollFeatured('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              disabled={currentSlide === Math.ceil(FEATURED_DEALS.length / 2) - 1}
            >
              <FiArrowRight className={`h-6 w-6 ${currentSlide === Math.ceil(FEATURED_DEALS.length / 2) - 1 ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>
        
        {/* Deal Categories */}
        <div className="mb-8 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => scrollCategories('left')}
                className="bg-white rounded-full p-2 shadow-sm hover:bg-gray-100"
              >
                <FiArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button 
                onClick={() => scrollCategories('right')}
                className="bg-white rounded-full p-2 shadow-sm hover:bg-gray-100"
              >
                <FiArrowRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
          
          <div 
            ref={categoriesRef}
            className="flex overflow-x-auto scroll-smooth hide-scrollbar pb-2"
          >
            <div 
              className={`min-w-[150px] p-2 cursor-pointer ${activeCategory === 'all' ? 'opacity-100' : 'opacity-70'}`}
              onClick={() => setActiveCategory('all')}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br from-[#0053A0] to-[#00438A] rounded-lg p-4 text-center h-full ${activeCategory === 'all' ? 'ring-2 ring-[#0053A0] ring-offset-2' : ''}`}
              >
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="font-medium text-white">All Deals</h3>
                <p className="text-xs text-white/80 mt-1">{REGULAR_DEALS.length} items</p>
              </motion.div>
            </div>
            
            {DEAL_CATEGORIES.map((category) => (
              <div 
                key={category.id}
                className={`min-w-[150px] p-2 cursor-pointer ${activeCategory === category.name ? 'opacity-100' : 'opacity-70'}`}
                onClick={() => setActiveCategory(category.name)}
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`bg-white rounded-lg shadow-sm p-4 text-center h-full ${activeCategory === category.name ? 'ring-2 ring-[#0053A0] ring-offset-2' : ''}`}
                >
                  <div className="relative mb-2 h-12 w-12 mx-auto">
                    <img 
                      src={category.image || "/placeholder.svg"} 
                      alt={category.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xl">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{category.count} items</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Featured Brands */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {FEATURED_BRANDS.map((brand) => (
              <motion.div 
                key={brand.id}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer"
              >
                <div className="h-16 w-16 mx-auto mb-3 bg-gray-50 rounded-full p-2 flex items-center justify-center">
                  <img 
                    src={brand.logo || "/placeholder.svg"} 
                    alt={brand.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h3 className="font-medium text-gray-900">{brand.name}</h3>
                <p className="text-xs text-[#e43147] font-medium mt-1">{brand.discount}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Filters and Sorting */}
        <div 
          ref={filtersRef}
          className={`bg-white p-4 rounded-lg shadow-sm mb-6 ${isSticky ? 'sticky top-0 z-20 shadow-md' : ''}`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-sm font-medium text-gray-700 mr-4"
              >
                <FiFilter className="mr-1 h-4 w-4" />
                Filters
                <FiChevronDown className={`ml-1 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
                >
                  <FiGrid className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
                >
                  <FiList className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center w-full md:w-auto">
              <div className="text-sm text-gray-500 mr-2">Sort by:</div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-grow md:flex-grow-0 border-gray-300 rounded-md text-sm focus:ring-[#0053A0] focus:border-[#0053A0]"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
                <option value="ending">Ending Soon</option>
              </select>
              
              <button 
                onClick={() => {
                  setActiveCategory("all");
                  setPriceRange([0, 1000]);
                  setDiscountFilter(0);
                  setSortBy("featured");
                }}
                className="ml-2 flex items-center text-sm text-[#0053A0] hover:underline"
              >
                <FiRefreshCw className="mr-1 h-3 w-3" />
                Reset
              </button>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Price Range</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0053A0]"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Minimum Discount</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={discountFilter}
                      onChange={(e) => setDiscountFilter(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0053A0]"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>0%</span>
                    <span>{discountFilter}%+</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Shipping Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-[#0053A0] focus:ring-[#0053A0]" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Free Shipping</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-[#0053A0] focus:ring-[#0053A0]" />
                      <span className="ml-2 text-sm text-gray-700">Same Day Shipping</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-[#0053A0] focus:ring-[#0053A0]" />
                      <span className="ml-2 text-sm text-gray-700">Free Returns</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Deal Results */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today's Deals</h2>
            <div className="text-sm text-gray-500">{filteredDeals.length} results</div>
          </div>
          
          {filteredDeals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">😢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters to find more deals.</p>
              <button 
                onClick={() => {
                  setActiveCategory("all");
                  setPriceRange([0, 1000]);
                  setDiscountFilter(0);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0053A0] hover:bg-[#00438A]"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDeals.map((deal) => (
                <motion.div 
                  key={deal.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full"
                >
                  <div className="relative">
                    <img 
                      src={deal.image || "/placeholder.svg"} 
                      alt={deal.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-[#e43147] text-white text-xs font-bold px-2 py-1 rounded-br-lg">
                      {deal.discount}% OFF
                    </div>
                    <button 
                      onClick={() => toggleWishlist(deal.id)}
                      className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white"
                    >
                      <FiHeart className={`h-5 w-5 ${wishlist.includes(deal.id) ? 'text-[#e43147] fill-[#e43147]' : 'text-gray-600'}`} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1.5 flex items-center">
                      <FiClock className="mr-1 h-3 w-3" />
                      {formatDealTime(deal.timeLeft)} left
                    </div>
                  </div>
                  
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 flex-grow">{deal.title}</h3>
                    
                    <div className="flex items-baseline mb-1">
                      <span className="text-lg font-bold text-gray-900">${deal.salePrice.toFixed(2)}</span>
                      <span className="ml-2 text-sm text-gray-500 line-through">${deal.originalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <div className="flex items-center text-yellow-400 mr-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} className={`h-3 w-3 ${i < Math.floor(deal.rating) ? 'fill-yellow-400' : ''}`} />
                        ))}
                      </div>
                      <span>({deal.reviewCount.toLocaleString()})</span>
                      {deal.freeShipping && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="text-green-600 font-medium">Free shipping</span>
                        </>
                      )}
                    </div>
                    
                    <button className="w-full bg-[#0053A0] hover:bg-[#00438A] text-white py-2 rounded-full font-medium text-sm">
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeals.map((deal) => (
                <motion.div 
                  key={deal.id}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-48 h-48">
                      <img 
                        src={deal.image || "/placeholder.svg"} 
                        alt={deal.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 left-0 bg-[#e43147] text-white text-xs font-bold px-2 py-1 rounded-br-lg">
                        {deal.discount}% OFF
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1.5 flex items-center">
                        <FiClock className="mr-1 h-3 w-3" />
                        {formatDealTime(deal.timeLeft)} left
                      </div>
                    </div>
                    
                    <div className="p-4 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900 mb-1">{deal.title}</h3>
                        <button 
                          onClick={() => toggleWishlist(deal.id)}
                          className="ml-2 flex-shrink-0"
                        >
                          <FiHeart className={`h-5 w-5 ${wishlist.includes(deal.id) ? 'text-[#e43147] fill-[#e43147]' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <div className="flex items-center text-yellow-400 mr-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} className={`h-3 w-3 ${i < Math.floor(deal.rating) ? 'fill-yellow-400' : ''}`} />
                          ))}
                        </div>
                        <span>({deal.reviewCount.toLocaleString()})</span>
                        <span className="mx-1">•</span>
                        <span>{deal.category}</span>
                      </div>
                      
                      <div className="flex items-baseline mb-2">
                        <span className="text-xl font-bold text-gray-900">${deal.salePrice.toFixed(2)}</span>
                        <span className="ml-2 text-sm text-gray-500 line-through">${deal.originalPrice.toFixed(2)}</span>
                        <span className="ml-2 text-sm font-medium text-green-600">Save ${(deal.originalPrice - deal.salePrice).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        {deal.freeShipping && (
                          <div className="flex items-center mr-4">
                            <FiTruck className="mr-1 h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">Free shipping</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <FiShield className="mr-1 h-4 w-4 text-[#0053A0]" />
                          <span>Money Back Guarantee</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="bg-[#0053A0] hover:bg-[#00438A] text-white py-2 px-6 rounded-full font-medium text-sm">
                          Add to Cart
                        </button>
                        <button className="border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-6 rounded-full font-medium text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Newsletter Signup */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#0053A0] to-[#00438A] rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold mb-2">Never Miss a Deal</h2>
                <p className="text-white/80">Sign up for our newsletter to get personalized deals delivered to your inbox.</p>
              </div>
              
              <div className="w-full md:w-auto flex flex-col sm:flex-row">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full sm:w-64 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="mt-2 sm:mt-0 bg-white text-[#0053A0] hover:bg-gray-100 px-6 py-2 rounded-r-md font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DailyDeals;