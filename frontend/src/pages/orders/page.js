import { Truck } from "lucide-react"

import Footer from "../../components/Footer"
import TopMenu from "../../components/TopMenu"
import MainHeader from "../../components/MainHeader"
import SubMenu from "../../components/SubMenu"

// Mock orders data
const orders = [
    {
        id: 1,
        stripe_id: "pi_3NqLWI2eZvKYlo2C1bDj1234",
        name: "John Doe",
        address: "123 Main St",
        zipcode: "12345",
        city: "New York",
        country: "USA",
        total: 4499,
        created_at: "2024-02-20T10:00:00",
        orderItem: [
            {
                id: 1,
                product_id: 1,
                product: {
                    title: "Brown Leather Bag",
                    url: "https://picsum.photos/id/7",
                },
            },
            {
                id: 2,
                product_id: 2,
                product: {
                    title: "School Books",
                    url: "https://picsum.photos/id/20",
                },
            },
        ],
    },
]

export default function Orders() {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getDeliveryDate = (date) => {
        const deliveryDate = new Date(date)
        deliveryDate.setDate(deliveryDate.getDate() + 3)
        return formatDate(deliveryDate)
    }

    return (
        <>
            <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
                <div>
                    <TopMenu />
                    <MainHeader />
                    <SubMenu />
                </div>
                <div id="OrdersPage" className="mt-4 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
                    <div className="bg-white w-full p-6 min-h-[150px]">
                        <div className="flex items-center text-xl">
                            <Truck className="text-green-500" size={35} />
                            <span className="pl-4">Orders</span>
                        </div>

                        {orders.length < 1 ? <div className="flex items-center justify-center">You have no order history</div> : null}

                        {orders.map((order) => (
                            <div key={order?.id} className="text-sm pl-[50px]">
                                <div className="border-b py-1">
                                    <div className="pt-2">
                                        <span className="font-bold mr-2">Stripe ID:</span>
                                        {order?.stripe_id}
                                    </div>

                                    <div className="pt-2">
                                        <span className="font-bold mr-2">Delivery Address:</span>
                                        {order?.name}, {order?.address}, {order?.zipcode}, {order?.city}, {order?.country}
                                    </div>

                                    <div className="pt-2">
                                        <span className="font-bold mr-2">Total:</span>£{order?.total / 100}
                                    </div>

                                    <div className="pt-2">
                                        <span className="font-bold mr-2">Order Created:</span>
                                        {formatDate(order?.created_at)}
                                    </div>

                                    <div className="py-2">
                                        <span className="font-bold mr-2">Delivery Time:</span>
                                        {getDeliveryDate(order?.created_at)}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {order?.orderItem.map((item) => (
                                            <div key={item.id} className="flex items-center">
                                                <a className="py-1 hover:underline text-blue-500 font-bold" href={`/product/${item.product_id}`}>
                                                    <img className="rounded" width="120" src={`${item.product.url}/120`} alt={item.product.title} />
                                                    {item.product.title}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <Footer />
                </div>
            </div>
        </>
    )
}

