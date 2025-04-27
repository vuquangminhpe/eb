import { useState, useEffect } from 'react'

const PendingOrder = () => {
    const API_URL = "http://localhost:5000/api";
    const [orders, setOrders] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const fetchOrders = () => {
        fetch(`${API_URL}/orderItems/seller/${currentUser.id}`, { method: "GET" })
            .then((res) => res.json())
            .then((data) => setOrders(data));
    };

    const handleCreateShippingInfo = (id) => {
        fetch(`${API_URL}/shippingInfos/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderItemId: id }),
        })
            .then((res) => res.json())
            .catch((err) => console.log(err));
    };

    const handleUpdateShippingInfo = (id, status) => {
        fetch(`${API_URL}/shippingInfos/updateByOrderItemId/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: status }),
        })
            .then((res) => res.json())
            .catch((err) => console.log(err));
    };

    const handleAcceptOrder = (id) => {
        fetch(`${API_URL}/orderItems/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "shipping" }),
        })
            .then((res) => res.json())
            .then((data) => {
                fetchOrders();
                handleCreateShippingInfo(id);
            })
            .catch((err) => console.log(err));
    };

    const handleTryAgain = (id) => {
        fetch(`${API_URL}/orderItems/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "shipping" }),
        })
            .then((res) => res.json())
            .then((data) => {
                fetchOrders();
                handleUpdateShippingInfo(id, "shipping");
            })
            .catch((err) => console.log(err));
    };

    const handleRejectOrder = (id) => {
        fetch(`${API_URL}/orderItems/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "rejected" }),
        })
            .then((res) => res.json())
            .then((data) => {
                fetchOrders();
            })
    }

    const handleShipSuccess = (id) => {
        fetch(`${API_URL}/orderItems/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "shipped" }),
        })
            .then((res) => res.json())
            .then((data) => {
                fetchOrders();
                handleUpdateShippingInfo(id, "shipped");
            })
    }

    const handleShipFailed = (id) => {
        fetch(`${API_URL}/orderItems/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "failed to ship" }),
        })
            .then((res) => res.json())
            .then((data) => {
                fetchOrders();
                handleUpdateShippingInfo(id, "failed to ship");
            })
    }

    useEffect(() => {
        const user = localStorage.getItem("currentUser");
        if (user) {
            setCurrentUser(JSON.parse(user));
            fetch(`${API_URL}/orderItems/seller/${JSON.parse(user).id}`, { method: "GET" })
                .then((res) => res.json())
                .then((data) => setOrders(data));
        }
    }, []);
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-center">Pending Order</h1>
            <table className="min-w-full bg-white border text-center">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border">Order Item ID</th>
                        <th className="py-2 px-4 border">Product</th>
                        <th className="py-2 px-4 border">Quantity</th>
                        <th className="py-2 px-4 border">Price</th>
                        <th className="py-2 px-4 border">Total</th>
                        <th className="py-2 px-4 border">Status</th>
                        <th className="py-2 px-4 border" style={{ width: '180px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders && orders.map(order => (
                        <tr key={order._id}>
                            <td className="py-2 px-4 border">{order._id}</td>
                            <td className="py-2 px-4 border">
                                {order.productId.title}
                            </td>
                            <td className="py-2 px-4 border">{order.quantity}</td>
                            <td className="py-2 px-4 border">{order.productId.price}</td>
                            <td className="py-2 px-4 border">{order.productId.price * order.quantity}</td>
                            <td className="py-2 px-4 border">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</td>
                            <td className="py-2 px-4 border">
                                {order.status === "pending" && (
                                    <>
                                        <button onClick={() => handleAcceptOrder(order._id)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2">
                                            Accept
                                        </button>
                                        <button onClick={() => handleRejectOrder(order._id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                            Reject
                                        </button>
                                    </>
                                )}
                                {order.status === "shipping" && (
                                    <>
                                        <button onClick={() => handleShipSuccess(order._id)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2">
                                            Ship success
                                        </button>
                                        <button onClick={() => handleShipFailed(order._id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                            Ship failed
                                        </button>
                                    </>
                                )}
                                {
                                    order.status === "failed to ship" && (
                                        <button onClick={() => handleTryAgain(order._id)} className="px-4 py-2 bg-red-500 text-white rounded">
                                            Try again
                                        </button>
                                    )
                                }
                                {(order.status === "rejected" || order.status === "shipped") && (
                                    <button className="px-1 py-1 bg-gray-500 text-white rounded" disabled={true}>
                                        No action available
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    )
}

export default PendingOrder