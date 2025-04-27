import { StyleSheet, View, Text, Page, Document } from '@react-pdf/renderer';

export const Slip = (props) => {
    const info = props.info;
    console.log(info);
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    <View>
                        <Text>Shipping ID: {info._id}</Text>
                        <Text>Order ID: {info.orderItemId.orderId._id}</Text>
                    </View>
                    
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.title}>From</Text>
                            <Text>Seller: {info.orderItemId.productId.sellerId.fullname}</Text>
                            <Text>Carrier: {info.carrier}</Text>
                            <Text>Tracking Number: {info.trackingNumber}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.title}>To</Text>
                            <Text>Buyer: {info.orderItemId.orderId.buyerId.fullname}</Text>
                            <Text>Phone Number: {info.orderItemId.orderId.addressId.phone}</Text>
                            <Text>Address: {info.orderItemId.orderId.addressId.street}, {info.orderItemId.orderId.addressId.city}, {info.orderItemId.orderId.addressId.country}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.title}>Product</Text>
                            <Text>{info.orderItemId.productId.title}</Text>
                            <Text> </Text>
                            <Text>{info.orderItemId.productId.description}</Text>
                            <Text> </Text>
                            <Text>Price: {info.orderItemId.productId.price}</Text>
                            <Text>Quantity: {info.orderItemId.quantity}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.title}>Other Information</Text>
                            <Text>Order Date: {info.orderItemId.orderId.orderDate.split("T")[0]}</Text>
                            <Text> </Text>
                            <Text>Estimated Arrival: {info.estimatedArrival.split("T")[0]}</Text>
                            <Text> </Text>
                            <Text>Status: {info.status.charAt(0).toUpperCase() + info.status.slice(1)}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.title}>Total</Text>
                            <Text>${info.orderItemId.productId.price * info.orderItemId.quantity}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.title}>Recipient Signature</Text>
                            <Text> </Text>
                            <Text> </Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10
    },
    column: {
        flex: 1,
        marginHorizontal: 5,
        border: '1px solid #000',
        padding: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

