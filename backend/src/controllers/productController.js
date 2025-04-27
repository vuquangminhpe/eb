const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const OrderItem = require('../models/OrderItem');
const Order = require('../models/Order');
// Tạo sản phẩm
// Tạo sản phẩm
// Tạo sản phẩm
exports.createProduct = async (req, res) => {
  try {
    const { sellerId, title, description, price, categoryId, image } = req.body;

    // Validate required fields
    if (!sellerId) return res.status(400).json({ error: "Seller ID is required" });
    if (!image) return res.status(400).json({ error: "Image URL is required" });

    // Create the product
    const product = await Product.create({ title, description, price, image, categoryId, sellerId });

    if (!product) {
      return res.status(500).json({ error: "Unable to create product" });
    }

    // No quantity for the product, it will be handled in the Inventory
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả sản phẩm (có tồn kho)
exports.getAllProducts = async (req, res) => {
  try {
    const { sellerId } = req.query;

    const filter = {};
    if (sellerId) filter.sellerId = sellerId;

    const products = await Product.find(filter)
      .populate('categoryId')
      .populate('sellerId')
      .lean();

    const withInventory = await Promise.all(
      products.map(async (product) => {
        const inventory = await Inventory.findOne({ productId: product._id });
        return { ...product, quantity: inventory?.quantity || 0 };
      })
    );

    res.json(withInventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạm ẩn sản phẩm
// Tạm ẩn (xoá mềm - chỉ xoá product)
exports.hideProduct = async (req, res) => {
    try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product hidden (deleted from list)', deleted });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

// Xoá sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      await Inventory.deleteOne({ productId: req.params.id });
      res.json({ message: 'Product and inventory deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
// Lấy chi tiết 1 sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId')
      .populate('sellerId')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const inventory = await Inventory.findOne({ productId: product._id });

    res.json({
      ...product,
      quantity: inventory?.quantity || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Đang bán
exports.getProductsBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Tìm tất cả các sản phẩm của sellerId
    const products = await Product.find({ sellerId }).lean();

    // Thêm thông tin tồn kho (nếu có) vào từng sản phẩm
    const withInventory = await Promise.all(
      products.map(async (product) => {
        const inventory = await Inventory.findOne({ productId: product._id }).lean();
        return { ...product, quantity: inventory?.quantity || 0 };
      })
    );

    res.json(withInventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lịch sử mua hàng
exports.getPurchasedProductsByBuyerId = async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Tìm tất cả các đơn hàng của buyerId
    const orders = await Order.find({ buyerId }, '_id').lean();
    const orderIds = orders.map((order) => order._id);

    // Lấy danh sách OrderItems từ các đơn hàng
    const orderItems = await OrderItem.find({ orderId: { $in: orderIds } }, '_id productId quantity unitPrice').lean();

    // Lấy thông tin chi tiết sản phẩm
    const productIds = orderItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }, '_id title price images categoryId').lean();

    // Kết hợp thông tin sản phẩm với OrderItems
    const purchasedProducts = orderItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId.toString());
      return {
        ...item,
        product,
      };
    });

    res.json(purchasedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đã bán
exports.getSoldProductsBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Tìm tất cả các sản phẩm của sellerId
    const products = await Product.find({ sellerId }).lean();

    // Lấy danh sách productIds từ những sản phẩm của seller
    const productIds = products.map((product) => product._id);

    // Lấy danh sách OrderItems liên quan đến các sản phẩm này, chỉ khi Order.status = "shipped"
    const soldItems = await OrderItem.find({ productId: { $in: productIds } })
      .populate({
        path: "orderId", // Populate để lấy thông tin Order
        select: "status", // Chỉ lấy trường status từ Order
        match: { status: "shipped" }, // Chỉ lấy các Order có trạng thái "shipped"
      })
      .lean();

    // Lọc ra các OrderItem có Order hợp lệ (tức là Order.status = "shipped")
    const filteredSoldItems = soldItems.filter((item) => item.orderId); // Loại bỏ các OrderItem không có Order khớp

    // Kết hợp thông tin sản phẩm với OrderItem, thêm unitPrice
    const soldProducts = filteredSoldItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId.toString());
      return {
        ...item,
        product, // Thông tin chi tiết sản phẩm
        unitPrice: item.unitPrice || product.price, // Lấy unitPrice từ OrderItem hoặc giá gốc từ Product
      };
    });

    // Tính tổng giá (total revenue)
    const totalRevenue = soldProducts.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);

    // Trả về danh sách sản phẩm đã bán và tổng doanh thu
    res.json({ soldProducts, totalRevenue });
  } catch (err) {
    console.error("Error in getSoldProductsBySellerId:", err);
    res.status(500).json({ error: err.message });
  }
};

//tổng số lượng sản phẩm đã mua
exports.getTotalPurchasedProducts = async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Tìm tất cả các đơn hàng của buyerId
    const orders = await Order.find({ buyerId }, '_id').lean();
    const orderIds = orders.map((order) => order._id);

    // Lấy danh sách OrderItems từ các đơn hàng
    const orderItems = await OrderItem.find({ orderId: { $in: orderIds } }, 'quantity').lean();

    // Tính tổng số lượng sản phẩm
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ totalQuantity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//số sản phẩm
exports.getTotalQuantityOnSale = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Tìm tất cả các sản phẩm của sellerId
    const products = await Product.find({ sellerId }, '_id').lean();
    const productIds = products.map((product) => product._id);

    // Lấy danh sách tồn kho của các sản phẩm có quantity > 0
    const uniqueProducts = await Inventory.find({ productId: { $in: productIds }, quantity: { $gt: 0 } }, 'productId').distinct('productId').lean();

    // Số lượng sản phẩm khác nhau
    const totalDistinctProducts = uniqueProducts.length;

    res.json({ totalDistinctProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
