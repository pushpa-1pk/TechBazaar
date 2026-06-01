const Order = require("../models/Order");
const Product = require("../models/Product");
const crypto = require("crypto");

const SHIPPING_METHODS = {
  standard: { charge: 49, days: 5 },
  express: { charge: 149, days: 2 },
  "same-day": { charge: 299, days: 0 },
};

const COUPONS = {
  SAVE10: {
    type: "percent",
    value: 10,
    expiresAt: new Date("2026-12-31T23:59:59.999Z"),
  },
  FLAT200: {
    type: "flat",
    value: 200,
    minSubtotal: 1500,
    expiresAt: new Date("2026-12-31T23:59:59.999Z"),
  },
  FREESHIP: {
    type: "shipping",
    value: 0,
    expiresAt: new Date("2026-12-31T23:59:59.999Z"),
  },
};

const roundCurrency = (value) => Math.round(value);

const calculateDiscount = ({ couponCode, subtotalAmount, shippingCharge }) => {
  if (!couponCode) {
    return { discountAmount: 0, normalizedCouponCode: "" };
  }

  const normalizedCouponCode = String(couponCode).trim().toUpperCase();
  const coupon = COUPONS[normalizedCouponCode];

  if (!coupon) {
    const error = new Error("Invalid coupon code");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    const error = new Error("Coupon code has expired");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.minSubtotal && subtotalAmount < coupon.minSubtotal) {
    const error = new Error(
      `Coupon requires a minimum subtotal of ${coupon.minSubtotal}`
    );
    error.statusCode = 400;
    throw error;
  }

  if (coupon.type === "percent") {
    return {
      discountAmount: roundCurrency((subtotalAmount * coupon.value) / 100),
      normalizedCouponCode,
    };
  }

  if (coupon.type === "flat") {
    return {
      discountAmount: Math.min(subtotalAmount, coupon.value),
      normalizedCouponCode,
    };
  }

  if (coupon.type === "shipping") {
    return {
      discountAmount: shippingCharge,
      normalizedCouponCode,
    };
  }

  return { discountAmount: 0, normalizedCouponCode: "" };
};

const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `ORDER-${year}-${suffix}`;
};

const reserveStock = async (productId, quantity) => {
  return Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );
};

const releaseReservedStock = async (reservedItems) => {
  await Promise.all(
    reservedItems.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      })
    )
  );
};

exports.createOrder = async (req, res, next) => {
  let reservedItems = [];

  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingMethod = "standard",
      couponCode = "",
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        message: "No order items provided",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const selectedShippingMethod =
      SHIPPING_METHODS[shippingMethod] || SHIPPING_METHODS.standard;

    const processedItems = [];
    let subtotalAmount = 0;

    for (const item of orderItems) {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        await releaseReservedStock(reservedItems);
        return res.status(400).json({
          message: "Each order item must have a valid quantity",
        });
      }

      const product = await reserveStock(item.product, quantity);

      if (!product) {
        await releaseReservedStock(reservedItems);
        return res.status(400).json({
          message: "Product is unavailable or out of stock",
        });
      }

      reservedItems.push({
        productId: product._id,
        quantity,
      });

      subtotalAmount += product.price * quantity;

      processedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    const shippingCharge = selectedShippingMethod.charge;
    const taxAmount = roundCurrency(subtotalAmount * 0.18);
    const { discountAmount, normalizedCouponCode } = calculateDiscount({
      couponCode,
      subtotalAmount,
      shippingCharge,
    });
    const totalAmount = Math.max(
      0,
      subtotalAmount + shippingCharge + taxAmount - discountAmount
    );
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(
      estimatedDeliveryDate.getDate() + selectedShippingMethod.days
    );

    let order;
    try {
      order = await Order.create({
        user: req.user._id,
        orderNumber: generateOrderNumber(),
        orderItems: processedItems,
        shippingAddress,
        subtotalAmount,
        shippingCharge,
        taxAmount,
        discountAmount,
        couponCode: normalizedCouponCode,
        totalAmount,
        shippingMethod,
        paymentMethod: paymentMethod || "mock",
        estimatedDeliveryDate,
        paymentStatus: "pending",
        orderStatus: "confirmed",
      });
    } catch (createError) {
      await releaseReservedStock(reservedItems);
      reservedItems = [];
      throw createError;
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    if (reservedItems.length > 0) {
      await releaseReservedStock(reservedItems);
      reservedItems = [];
    }
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "name images")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSellerOrders = async (req, res, next) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can view seller orders" });
    }

    const orders = await Order.find({ "orderItems.product": { $exists: true } })
      .populate("orderItems.product", "name images seller")
      .sort({ createdAt: -1 });

    const sellerOrders = orders
      .map((order) => {
        const sellerItems = order.orderItems.filter(
          (item) => String(item.product?.seller) === String(req.user._id)
        );

        if (!sellerItems.length) {
          return null;
        }

        return {
          ...order.toObject(),
          orderItems: sellerItems,
          sellerItemCount: sellerItems.reduce((sum, item) => sum + item.quantity, 0),
          sellerRevenue: sellerItems.reduce(
            (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
          ),
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: sellerOrders.length,
      orders: sellerOrders,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "orderItems.product",
      "name images"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (!["pending", "confirmed", "processing"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "Only pending or confirmed orders can be cancelled",
      });
    }

    order.orderStatus = "cancelled";

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

exports.payOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to pay this order",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order already paid",
      });
    }

    order.paymentStatus = "paid";
    order.paidAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment successful (mock)",
      order,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
