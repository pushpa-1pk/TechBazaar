const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
} = require("../controllers/orderController");

const { isAdmin } = require("../middlewares/adminMiddleware");
const {
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");


const { protect } = require("../middlewares/authMiddleware");

const { payOrder } = require("../controllers/orderController");

const router = express.Router();

//
// 🔐 USER ROUTES
//

// Create new order
router.post("/", protect, createOrder);

// Get logged-in user's orders
router.get("/my", protect, getMyOrders);
router.get("/seller/my", protect, getSellerOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

router.put("/:id/pay", protect, payOrder);

// Get all orders
router.get("/", protect, isAdmin, getAllOrders);

// Update order status
router.put("/:id/status", protect, isAdmin, updateOrderStatus);

module.exports = router;
