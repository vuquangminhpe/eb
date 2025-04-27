import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import Footer from "../../components/Footer";
import { FileText } from "lucide-react";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";

export default function OrderHistory() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productMap, setProductMap] = useState({});

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser) return;
            try {
                const res = await fetch(`http://localhost:9999/orders?user_id=${currentUser.id}`);
                const data = await res.json();
                setOrders(data);

                const productRes = await fetch("http://localhost:9999/products");
                const productData = await productRes.json();

                const map = {};
                productData.forEach(p => {
                    map[p.title] = p;
                });

                setProductMap(map);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [currentUser]);

    if (!currentUser) {
        return (
            <div className="text-center py-20">
                Please <span onClick={() => navigate("/auth")} className="text-blue-500 underline cursor-pointer">login</span> to view order history.
            </div>
        );
    }

    return (
        <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
            <TopMenu />
            <MainHeader />
            <SubMenu />

            <div className="my-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FileText size={24} /> Order History
                </h2>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-gray-600">You have no past orders.</div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.order_id} className="border rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-gray-500">Order ID: <span className="font-semibold">{order.order_id}</span></div>
                                    <div className="text-sm text-gray-500">{moment(order.order_date).format("MMMM Do YYYY, h:mm A")}</div>
                                </div>

                                {/* Địa chỉ giao hàng */}
                                <div className="text-sm text-gray-600 mb-4">
                                    <div><span className="font-semibold">Shipping to:</span> {currentUser.fullname}</div>
                                    <div>{currentUser.address.street}, {currentUser.address.city}, {currentUser.address.zipcode}, {currentUser.address.country}</div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {order.items.map((item, index) => {
                                        const product = productMap[item.product_name];
                                        return (
                                            <div
                                                key={index}
                                                className="border p-3 rounded-md bg-gray-50 cursor-pointer hover:shadow"
                                                onClick={() => product && navigate(`/product/${product.id}`)}
                                            >
                                                {product?.url ? (
                                                    <img
                                                        src={`${product.url}/280`}
                                                        alt={item.product_name}
                                                        className="w-full h-36 object-cover rounded mb-2 opacity-90 hover:opacity-100 transition"
                                                    />
                                                ) : (
                                                    <div className="w-full h-36 bg-gray-200 rounded mb-2"></div>
                                                )}
                                                <div className="font-semibold mb-1">{item.product_name}</div>
                                                <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                                                <div className="text-sm text-gray-600">Price: £{item.price}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between mt-4 border-t pt-2 text-sm text-gray-700">
                                    <div>Status: <span className="font-medium text-blue-600">{order.status}</span></div>
                                    <div>Total: <span className="font-semibold">£{order.total_amount}</span></div>
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
