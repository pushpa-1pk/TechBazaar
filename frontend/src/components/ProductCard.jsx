import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const imageSrc = product.images?.[0] || "https://placehold.co/600x400?text=No+Image";
  const rating = Number(product.rating ?? 0).toFixed(1);
  const reviewCount = product.reviewCount ?? 0;
  const deliveryLabel = product.freeDelivery ? "Free Delivery" : "Standard Delivery";
  const compareAtPrice = Number(product.compareAtPrice ?? 0);
  const hasDiscount = compareAtPrice > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - Number(product.price)) / compareAtPrice) * 100)
    : 0;
  const offerLabel = product.offer?.trim() || (hasDiscount ? `${discountPercent}% OFF` : "");
  const activeWishlist = isWishlisted(product._id);

  const handleWishlistClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    toggleWishlist(product);
  };

  return (
    <div className="relative rounded-[18px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={handleWishlistClick}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg text-rose-500 shadow-sm ring-1 ring-slate-200 transition hover:scale-105"
      >
        {activeWishlist ? <FaHeart /> : <FaRegHeart />}
      </button>

      <div onClick={() => navigate(`/product/${product._id}`)} className="cursor-pointer">
        <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-[14px] bg-[#fbfbfc]">
          <img src={imageSrc} alt={product.name} className="h-[180px] w-auto object-contain" />
        </div>

        <div className="mt-5 space-y-3 text-left">
          <h2 className="line-clamp-2 text-[18px] font-medium leading-8 text-slate-900">
            {product.name}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[18px] font-semibold text-slate-950">Rs.{Number(product.price).toLocaleString()}</p>
            {hasDiscount && (
              <p className="text-sm text-slate-400 line-through">Rs.{compareAtPrice.toLocaleString()}</p>
            )}
            {offerLabel && (
              <span className="rounded-md bg-orange-500 px-2 py-1 text-[11px] font-semibold text-white">
                {offerLabel}
              </span>
            )}
          </div>

          <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {deliveryLabel}
          </span>

          <div className="flex items-center gap-3 text-[15px] text-slate-700">
            <span className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">
              {rating} *
            </span>
            <span>{reviewCount} Reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
}
