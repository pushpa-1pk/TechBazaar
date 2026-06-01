import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getFullAddress = (user) => {
  const parts = [
    user?.address?.line1,
    user?.address?.line2,
    user?.address?.city,
    user?.address?.state,
    user?.address?.postalCode,
    user?.address?.country,
  ].filter(Boolean);

  return parts.join(", ");
};

export default function Cart() {
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const mrpTotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.product.compareAtPrice || item.product.price || 0) *
        item.quantity,
    0
  );
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
    0
  );
  const discount = mrpTotal - subtotal;
  const deliveryFee = subtotal > 0 && subtotal < 999 ? 49 : 0;
  const total = subtotal + deliveryFee;
  const savedAmount = discount + (deliveryFee === 0 ? 49 : 0);
  const deliveryAddress = getFullAddress(user);

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/90 p-12 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <h1 className="text-3xl font-semibold text-slate-900">
            Your cart is empty
          </h1>
          <p className="mt-3 text-slate-500">
            Add products and your cart summary will update here in real time.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf0_0%,#f8fafc_45%,#eef2ff_100%)] px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.7fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Delivery To
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-950">
                    {user?.name || "Your Profile"}
                  </h1>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                    {user?.address?.label || "Home"}
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-base text-slate-500">
                  {deliveryAddress ||
                    "Add your delivery address in profile to show it here."}
                </p>
                {user?.phone ? (
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Phone: {user.phone}
                  </p>
                ) : null}
              </div>

              <Link
                to="/profile"
                className="inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Change
              </Link>
            </div>
          </section>

          <section className="space-y-5">
            {cartItems.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </section>
        </div>

        <aside className="h-fit rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.1)] backdrop-blur lg:sticky lg:top-24">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Price Details
          </p>
          <div className="mt-6 space-y-4 text-base text-slate-700">
            <div className="flex items-center justify-between">
              <span>MRP ({cartItems.length} items)</span>
              <span>{formatCurrency(mrpTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? "font-semibold text-emerald-600" : ""}>
                {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span className="font-semibold text-emerald-600">
                -{formatCurrency(discount)}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between text-2xl font-semibold text-slate-950">
              <span>Total Amount</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              You&apos;ll save {formatCurrency(savedAmount)} on this order.
            </p>
          </div>

          <div className="mt-8 rounded-[26px] bg-slate-900 px-5 py-5 text-white">
            <p className="text-sm text-slate-300">
              Quantity changes and cart actions update this summary immediately.
            </p>
            <Link
              to="/checkout"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Place Order
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
