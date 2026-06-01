const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getProductImage = (product) =>
  product.images?.[0] ||
  "https://placehold.co/200x200/e2e8f0/334155?text=Product";

const getDiscountPercent = (product) => {
  const compareAtPrice = Number(product.compareAtPrice || 0);
  const price = Number(product.price || 0);

  if (compareAtPrice <= price || compareAtPrice <= 0) {
    return 0;
  }

  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

export default function CartItem({ item, onUpdate, onRemove }) {
  const { product, quantity } = item;
  const compareAtPrice = Number(product.compareAtPrice || 0);
  const discountPercent = getDiscountPercent(product);
  const image = getProductImage(product);
  const hasComparePrice = compareAtPrice > Number(product.price);

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 px-5 py-3">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {product.offer?.trim() || "In Cart"}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5 md:flex-row">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 md:h-36 md:w-36 md:flex-shrink-0">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-2 text-sm capitalize text-slate-500">
            {product.brand ? `${product.brand} • ` : ""}
            {product.category}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 font-semibold text-white">
              {Number(product.rating || 0).toFixed(1)} ★
            </span>
            <span className="font-medium text-slate-600">
              {product.reviewCount || 0} reviews
            </span>
            {product.freeDelivery ? (
              <span className="font-medium text-emerald-700">Free delivery</span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            {discountPercent > 0 ? (
              <span className="text-3xl font-bold text-emerald-600">
                {discountPercent}% off
              </span>
            ) : null}
            {hasComparePrice ? (
              <span className="text-2xl text-slate-400 line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            ) : null}
            <span className="text-4xl font-bold text-slate-950">
              {formatCurrency(product.price)}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Delivery timeline follows the address saved in your profile.
          </p>
        </div>

        <div className="md:w-40">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Quantity
          </label>
          <select
            value={quantity}
            onChange={(e) => onUpdate(product._id, Number(e.target.value))}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-amber-500"
          >
            {Array.from({ length: Math.max(8, quantity) }, (_, index) => index + 1).map(
              (value) => (
                <option key={value} value={value}>
                  Qty: {value}
                </option>
              )
            )}
          </select>

          <button
            onClick={() => onRemove(product._id)}
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
