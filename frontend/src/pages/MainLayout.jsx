"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiGrid,
  FiHeart,
  FiList,
  FiRefreshCw,
  FiSearch,
  FiShoppingCart,
  FiTrendingUp,
} from "react-icons/fi";

// Giả định các component này đã được tạo trong dự án của bạn
import Footer from "../components/Footer";
import MainHeader from "../components/MainHeader";
import Product from "../components/Product";
import SubMenu from "../components/SubMenu";
import TopMenu from "../components/TopMenu";

// Dữ liệu mẫu cho banner quảng cáo
const BANNER_SLIDES = [
  {
    id: 1,
    title: "Summer Sale Up to 70% Off",
    subtitle: "Discover amazing deals on thousands of items",
    cta: "Shop Now",
    image: "https://picsum.photos/id/26/1200/400",
    color: "from-blue-600 to-purple-600",
  },
  {
    id: 2,
    title: "New Tech Arrivals",
    subtitle: "The latest gadgets at unbeatable prices",
    cta: "Explore Tech",
    image: "https://picsum.photos/id/96/1200/400",
    color: "from-green-600 to-teal-600",
  },
  {
    id: 3,
    title: "Fashion Forward",
    subtitle: "Trending styles for every occasion",
    cta: "Shop Fashion",
    image: "https://picsum.photos/id/64/1200/400",
    color: "from-red-600 to-orange-600",
  },
];

// Dữ liệu mẫu cho các thương hiệu nổi bật
const FEATURED_BRANDS = [
  {
    id: 1,
    name: "Apple",
    logo: "https://picsum.photos/id/180/100/100",
    discount: "Up to 30% off",
  },
  {
    id: 2,
    name: "Samsung",
    logo: "https://picsum.photos/id/181/100/100",
    discount: "Up to 40% off",
  },
  {
    id: 3,
    name: "Sony",
    logo: "https://picsum.photos/id/182/100/100",
    discount: "Up to 25% off",
  },
  {
    id: 4,
    name: "Nike",
    logo: "https://picsum.photos/id/183/100/100",
    discount: "Up to 35% off",
  },
  {
    id: 5,
    name: "Adidas",
    logo: "https://picsum.photos/id/184/100/100",
    discount: "Up to 30% off",
  },
  {
    id: 6,
    name: "Dyson",
    logo: "https://picsum.photos/id/185/100/100",
    discount: "Up to 20% off",
  },
];

// Dữ liệu mẫu cho các xu hướng tìm kiếm
const TRENDING_SEARCHES = [
  "iPhone 15",
  "PlayStation 5",
  "Air Fryer",
  "Nike Air Jordan",
  "OLED TV",
  "Mechanical Keyboard",
  "Wireless Earbuds",
  "Smart Watch",
  "Lego Sets",
  "Outdoor Furniture",
];

// Dữ liệu mẫu cho các bộ sưu tập
const COLLECTIONS = [
  {
    id: 1,
    title: "Summer Essentials",
    image: "https://picsum.photos/id/28/600/300",
    itemCount: 156,
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: 2,
    title: "Tech Gadgets Under $100",
    image: "https://picsum.photos/id/48/600/300",
    itemCount: 89,
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: 3,
    title: "Home Office Setup",
    image: "https://picsum.photos/id/36/600/300",
    itemCount: 124,
    color: "from-green-400 to-teal-500",
  },
];

// Mapping hình ảnh danh mục
const CATEGORY_IMAGES = {
  Fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&h=500&fit=crop",
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=500&fit=crop",
  "Home & Kitchen":
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&h=500&fit=crop",
  "Health & Fitness":
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&h=500&fit=crop",
  Entertainment:
    "https://images.unsplash.com/photo-1511882150382-421056c89033?w=500&h=500&fit=crop",
};

// Component chính
const MainPage = () => {
  // State từ API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

  // State bổ sung cho UI nâng cao
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [wishlist, setWishlist] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const bannerRef = useRef(null);
  const categoriesRef = useRef(null);
  const filtersRef = useRef(null);
  const intervalRef = useRef(null); // Thêm ref để quản lý interval của banner

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await fetch("http://localhost:9999/products");
        const productsData = await productsResponse.json();

        const categoriesResponse = await fetch(
          "http://localhost:9999/categories"
        );
        const categoriesData = await categoriesResponse.json();

        setProducts(productsData);
        setCategories(categoriesData);

        // Set some random products as featured
        const randomProducts = [...productsData]
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        setFeaturedProducts(randomProducts);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm khởi tạo interval cho banner
  const startAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Xóa interval cũ nếu có
    }
    intervalRef.current = setInterval(() => {
      setCurrentBannerSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 3000);
  };

  // Xử lý tự động chạy banner
  useEffect(() => {
    startAutoSlide(); // Bắt đầu tự động chạy khi component mount

    // Cleanup khi component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Reset to first page when changing category
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Xử lý sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (filtersRef.current) {
        setIsSticky(window.scrollY > filtersRef.current.offsetTop);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(
        (product) => String(product.categoryId) === String(selectedCategory)
      )
    : products;

  // Xử lý sắp xếp sản phẩm
  const getSortedProducts = () => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      default:
        break;
    }

    return sorted;
  };

  // Tính toán phân trang
  const sortedProducts = getSortedProducts();
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (cat) => String(cat.id) === String(categoryId)
    );
    return category ? category.name : "Unknown Category";
  };

  // Xử lý thêm/xóa sản phẩm khỏi wishlist
  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      showNotificationWithTimeout("Removed from watchlist");
    } else {
      setWishlist([...wishlist, productId]);
      showNotificationWithTimeout("Added to watchlist");
    }
  };

  // Hiển thị thông báo với timeout
  const showNotificationWithTimeout = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    showNotificationWithTimeout(`${product.title} added to cart`);
  };

  // Xử lý xem sản phẩm
  const handleViewProduct = (product) => {
    if (!recentlyViewed.some((item) => item.id === product.id)) {
      setRecentlyViewed((prev) => [product, ...prev].slice(0, 4));
    }
  };

  // Chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Chuyển đến trang trước
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Chuyển đến trang sau
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Xử lý nhấn nút trái/phải cho banner
  const scrollBanner = (direction) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Dừng interval khi nhấn nút
    }

    if (direction === "left") {
      setCurrentBannerSlide(
        (prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length
      );
    } else {
      setCurrentBannerSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }

    startAutoSlide(); // Khởi động lại interval
  };

  // Cuộn danh mục
  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      categoriesRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Tính giá giảm giá (giả định giảm 10-30%)
  const calculateSalePrice = (price) => {
    const discount = Math.floor(Math.random() * 20) + 10; // 10-30%
    return ((price * (100 - discount)) / 100).toFixed(2);
  };

  // Tính phần trăm giảm giá
  const calculateDiscount = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white text-gray-900 transition-colors duration-300">
        <div className="bg-white shadow-sm">
          <div className="max-w-[1300px] mx-auto">
            <TopMenu />
            <MainHeader />
            <SubMenu />
          </div>
        </div>

        {/* Thông báo */}
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

        <div className="max-w-[1300px] mx-auto px-4">
          {/* Banner Carousel */}
          <div
            className="relative mb-8 rounded-xl overflow-hidden shadow-lg"
            ref={bannerRef}
          >
            <div className="relative h-[300px] md:h-[400px] overflow-hidden">
              {BANNER_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentBannerSlide
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r opacity-80 z-10"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${
                        slide.color.split(" ")[1]
                      }, transparent)`,
                    }}
                  ></div>
                  <img
                    src={slide.image || "/placeholder.svg"}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center z-20">
                    <div className="ml-8 md:ml-16 max-w-lg">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {slide.title}
                      </h2>
                      <p className="text-white/90 text-lg mb-6">
                        {slide.subtitle}
                      </p>
                      <button className="bg-white text-gray-900 hover:bg-gray-50 px-6 py-3 rounded-full font-medium shadow-md transition-transform hover:scale-105">
                        {slide.cta}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {BANNER_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                    }
                    setCurrentBannerSlide(index);
                    startAutoSlide();
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentBannerSlide ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Xu hướng tìm kiếm */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FiTrendingUp className="text-[#0053A0] mr-2" />
              <h2 className="text-lg font-medium">Trending Searches</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((search, index) => (
                <button
                  key={index}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full text-sm border border-gray-200 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Danh mục sản phẩm */}
          <div className="container mx-auto px-4 mt-10 mb-8">
            <div className="flex justify-center items-center space-x-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex flex-col items-center group"
              >
                <div
                  className={`w-40 h-40 rounded-full flex items-center justify-center bg-white mb-4 shadow-lg transition-all duration-300 overflow-hidden group-hover:shadow-xl ${
                    !selectedCategory ? "ring-3 ring-blue-500" : ""
                  }`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&h=500&fit=crop"
                    alt="All Categories"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span
                  className={`text-base font-semibold ${
                    !selectedCategory
                      ? "text-blue-600"
                      : "text-gray-700 group-hover:text-blue-500"
                  }`}
                >
                  All Categories
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`w-40 h-40 rounded-full flex items-center justify-center bg-white mb-4 shadow-lg transition-all duration-300 overflow-hidden group-hover:shadow-xl ${
                      selectedCategory === category.id
                        ? "ring-3 ring-blue-500"
                        : ""
                    }`}
                  >
                    <img
                      src={CATEGORY_IMAGES[category.name] || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span
                    className={`text-base font-semibold ${
                      selectedCategory === category.id
                        ? "text-blue-600"
                        : "text-gray-700 group-hover:text-blue-500"
                    }`}
                  >
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sản phẩm */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {selectedCategory
                  ? `${getCategoryName(selectedCategory)} Products`
                  : "All Products"}
              </h2>
              <div className="text-sm text-gray-500">
                {filteredProducts.length} results
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-gray-600">Loading products...</span>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <FiSearch size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  We couldn't find any products matching your criteria.
                </p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View all products
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {paginatedProducts.map((product) => (
                  <Product key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-48 flex-shrink-0">
                        <img
                          src={`${product.url}/300`}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-grow">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-lg text-gray-900 mb-1">
                              {product.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {getCategoryName(product.categoryId)}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {product.description}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-50"
                          >
                            <FiHeart
                              className={`${
                                wishlist.includes(product.id)
                                  ? "text-[#e43147] fill-[#e43147]"
                                  : "text-gray-400"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-gray-900">
                              £{(product.price / 100).toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {product.quantity > 0
                                ? `${product.quantity} available`
                                : "Out of stock"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center"
                          >
                            <FiShoppingCart className="mr-2" size={14} />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-8">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-4 py-2 rounded-full ${
                    currentPage === 1
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50 text-gray-700 border shadow-sm"
                  }`}
                >
                  <FiChevronLeft className="mr-1" size={12} /> Previous
                </button>

                <div className="hidden md:flex items-center">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    if (
                      totalPages <= 7 ||
                      index === 0 ||
                      index === totalPages - 1 ||
                      (index >= currentPage - 2 && index <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={index + 1}
                          onClick={() => paginate(index + 1)}
                          className={`w-10 h-10 mx-1 rounded-full ${
                            currentPage === index + 1
                              ? "bg-blue-600 text-white"
                              : "bg-white hover:bg-gray-50 text-gray-700 border shadow-sm"
                          }`}
                        >
                          {index + 1}
                        </button>
                      );
                    } else if (
                      (index === 1 && currentPage > 4) ||
                      (index === totalPages - 2 && currentPage < totalPages - 3)
                    ) {
                      return (
                        <span key={index} className="mx-1 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <div className="md:hidden flex items-center">
                  <span className="text-gray-600 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-4 py-2 rounded-full ${
                    currentPage === totalPages
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50 text-gray-700 border shadow-sm"
                  }`}
                >
                  Next <FiChevronRight className="ml-1" size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Bộ lọc và Sắp xếp */}
          <div
            ref={filtersRef}
            className={`bg-white p-4 rounded-lg shadow-sm mb-6 ${
              isSticky ? "sticky top-0 z-20 shadow-md" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-sm font-medium text-gray-700 mr-4"
                >
                  <FiFilter className="mr-1 h-4 w-4" />
                  Filters
                  <FiChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded ${
                      viewMode === "grid" ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <FiGrid className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded ${
                      viewMode === "list" ? "bg-gray-50" : "bg-white"
                    }`}
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
                  className="flex-grow md:flex-grow-0 border-gray-300 rounded-md text-sm focus:ring-[#0053A0] focus:border-[#0053A0] bg-white text-gray-900"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>

                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPriceRange([0, 1000]);
                    setSortBy("featured");
                  }}
                  className="ml-2 flex items-center text-sm text-[#0053A0] hover:underline"
                >
                  <FiRefreshCw className="mr-1 h-3 w-3" />
                  Reset
                </button>
              </div>
            </div>

            {/* Bộ lọc mở rộng */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Price Range
                    </h3>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            Number.parseInt(e.target.value),
                          ])
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0053A0]"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Item Condition
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0053A0] focus:ring-[#0053A0]"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">New</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0053A0] focus:ring-[#0053A0]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Used</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0053A0] focus:ring-[#0053A0]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Refurbished
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Shipping Options
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0053A0] focus:ring-[#0053A0]"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Free Shipping
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0053A0] focus:ring-[#0053A0]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Same Day Shipping
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0053A0] focus:ring-[#0053A0]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Free Returns
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bộ sưu tập */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Collections</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COLLECTIONS.map((collection) => (
                <motion.div
                  key={collection.id}
                  whileHover={{ scale: 1.03 }}
                  className="relative rounded-lg overflow-hidden shadow-lg h-48"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${collection.color} opacity-80`}
                  ></div>
                  <img
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-white text-xl font-bold mb-1">
                      {collection.title}
                    </h3>
                    <p className="text-white/90 text-sm mb-3">
                      {collection.itemCount} items
                    </p>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-2 px-4 rounded-full text-sm font-medium self-start">
                      Explore Collection
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Thương hiệu nổi bật */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Brands</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
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
                  <p className="text-xs text-[#e43147] font-medium mt-1">
                    {brand.discount}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Đăng ký nhận thông báo */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-[#0053A0] to-[#00438A] rounded-lg p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h2 className="text-xl font-bold mb-2">Never Miss a Deal</h2>
                  <p className="text-white/80">
                    Sign up for our newsletter to get personalized deals
                    delivered to your inbox.
                  </p>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full sm:w-64 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="mt-2 sm:mt-0 bg-white text-[#0053A0] hover:bg-gray-50 px-6 py-2 rounded-r-md font-medium">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-gray-300 text-white">
          <div className="max-w-[1300px] mx-auto">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
