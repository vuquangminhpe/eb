import { useState, useEffect } from "react";

const Coupon = () => {
    const API_URL = "http://localhost:5000/api";
    const [products, setProducts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [chosenCoupon, setChosenCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        discountPercent: "",
        startDate: "",
        endDate: "",
        maxUsage: "",
        productId: "",
    });
    const [coupons, setCoupons] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const { discountPercent, startDate, endDate } = formData;
        if (discountPercent < 0 || discountPercent > 100) {
            alert("Discount percent must be between 0 and 100");
            return;
        }
        if (startDate > endDate) {
            alert("Start date must be smaller than end date");
            return;
        }
        if (chosenCoupon) {
            fetch(`${API_URL}/coupons/update/${chosenCoupon._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
                .then((res) => res.json())
                .then((data) => {
                    fetchCoupons();
                    setFormData({
                        code: "",
                        discountPercent: "",
                        startDate: "",
                        endDate: "",
                        maxUsage: "",
                        productId: "",
                    });
                })
                .catch((err) => console.log(err));
        } else
            fetch(`${API_URL}/coupons/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            }).then((res) => res.json()).then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    fetchCoupons();
                    setFormData({
                        code: "",
                        discountPercent: "",
                        startDate: "",
                        endDate: "",
                        maxUsage: "",
                        productId: "",
                    });
                }
            })
        setModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDelete = (couponId) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            fetch(`${API_URL}/coupons/delete/${couponId}`, { method: "DELETE" })
                .then((res) => res.json())
                .then((data) => {
                    fetchCoupons();
                })
                .catch((err) => console.log(err));
        }
    };

    const fetchCoupons = () => {
        fetch(`${API_URL}/coupons/seller/${currentUser.id}`, { method: "GET" })
            .then(res => res.json())
            .then(data => setCoupons(data));
    };

    useEffect(() => {
        setFormData({
            code: chosenCoupon ? chosenCoupon.code : "",
            discountPercent: chosenCoupon ? chosenCoupon.discountPercent : "",
            startDate: chosenCoupon ? chosenCoupon.startDate.split("T")[0] : "",
            endDate: chosenCoupon ? chosenCoupon.endDate.split("T")[0] : "",
            maxUsage: chosenCoupon ? chosenCoupon.maxUsage : "",
            productId: chosenCoupon ? chosenCoupon.productId._id : "",
        })
    }, [chosenCoupon]);

    useEffect(() => {
        const user = localStorage.getItem("currentUser");
        if (user) {
            setCurrentUser(JSON.parse(user));
            fetch(`${API_URL}/products/seller/${JSON.parse(user).id}`, { method: "GET" })
                .then(res => res.json())
                .then(data => setProducts(data));
            fetch(`${API_URL}/coupons/seller/${JSON.parse(user).id}`, { method: "GET" })
                .then(res => res.json())
                .then(data => setCoupons(data));
        }
    }, []);


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>All coupons</h1>
                <button onClick={() => setModalOpen(true)} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Add a new coupon</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Product Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Code</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Discount Percent</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Start Date</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>End Date</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Remaining Usage</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {coupons?.map((coupon) => (
                        <tr key={coupon._id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{coupon.productId.title}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{coupon.code}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{coupon.discountPercent}%</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(coupon.startDate).toLocaleDateString()}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(coupon.endDate).toLocaleDateString()}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{coupon.maxUsage || 'Unlimited'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button style={{ borderRadius: '8px', backgroundColor: 'orange', color: 'white', border: 'none', padding: '8px 16px', cursor: 'pointer', marginRight: '8px' }} onClick={() => (setModalOpen(true), setChosenCoupon(coupon))}>Edit</button>
                                <button style={{ borderRadius: '8px', backgroundColor: 'red', color: 'white', border: 'none', padding: '8px 16px', cursor: 'pointer' }} onClick={() => handleDelete(coupon._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {modalOpen &&
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">{chosenCoupon ? "Edit Coupon" : "Add New Coupon"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Product Name</label>
                                <select
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                                    value={formData?.productId || ""}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select a product</option>
                                    {products?.map((product) => (
                                        <option key={product._id} value={product._id}>
                                            {product.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Code</label>
                                <input type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full p-2 border rounded" required disabled={chosenCoupon ? true : false} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Discount Percent</label>
                                <input type="number" name="discountPercent" value={formData.discountPercent} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full p-2 border rounded" required disabled={chosenCoupon ? true : false} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">End Date</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Max Usage</label>
                                <input type="number" name="maxUsage" value={formData.maxUsage} onChange={handleInputChange} className="w-full p-2 border rounded" />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => (setModalOpen(false), setChosenCoupon(null))} className="px-4 py-2 text-gray-600 hover:text-gray-800"> Cancel </button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"> {chosenCoupon ? 'Save Changes' : 'Add'} </button>
                            </div>
                        </form>
                    </div>
                </div>
            }
        </div>
    );
}

export default Coupon;
