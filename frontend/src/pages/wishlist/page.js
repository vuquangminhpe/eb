import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import Footer from "../../components/Footer";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlist(storedWishlist);
    }, []);

    const removeFromWishlist = (productId) => {
        const updatedWishlist = wishlist.filter(product => product.id !== productId);
        setWishlist(updatedWishlist);
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    };

    return (
        <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
            <div>
                <TopMenu />
                <MainHeader />
                <SubMenu />
            </div>

            <div className="max-w-[1300px] mx-auto p-4">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-600 mb-4">
                    <Link to="/" className="hover:underline cursor-pointer">Home</Link>

                </div>
                <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>

                {wishlist.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg">
                        Your wishlist is empty.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {wishlist.map(product => (
                            <div key={product.id} className="flex gap-4 p-4 border rounded-lg items-center">
                                <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={`${product.url}/400`}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => removeFromWishlist(product.id)}
                                        className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white"
                                    >
                                        <Heart size={20} color="red" fill="red" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <Link to={`/product/${product.id}`}>
                                        <h3 className="text-lg font-bold hover:text-blue-600 cursor-pointer">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {product.status === "available" ? "In Stock" : "Out of Stock"} · {product.category}
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-xl font-semibold text-black">
                                            ${product.price.toFixed(2)}
                                        </div>
                                        {product.originalPrice && (
                                            <div className="text-sm text-gray-500 line-through">
                                                Was: ${product.originalPrice.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">Free shipping</div>
                                    <div className="mt-2 text-sm text-gray-600">{product.sold || 0} sold</div>
                                    <div className="mt-2 text-sm">{product.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-10">
                <Footer />
            </div>
        </div>
    );
}
