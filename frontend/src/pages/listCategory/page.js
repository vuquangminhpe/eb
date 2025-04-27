import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  FiChevronDown, 
  FiHeart, 
  FiMenu, 
  FiGrid, 
  FiList, 
  FiFilter, 
  FiShoppingCart, 
  FiStar, 
  FiTruck, 
  FiChevronRight 
} from "react-icons/fi";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import Footer from "../../components/Footer";

// Import components (these would be in separate files)


// Filter configurations for different categories
const categoryFilters = {
  1: [ // Fashion
    { name: "Size", options: ["S", "M", "L", "XL"] },
    { name: "Color", options: ["Black", "White", "Blue", "Red"] },
    { name: "Material", options: ["Cotton", "Leather", "Wool", "Synthetic"] },
    { name: "Price", options: ["Under $25", "$25-$50", "$50-$100", "Over $100"] },
    { name: "Condition", options: ["New", "Used", "Refurbished"] },
  ],
  2: [ // Electronics
    { name: "Brand", options: ["Apple", "Samsung", "Sony", "Microsoft"] },
    { name: "Model", options: ["Model A", "Model B", "Model C"] },
    { name: "Storage Capacity", options: ["64GB", "128GB", "256GB", "512GB"] },
    { name: "Price", options: ["Under $500", "$500-$1000", "Over $1000"] },
    { name: "Condition", options: ["New", "Used", "Refurbished"] },
  ],
  // Other categories remain the same...
  default: [
    { name: "Price", options: ["Low to High", "High to Low"] },
    { name: "Condition", options: ["New", "Used", "Refurbished"] },
    { name: "Buying Format", options: ["All Listings", "Auction", "Buy It Now"] },
  ]
};

// Subcategories for each main category
const categorySubcategories = {
  1: ["Men's Clothing", "Women's Clothing", "Shoes", "Jewelry & Watches", "Accessories", "Kids' Clothing", "Vintage & Collectible", "Handbags & Wallets", "Costumes & Formal Wear", "Cultural Clothing"],
  2: ["Smartphones & Accessories", "Computers & Tablets", "Cameras & Photography", "TV & Home Audio", "Wearable Technology", "Video Games & Consoles", "Computer Components", "Home Surveillance", "Vehicle Electronics", "Virtual Reality"],
  // Other subcategories remain the same...
  default: ["Popular Items", "New Arrivals", "Top Rated", "Best Sellers", "Special Offers", "Clearance", "Featured Brands", "Trending Now", "Recommended For You", "Seasonal Items"]
};

export default function ListCategory() {
  // Extract categoryId from URL params
  const { categoryId } = useParams();
  const numericCategoryId = categoryId;

  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list view
  const [activeFilters, setActiveFilters] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories
        const allCategoriesResponse = await fetch("http://localhost:9999/categories");
        const allCategories = await allCategoriesResponse.json();
        setAllCategories(allCategories);

        // Find category by id
        const currentCategory = allCategories.find(cat => String(cat.id) === String(numericCategoryId));
        if (currentCategory) {
          setCategory(currentCategory);
        } else {
          throw new Error("Category not found");
        }

        // Fetch products for this category
        const productsResponse = await fetch(`http://localhost:9999/products?categoryId=${numericCategoryId}`);
        const productsData = await productsResponse.json();
        setProducts(productsData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (numericCategoryId) {
      fetchData();
    }
  }, [numericCategoryId]);

  // Load Wishlist from localStorage
  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(storedWishlist);
  }, []);

  // Check if product is in wishlist
  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  // Toggle wishlist
  const toggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let updatedWishlist;
    if (isInWishlist(product.id)) {
      updatedWishlist = wishlist.filter(item => item.id !== product.id);
    } else {
      updatedWishlist = [...wishlist, product];
    }

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  // Get subcategories based on current category
  const getSubcategories = () => {
    return categorySubcategories[numericCategoryId] || categorySubcategories.default;
  };

  // Get filters based on current category
  const getFilters = () => {
    return categoryFilters[numericCategoryId] || categoryFilters.default;
  };

  // Toggle filter
  const toggleFilter = (filterName, option) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (!newFilters[filterName]) {
        newFilters[filterName] = [option];
      } else if (newFilters[filterName].includes(option)) {
        newFilters[filterName] = newFilters[filterName].filter(item => item !== option);
        if (newFilters[filterName].length === 0) {
          delete newFilters[filterName];
        }
      } else {
        newFilters[filterName] = [...newFilters[filterName], option];
      }
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
  };

  // Filter products based on active tab and filters
  const filteredProducts = products.filter(product => {
    // Filter by tab
    if (activeTab === "all") return true;
    if (activeTab === "available") return product.status === "available";
    if (activeTab === "unavailable") return product.status === "unavailable";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopMenu />
        <MainHeader />
        <SubMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopMenu />
        <MainHeader />
        <SubMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h2>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopMenu />
      <MainHeader />
      <SubMenu />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li className="flex items-center">
              <FiChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              <span className="text-gray-900 font-medium">{category.name}</span>
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Browse our selection of {category.name.toLowerCase()} products. 
            Find great deals on top brands and quality items.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Mobile filter dialog */}
          <div className={`fixed inset-0 z-40 lg:hidden ${showMobileFilters ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowMobileFilters(false)}></div>
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button 
                  type="button" 
                  className="-mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile filters */}
              <div className="divide-y divide-gray-200">
                <div className="py-6">
                  <h3 className="font-medium text-gray-900">Categories</h3>
                  <ul className="mt-4 space-y-3">
                    {getSubcategories().map((subcategory, index) => (
                      <li key={index} className="flex items-center">
                        <a href="#" className="text-gray-600 hover:text-blue-600">
                          {subcategory}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {getFilters().map((filter, filterIndex) => (
                  <div key={filterIndex} className="py-6">
                    <h3 className="font-medium text-gray-900">{filter.name}</h3>
                    <ul className="mt-4 space-y-2">
                      {filter.options.map((option, optionIndex) => (
                        <li key={optionIndex} className="flex items-center">
                          <input
                            id={`mobile-${filter.name}-${optionIndex}`}
                            name={`${filter.name}[]`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={activeFilters[filter.name]?.includes(option) || false}
                            onChange={() => toggleFilter(filter.name, option)}
                          />
                          <label htmlFor={`mobile-${filter.name}-${optionIndex}`} className="ml-3 text-gray-600">
                            {option}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Apply filters button */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shop by Category</h2>
              <ul className="space-y-3">
                {getSubcategories().map((subcategory, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-600 hover:text-blue-600 block py-1">
                      {subcategory}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shop by Store</h2>
                <ul className="space-y-3">
                  {allCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/list-category/${cat.id}`}
                        className={`block py-1 ${numericCategoryId === String(cat.id) 
                          ? "font-medium text-blue-600" 
                          : "text-gray-600 hover:text-blue-600"}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desktop Filters */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
                
                {getFilters().map((filter, filterIndex) => (
                  <div key={filterIndex} className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">{filter.name}</h3>
                    <div className="space-y-2">
                      {filter.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center">
                          <input
                            id={`desktop-${filter.name}-${optionIndex}`}
                            name={`${filter.name}[]`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={activeFilters[filter.name]?.includes(option) || false}
                            onChange={() => toggleFilter(filter.name, option)}
                          />
                          <label htmlFor={`desktop-${filter.name}-${optionIndex}`} className="ml-3 text-gray-600">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(activeFilters).length > 0 && (
                  <button
                    type="button"
                    className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-6 lg:mt-0 lg:col-span-3">
            {/* Mobile filter button */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowMobileFilters(true)}
              >
                <FiFilter className="mr-2 h-5 w-5 text-gray-400" />
                Filters
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FiGrid className="h-5 w-5 text-gray-500" />
                </button>
                <button
                  type="button"
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
                  onClick={() => setViewMode('list')}
                >
                  <FiList className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Tabs and Results Count */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-4 mb-4 sm:mb-0">
                  <div className="inline-flex rounded-md shadow-sm">
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                        activeTab === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border border-gray-300`}
                      onClick={() => setActiveTab('all')}
                    >
                      All Listings
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'available'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border-t border-b border-gray-300`}
                      onClick={() => setActiveTab('available')}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                        activeTab === 'unavailable'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border border-gray-300`}
                      onClick={() => setActiveTab('unavailable')}
                    >
                      Out of Stock
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {filteredProducts.length} Results
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="hidden lg:flex items-center space-x-2 mr-4">
                    <button
                      type="button"
                      className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <FiGrid className="h-5 w-5 text-gray-500" />
                    </button>
                    <button
                      type="button"
                      className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <FiList className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span>Best Match</span>
                      <FiChevronDown className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active filters */}
              {Object.keys(activeFilters).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-gray-700">Active filters:</h3>
                    <button
                      type="button"
                      className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                      onClick={clearFilters}
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(activeFilters).map(([filterName, options]) => 
                      options.map((option, index) => (
                        <span 
                          key={`${filterName}-${index}`}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {filterName}: {option}
                          <button
                            type="button"
                            className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                            onClick={() => toggleFilter(filterName, option)}
                          >
                            <span className="sr-only">Remove filter for {filterName}</span>
                            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                              <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Product List */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try changing your filters or search criteria.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.id}`}
                    className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="relative aspect-w-4 aspect-h-3">
                      <img
                        src={`${product.url}/400`}
                        alt={product.title}
                        className="w-full h-48 object-cover object-center"
                      />
                      {product.status === "unavailable" && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-bl-md">
                          Sold Out
                        </div>
                      )}
                      <button
                        onClick={(e) => toggleWishlist(product, e)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm"
                      >
                        <FiHeart
                          className={`h-5 w-5 ${isInWishlist(product.id) ? "text-red-500 fill-red-500" : "text-gray-600"}`}
                        />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            ${(product.price / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 line-through">
                            ${((product.price * 1.2) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                          {(Math.random() * 2 + 3).toFixed(1)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <FiTruck className="h-4 w-4 mr-1" />
                        Free shipping
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          product.status === "available" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {product.status === "available" ? "In Stock" : "Out of Stock"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.floor(Math.random() * 200) + 1} sold
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-48 sm:h-48">
                        <img
                          src={`${product.url}/400`}
                          alt={product.title}
                          className="w-full h-48 object-cover object-center"
                        />
                        {product.status === "unavailable" && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-bl-md">
                            Sold Out
                          </div>
                        )}
                        <button
                          onClick={(e) => toggleWishlist(product, e)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm"
                        >
                          <FiHeart
                            className={`h-5 w-5 ${isInWishlist(product.id) ? "text-red-500 fill-red-500" : "text-gray-600"}`}
                          />
                        </button>
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="text-base font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="mt-1 text-sm text-gray-500">
                          {product.status === "available" ? "In Stock" : "Out of Stock"} · {category.name}
                        </div>
                        <div className="mt-2 flex items-start">
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              ${(product.price / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                              Was: ${((product.price * 1.2) / 100).toFixed(2)}
                            </p>
                          </div>
                          <div className="ml-auto flex items-center text-sm text-gray-500">
                            <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                            {(Math.random() * 2 + 3).toFixed(1)}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <FiTruck className="h-4 w-4 mr-1" />
                          Free shipping
                        </div>
                        <div className="mt-1 flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {Math.floor(Math.random() * 200) + 1} sold
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Add to cart functionality would go here
                            }}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FiShoppingCart className="mr-1 h-4 w-4" />
                            Add to Cart
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-current="page"
                    className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    1
                  </a>
                  <a
                    href="#"
                    className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    2
                  </a>
                  <a
                    href="#"
                    className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    3
                  </a>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                  <a
                    href="#"
                    className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    8
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}