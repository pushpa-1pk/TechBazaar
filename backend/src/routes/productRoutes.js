const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  addReview,
  deleteReview,
} = require("../controllers/productController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/my/products",
  protect,
  async (req, res, next) => {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can view their products" });
    }
    next();
  },
  getMyProducts
);

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.post("/:id/reviews", protect, addReview);
router.delete("/:id/reviews/:reviewId", protect, deleteReview);

module.exports = router;
