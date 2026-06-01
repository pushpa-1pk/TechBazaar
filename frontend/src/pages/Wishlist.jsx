import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const shareWishlist = async () => {
    const text = wishlistItems
      .map((product) => `${product.name} - ${formatCurrency(product.price)}`)
      .join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My wishlist",
          text,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Ignore share failures and keep the page usable.
    }
  };

  const moveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf0_0%,#f8fafc_45%,#eef2ff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Saved For Later
          </p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-semibold text-slate-950">Your Wishlist</h1>
            {wishlistItems.length > 0 ? (
              <button
                onClick={shareWishlist}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Share wishlist
              </button>
            ) : null}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="rounded-[24px] bg-white p-10 text-center text-slate-500 shadow-sm">
            Your wishlist is empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {wishlistItems.map((product) => (
              <article
                key={product._id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
              >
                <div className="flex gap-5">
                  <img
                    src={
                      product.images?.[0] ||
                      "https://placehold.co/160x160/e2e8f0/334155?text=Product"
                    }
                    alt={product.name}
                    className="h-28 w-28 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-950">{product.name}</h2>
                    <p className="mt-2 text-sm capitalize text-slate-500">
                      {product.category}
                    </p>
                    <p className="mt-4 text-lg font-semibold text-slate-950">
                      {formatCurrency(product.price)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => moveToCart(product)}
                        className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Move to cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
