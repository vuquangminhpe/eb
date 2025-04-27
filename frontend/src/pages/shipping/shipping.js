import { useState, useEffect } from 'react'
import { Slip } from './slip';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';

const Shipping = () => {
    const API_URL = "http://localhost:5000/api";
    const [shippingInfo, setShippingInfo] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [modalPrintOpen, setModalPrintOpen] = useState(false);
    const [chosenInfo, setChosenInfo] = useState(null);
    const [formData, setFormData] = useState({
        _id: "",
        orderItemId: "",
        carrier: "",
        trackingNumber: "",
        estimatedArrival: "",
    });

    const handleUpdateShippingInfo = (e) => {
        fetch(`${API_URL}/shippingInfos/update/${formData._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                carrier: formData.carrier,
                trackingNumber: formData.trackingNumber,
                estimatedArrival: formData.estimatedArrival,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('success');
                fetchShippingInfo();
                setModalEditOpen(false);
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleGetDetailedShippingInfo = (id) => {
        fetch(`${API_URL}/shippingInfos/detailed/${id}`, { method: "GET" })
            .then((res) => res.json())
            .then((data) => {
                setChosenInfo(data);
            });
    };

    const fetchShippingInfo = () => {
        fetch(`${API_URL}/shippingInfos/seller/${currentUser.id}`, { method: "GET" })
            .then((res) => res.json())
            .then((data) => setShippingInfo(data));
    };

    useEffect(() => {
        const user = localStorage.getItem("currentUser");
        if (user) {
            setCurrentUser(JSON.parse(user));
            fetch(`${API_URL}/shippingInfos/seller/${JSON.parse(user).id}`, { method: "GET" })
                .then((res) => res.json())
                .then((data) => setShippingInfo(data));
        }
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-center">Shipping Info</h1>
            <table className="min-w-full bg-white border text-center">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border">Order Item ID</th>
                        <th className="py-2 px-4 border">Product</th>
                        <th className="py-2 px-4 border">Carrier</th>
                        <th className="py-2 px-4 border">Tracking Number</th>
                        <th className="py-2 px-4 border">Estimated Arrival</th>
                        <th className="py-2 px-4 border">Status</th>
                        <th className="py-2 px-4 border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {shippingInfo?.map((info) => (
                        <tr key={info._id}>
                            <td className="py-2 px-4 border">{info.orderItemId._id}</td>
                            <td className="py-2 px-4 border">{info.orderItemId.productId.title}</td>
                            <td className="py-2 px-4 border">{info.carrier}</td>
                            <td className="py-2 px-4 border">{info.trackingNumber}</td>
                            <td className="py-2 px-4 border">{info.estimatedArrival.split("T")[0]}</td>
                            <td className="py-2 px-4 border">{info.status.charAt(0).toUpperCase() + info.status.slice(1)}</td>
                            <td className="py-2 px-4 border">
                                {info.status === "shipping" && (
                                    <button onClick={() => { setModalEditOpen(true); setFormData(info); }} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2">Update</button>
                                )}
                                <button onClick={() => { handleGetDetailedShippingInfo(info._id); setModalPrintOpen(true) }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Print</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {modalEditOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Update Shipping Info</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateShippingInfo(e);
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Carrier</label>
                                <input
                                    name="carrier"
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.carrier}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Tracking Number</label>
                                <input
                                    name="trackingNumber"
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.trackingNumber}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Estimated Arrival</label>
                                <input
                                    name="estimatedArrival"
                                    type="date"
                                    className="w-full p-2 border rounded"
                                    value={formData.estimatedArrival.split("T")[0]}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save</button>
                            <button type="button" className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => setModalEditOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {modalPrintOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 w-full h-full">
                    <div className="bg-white p-6 rounded shadow-lg w-1/2 h-full">
                        <h1 className="text-xl font-bold mb-4 text-center">Preview PDF</h1>
                        <PDFViewer style={{ width: '100%', height: '87.5%' }}>
                            {chosenInfo && <Slip info={chosenInfo} />}
                        </PDFViewer>
                        <div className="flex items-center justify-center">
                            <PDFDownloadLink document={<Slip info={chosenInfo}/>} fileName="shipping.pdf">
                                <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 mt-6">Print</button>
                            </PDFDownloadLink>
                            <button type="button" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-6" onClick={() => setModalPrintOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Shipping
