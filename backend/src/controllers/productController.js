const Product = require("../models/Product");
const Order = require("../models/Order");
const { normalizeImages } = require("../utils/imageUploads");

const recalculateReviews = (product) => {
  product.reviewCount = product.reviews.length;
  product.rating = product.reviewCount
    ? Number(
        (
          product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviewCount
        ).toFixed(1)
      )
    : 0;
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.search?.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    if (req.query.minRating) {
      query.rating = { $gte: Number(req.query.minRating) };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only sellers can create products" });
    }

    const images = await normalizeImages(req.body.images, "techbazaar/products");

    const product = await Product.create({
      ...req.body,
      images,
      seller: req.user._id,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    const nextBody = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(req.body, "images")) {
      nextBody.images = await normalizeImages(req.body.images, "techbazaar/products");
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, nextBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment, images = [] } = req.body;
    const parsedRating = Number(rating);
    const cleanImages = await normalizeImages(images, "techbazaar/reviews", 3);

    if (!comment?.trim() || Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5 and comment is required" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const hasPurchased = await Order.exists({
      user: req.user._id,
      "orderItems.product": product._id,
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "You can review this product only after buying it" });
    }

    const existingReview = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      existingReview.rating = parsedRating;
      existingReview.comment = comment.trim();
      existingReview.name = req.user.name;
      existingReview.images = cleanImages;
    } else {
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating: parsedRating,
        comment: comment.trim(),
        images: cleanImages,
      });
    }

    recalculateReviews(product);
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can delete only your own review" });
    }

    review.deleteOne();
    recalculateReviews(product);
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};
