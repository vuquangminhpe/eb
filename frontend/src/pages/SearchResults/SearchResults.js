import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Footer from "../../components/Footer";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";

export default function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get("query") || "";

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortOrder, setSortOrder] = useState("relevance");

    // Clear search input and dropdown when navigating here
    useEffect(() => {
        setTimeout(() => {
            const searchInput = document.querySelector("input[placeholder='Search for anything']");
            if (searchInput) {
                searchInput.value = "";
                searchInput.blur();
            }
        }, 0);
    }, []);

    useEffect(() => {
        fetch("http://localhost:9999/products")
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
            });
    }, []);

    useEffect(() => {
        let result = products.filter((product) =>
            product.title.toLowerCase().includes(keyword.toLowerCase())
        );

        if (sortOrder === "lowToHigh") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "highToLow") {
            result.sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(result);
    }, [keyword, products, sortOrder]);

    return (
        <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
            <TopMenu />
            <MainHeader />
            <SubMenu />

            <div className="my-6 px-4">
                <h2 className="text-xl font-bold mb-4">
                    Search Results for: <span className="text-blue-600">"{keyword}"</span>
                </h2>

                <div className="mb-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        {filteredProducts.length} results found
                    </span>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="border px-3 py-1 text-sm rounded"
                    >
                        <option value="relevance">Sort: Best Match</option>
                        <option value="lowToHigh">Price: Low to High</option>
                        <option value="highToLow">Price: High to Low</option>
                    </select>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        No products match your search.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => navigate(`/product/${product.id}`)}
                                className="flex gap-4 border rounded-lg p-4 hover:shadow cursor-pointer"
                            >
                                <img
                                    src={`${product.url}/280`}
                                    alt={product.title}
                                    className="w-32 h-32 object-cover rounded"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">{product.title}</h3>
                                    <div className="text-gray-600 text-sm mb-2">
                                        {product.description?.substring(0, 100)}...
                                    </div>
                                    <div className="text-xl font-bold text-blue-600">
                                        £{(product.price / 100).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
