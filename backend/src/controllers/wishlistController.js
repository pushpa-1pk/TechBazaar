import Wishlist from "../models/Wishlist.js";

export const addToWishlist = async (req, res) => {
  const item = new Wishlist({
    user: req.user._id,
    product: req.params.productId,
  });

  await item.save();
  res.json({ message: "Added to wishlist" });
};