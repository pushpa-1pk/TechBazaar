import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RelevantProducts from "../components/RelevantProducts";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getMyOrders } from "../api/orders";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  addReview,
  deleteProduct,
  deleteReview,
  getProductById,
  updateProduct,
} from "../api/products";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "", images: [] });
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [productError, setProductError] = useState("");
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [hasPurchasedProduct, setHasPurchasedProduct] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        setEditForm({
          name: data.name,
          description: data.description,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? 0,
          offer: data.offer || "",
          freeDelivery: Boolean(data.freeDelivery),
          stock: data.stock,
        });
        setSelectedImage(0);
        setQuantity(1);
      } catch (error) {
        console.error(error);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadPurchaseState = async () => {
      if (!user || user.role !== "buyer") {
        setHasPurchasedProduct(false);
        return;
      }

      try {
        setCheckingPurchase(true);
        const orders = await getMyOrders();
        const purchased = orders.some((order) =>
          order.orderItems?.some((item) => String(item.product) === id)
        );
        setHasPurchasedProduct(purchased);
      } catch (error) {
        console.error(error);
        setHasPurchasedProduct(false);
      } finally {
        setCheckingPurchase(false);
      }
    };

    loadPurchaseState();
  }, [id, user]);

  const gallery = useMemo(() => {
    if (!product?.images?.length) {
      return ["https://placehold.co/700x700/f8fafc/0f172a?text=No+Image"];
    }

    return product.images;
  }, [product]);

  if (!product) {
    return <p className="p-8 text-center text-slate-500">Loading product...</p>;
  }

  const rating = Number(product.rating ?? 0).toFixed(1);
  const reviews = product.reviewCount ?? product.reviews?.length ?? 0;
  const compareAtPrice = Number(product.compareAtPrice ?? 0);
  const hasDiscount = compareAtPrice > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - Number(product.price)) / compareAtPrice) * 100)
    : 0;
  const offerLabel = product.offer?.trim() || "";
  const isOwnerSeller = user?.role === "seller" && user?.id === String(product.seller);
  const canLeaveReview = user?.role === "buyer" && hasPurchasedProduct;
  const activeWishlist = isWishlisted(product._id);

  const handleBuy = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    addToCart(product, quantity);
    navigate("/checkout");
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(product._id);
      navigate("/products");
    } catch (error) {
      console.error(error);
      setProductError(error.response?.data?.message || "Unable to delete product");
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    toggleWishlist(product);
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    try {
      const updated = await updateProduct(product._id, {
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price),
        compareAtPrice: Number(editForm.compareAtPrice || 0),
        offer: editForm.offer.trim(),
        freeDelivery: Boolean(editForm.freeDelivery),
        stock: Number(editForm.stock),
      });
      setProduct(updated);
      setEditForm({
        name: updated.name,
        description: updated.description,
        price: updated.price,
        compareAtPrice: updated.compareAtPrice ?? 0,
        offer: updated.offer || "",
        freeDelivery: Boolean(updated.freeDelivery),
        stock: updated.stock,
      });
      setIsEditingProduct(false);
      setProductError("");
    } catch (error) {
      console.error(error);
      setProductError(error.response?.data?.message || "Unable to update product");
    }
  };

  const handleReviewImageChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    try {
      const imageData = await Promise.all(files.slice(0, 3).map(readFileAsDataUrl));
      setReviewForm((current) => ({ ...current, images: imageData }));
    } catch (error) {
      console.error(error);
      setReviewError("Unable to read review image");
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!canLeaveReview) {
      setReviewError("You can review this product only after buying it.");
      return;
    }

    if (!reviewForm.rating) {
      setReviewError("Please select a star rating.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");

    try {
      const updatedProduct = await addReview(product._id, reviewForm);
      setProduct(updatedProduct);
      setReviewForm({ rating: 0, comment: "", images: [] });
    } catch (error) {
      console.error(error);
      setReviewError(error.response?.data?.message || "Unable to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const updatedProduct = await deleteReview(product._id, reviewId);
      setProduct(updatedProduct);
    } catch (error) {
      console.error(error);
      setReviewError(error.response?.data?.message || "Unable to delete review");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="flex h-[420px] items-center justify-center rounded-[24px] bg-[#f8fafc] p-6">
                <img src={gallery[selectedImage]} alt={product.name} className="max-h-full w-auto object-contain" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {gallery.slice(0, 5).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-[#f8fafc] p-1 ${selectedImage === index ? "border-[#3b82f6]" : "border-slate-200"}`}
                  >
                    <img src={image} alt={`${product.name} preview ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-950">{product.name}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="text-amber-500">{"*".repeat(5)}</span>
                    <span>{rating}</span>
                    <span>({reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleWishlistClick}
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-full border text-lg transition ${
                      activeWishlist
                        ? "border-rose-200 bg-rose-50 text-rose-500"
                        : "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-500"
                    }`}
                  >
                    {activeWishlist ? <FaHeart /> : <FaRegHeart />}
                  </button>

                  {isOwnerSeller && (
                    <>
                      <button type="button" onClick={() => setIsEditingProduct((value) => !value)} className="rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50">
                        {isEditingProduct ? "Cancel Edit" : "Edit Product"}
                      </button>
                      <button type="button" onClick={handleDeleteProduct} className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
                        Delete Product
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-bold text-slate-950">Rs.{Number(product.price).toLocaleString()}</span>
                {hasDiscount && <span className="text-lg text-slate-400 line-through">Rs.{compareAtPrice.toLocaleString()}</span>}
                {offerLabel && <span className="rounded-md bg-orange-500 px-2 py-1 text-xs font-semibold text-white">{offerLabel}</span>}
              </div>

              {hasDiscount && (
                <p className="mt-3 text-sm font-medium text-emerald-700">
                  You save Rs.{(compareAtPrice - Number(product.price)).toLocaleString()} ({discountPercent}% off)
                </p>
              )}

              {product.freeDelivery && (
                <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  Free Delivery
                </div>
              )}

              {productError && <p className="mt-4 text-sm text-red-600">{productError}</p>}

              {isOwnerSeller && isEditingProduct ? (
                <form className="mt-8 space-y-4" onSubmit={handleUpdateProduct}>
                  <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600" />
                  <textarea rows="5" name="description" value={editForm.description} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input type="number" name="price" value={editForm.price} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600" />
                    <input type="number" name="compareAtPrice" value={editForm.compareAtPrice} onChange={handleEditChange} placeholder="Original Price / MRP" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input type="text" name="offer" value={editForm.offer} onChange={handleEditChange} placeholder="Offer Label (optional, e.g. Bank Offer)" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600" />
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                      <input type="checkbox" name="freeDelivery" checked={editForm.freeDelivery} onChange={handleEditChange} className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                      Free Delivery
                    </label>
                  </div>
                  <input type="number" name="stock" value={editForm.stock} onChange={handleEditChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600" />
                  <button type="submit" className="rounded-md bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700">
                    Save Changes
                  </button>
                </form>
              ) : (
                <>
                  <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-950">Description</h2>
                    <p className="mt-4 leading-8 text-slate-600">{product.description}</p>
                  </div>

                  <div className="mt-8">
                    <div className="inline-flex items-center overflow-hidden rounded-md border border-slate-300">
                      <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="px-4 py-2 text-slate-700 hover:bg-slate-100">-</button>
                      <span className="border-x border-slate-300 px-5 py-2 text-slate-900">{quantity}</span>
                      <button type="button" onClick={() => setQuantity((current) => current + 1)} className="px-4 py-2 text-slate-700 hover:bg-slate-100">+</button>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => {
                      const added = addToCart(product, quantity);
                      if (!added) {
                        navigate("/login");
                      }
                    }} className="rounded-md bg-[#3b82f6] px-6 py-3 font-semibold text-white transition hover:bg-[#2563eb]">
                      Add to Cart
                    </button>
                    <button type="button" onClick={handleBuy} className="rounded-md bg-[#ef4444] px-6 py-3 font-semibold text-white transition hover:bg-[#dc2626]">
                      Buy Now
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <section className="mt-12 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-slate-950">Ratings & Reviews</h2>
          </div>

          {user ? (
            canLeaveReview ? (
              <form className="mt-6 rounded-2xl bg-slate-50 p-5" onSubmit={handleSubmitReview}>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Your Rating</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((current) => ({ ...current, rating: star }))}
                        className={`text-3xl transition ${star <= reviewForm.rating ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
                      >
                        {"\u2605"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Your Comment</label>
                  <textarea rows="5" value={reviewForm.comment} onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600" placeholder="Share your experience with this product" required />
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Review Images</label>
                  <input type="file" accept="image/*" multiple onChange={handleReviewImageChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white focus:border-purple-600" />
                  {reviewForm.images.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {reviewForm.images.map((image, index) => (
                        <img key={`${index}-${image.slice(0, 20)}`} src={image} alt={`Review upload ${index + 1}`} className="h-20 w-20 rounded-xl object-cover" />
                      ))}
                    </div>
                  )}
                </div>

                {reviewError && <p className="mt-4 text-sm text-red-600">{reviewError}</p>}

                <button type="submit" disabled={reviewSubmitting} className="mt-5 rounded-md bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-70">
                  {reviewSubmitting ? "Submitting..." : "Share Review"}
                </button>
              </form>
            ) : null
          ) : null}

          <div className={`mt-8 ${product.reviews?.length ? "grid grid-cols-1 gap-4 md:grid-cols-2" : ""}`}>
            {product.reviews?.length ? (
              product.reviews.map((review) => (
                <div key={review._id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{review.name}</p>
                      <p className="mt-1 text-xl tracking-wide text-amber-400">{"\u2605".repeat(review.rating)}<span className="text-slate-300">{"\u2605".repeat(5 - review.rating)}</span></p>
                    </div>
                    {user?.id === String(review.user) && (
                      <button type="button" onClick={() => handleDeleteReview(review._id)} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                        Delete Review
                      </button>
                    )}
                  </div>
                  <p className="mt-4 leading-7 text-slate-600">{review.comment}</p>
                  {review.images?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {review.images.map((image, index) => (
                        <img key={`${review._id}-${index}`} src={image} alt={`${review.name} review ${index + 1}`} className="h-24 w-24 rounded-xl object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-500">No reviews yet.</p>
            )}
          </div>
        </section>

        <RelevantProducts category={product.category} currentProductId={product._id} />
      </div>
      <Footer />
    </div>
  );
}





