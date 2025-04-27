import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function SubMenu() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Các menu item cố định
    const staticMenuItems = [
        { id: "home", name: "Home", isStatic: true },
        { id: "saved", name: "Saved", isStatic: true },
        { id: "sell", name: "Sell", isStatic: true },
        { id: "product", name: "Your Product", isStatic: true },
        { id: "inventory", name: "Inventories", isStatic: true },
        { id: "dispute", name: "Manage Dispute", isStatic: true }
    ];

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:9999/categories");
                const data = await response.json();

                // Combine static items with categories from API
                const allItems = [
                    staticMenuItems[0],
                    staticMenuItems[1],
                    ...data,
                    staticMenuItems[2]
                ];

                setCategories(allItems);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setLoading(false);
                // Fallback to static menu items in case of error
                setCategories(staticMenuItems);
            }
        };

        fetchCategories();
    }, []);

    // Handle menu item click
    const handleMenuClick = (item) => {
        if (item.isStatic) {
            // Handle static menu items (Home, Saved, Sell)
            if (item.id === "home") {
                navigate("/");
            } else if (item.id === "product") {
                navigate("/products");
            }
            else if (item.id === "inventory") {
                navigate("/inventory");
            }
            else if (item.id === "dispute") {
                navigate("/disputes");
            }
        } else {
            // Navigate to list category page for category items
            navigate(`/list-category/${item.id}`);
        }
    };

    return (
        <>
            <div id="SubMenu" className="border-b">
                <div className="flex items-center justify-between w-full mx-auto max-w-[1200px]">
                    <ul
                        id="TopMenuLeft"
                        className="
                            flex 
                            items-center 
                            text-[13px] 
                            text-[#333333]
                            px-2 
                            h-8
                            overflow-x-auto
                        "
                    >
                        {loading ? (
                            <li className="px-3">Loading...</li>
                        ) : (
                            categories.map(item => (
                                <li
                                    key={item.id}
                                    className="px-3 hover:underline cursor-pointer whitespace-nowrap"
                                    onClick={() => handleMenuClick(item)}
                                >
                                    {item.name}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
}