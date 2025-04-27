import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function MainHeader() {
    const navigate = useNavigate();
    // State to store the fetched products
    const [products, setProducts] = useState([]);
    // State to store the search query
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch products from the API when the component mounts
    useEffect(() => {
        fetch('http://localhost:9999/products')
            .then(response => response.json())
            .then(data => setProducts(data))
            .catch(error => console.error('Error fetching products:', error));
    }, []);

    // Filter products based on the search query
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div id="MainHeader" className="border-b">
            <nav className="flex items-center justify-between w-full mx-auto max-w-[1200px]">
                <div className="flex items-center w-full bg-white">
                    <div className="flex lg:justify-start justify-between gap-10 max-w-[1150px] w-full px-3 py-5 mx-auto">
                        <a href="/">
                            <img width="120" src="/images/logo.svg" alt="Logo" />
                        </a>

                        <div className="w-full">
                            <div className="relative">
                                <form onSubmit={handleSubmit} className="flex items-center w-full">
                                    <div className="relative flex items-center border-2 border-gray-900 w-full p-2">
                                        <Search size={22} />

                                        <input
                                            className="w-full placeholder-gray-400 text-sm pl-3 focus:outline-none"
                                            placeholder="Search for anything"
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="flex items-center bg-blue-600 text-sm font-semibold text-white p-[11px] ml-2 px-14"
                                    >
                                        Search
                                    </button>

                                    <a href="#" className="text-xs px-2 hover:text-blue-500 cursor-pointer">
                                        Advanced
                                    </a>
                                </form>


                                {/* Dropdown with search results */}
                                {searchQuery.length > 0 && (
                                    <div className="absolute bg-white max-w-[910px] h-auto w-full z-20 left-0 top-12 border p-1">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(product => (
                                                <div key={product.id} className="p-1">
                                                    <a
                                                        href={`/product/${product.id}`}
                                                        className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-200 p-1 px-2"
                                                    >
                                                        <div className="flex items-center">

                                                            <div className="truncate ml-2">{product.title}</div>
                                                        </div>
                                                        <div className="truncate">£{product.price}</div>
                                                    </a>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-gray-500">No products found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}