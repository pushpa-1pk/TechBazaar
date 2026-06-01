import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDeliveryDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const fieldConfig = [
  { key: "fullName", label: "Full name", placeholder: "Enter full name" },
  { key: "phone", label: "Phone", placeholder: "Enter phone number" },
  { key: "email", label: "Email", placeholder: "Enter email address" },
  {
    key: "addressLine",
    label: "Address line 1",
    placeholder: "House, street, landmark",
    span: "md:col-span-2",
  },
  {
    key: "addressLine2",
    label: "Address line 2",
    placeholder: "Apartment, suite, optional landmark",
    span: "md:col-span-2",
  },
  { key: "city", label: "City", placeholder: "Enter city" },
  { key: "state", label: "State", placeholder: "Enter state" },
  { key: "postalCode", label: "Pincode", placeholder: "Enter pincode" },
  { key: "country", label: "Country", placeholder: "Enter country" },
];

const shippingMethods = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Reliable delivery for most orders",
    charge: 49,
    days: 5,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Faster shipping for urgent orders",
    charge: 149,
    days: 2,
  },
  {
    id: "same-day",
    name: "Same Day Delivery",
    description: "Available for eligible locations only",
    charge: 299,
    days: 0,
  },
];

const paymentMethods = [
  { id: "upi", name: "UPI" },
  { id: "card", name: "Credit / Debit Card" },
  { id: "netbanking", name: "Net Banking" },
  { id: "wallet", name: "Wallet" },
  { id: "paypal", name: "PayPal" },
  { id: "cod", name: "Cash on Delivery" },
];

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    setAddress({
      fullName: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      addressLine: user?.address?.line1 || "",
      addressLine2: user?.address?.line2 || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
  };

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
  const productDiscount = mrpTotal - subtotal;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedShippingMethod =
    shippingMethods.find((method) => method.id === shippingMethod) || shippingMethods[0];
  const shippingCharge = selectedShippingMethod.charge;
  const taxAmount = Math.round(subtotal * 0.18);
  const hasMissingFields = Object.entries(address).some(([key, value]) => {
    if (key === "addressLine2") {
      return false;
    }

    return !String(value).trim();
  });

  let couponDiscount = 0;
  const normalizedCoupon = appliedCoupon.trim().toUpperCase();
  if (normalizedCoupon === "SAVE10") {
    couponDiscount = Math.round(subtotal * 0.1);
  } else if (normalizedCoupon === "FLAT200" && subtotal >= 1500) {
    couponDiscount = 200;
  } else if (normalizedCoupon === "FREESHIP") {
    couponDiscount = shippingCharge;
  }

  const total = Math.max(0, subtotal + shippingCharge + taxAmount - couponDiscount);
  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(
    estimatedDeliveryDate.getDate() + selectedShippingMethod.days
  );

  const applyCoupon = () => {
    const nextCoupon = couponInput.trim().toUpperCase();

    if (!nextCoupon) {
      setMessage("Enter a coupon code.");
      return;
    }

    if (nextCoupon === "SAVE10") {
      setAppliedCoupon(nextCoupon);
      setMessage("");
      return;
    }

    if (nextCoupon === "FLAT200") {
      if (subtotal < 1500) {
        setMessage("FLAT200 requires a subtotal of at least Rs. 1500.");
        return;
      }

      setAppliedCoupon(nextCoupon);
      setMessage("");
      return;
    }

    if (nextCoupon === "FREESHIP") {
      setAppliedCoupon(nextCoupon);
      setMessage("");
      return;
    }

    setMessage("Invalid coupon code.");
  };

  const placeOrder = async () => {
    if (!cartItems.length || hasMissingFields || placingOrder) {
      return;
    }

    setPlacingOrder(true);
    setMessage("");

    try {
      const orderItems = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const response = await api.post("/orders", {
        orderItems,
        shippingAddress: address,
        paymentMethod,
        shippingMethod,
        couponCode: appliedCoupon,
      });

      setOrderPlaced(response.data.order);
      clearCart();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf0_0%,#f8fafc_45%,#eef2ff_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
            Order Confirmed
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            {orderPlaced.orderNumber}
          </h1>
          <p className="mt-3 text-slate-600">
            Estimated delivery: {formatDeliveryDate(orderPlaced.estimatedDeliveryDate)}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Payment method</p>
              <p className="mt-2 font-semibold capitalize text-slate-950">
                {orderPlaced.paymentMethod}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Order total</p>
              <p className="mt-2 font-semibold text-slate-950">
                {formatCurrency(orderPlaced.totalAmount)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-2 font-semibold capitalize text-slate-950">
                {orderPlaced.orderStatus}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Continue shopping
            </Link>
            <Link
              to="/profile"
              className="inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              View profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/90 p-12 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <h1 className="text-3xl font-semibold text-slate-900">
            No items ready for checkout
          </h1>
          <p className="mt-3 text-slate-500">
            Add products to the cart before placing an order.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf0_0%,#f8fafc_45%,#eef2ff_100%)] px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.55fr)_390px]">
        <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Checkout
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-950">
                  Review order, delivery, and payment
                </h1>
                <p className="mt-2 text-slate-500">
                  Cart summary, shipping method, taxes, and payment selection are handled here.
                </p>
              </div>
              <Link
                to="/profile"
                className="inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Edit profile
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6">
            <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#f8fafc_100%)] p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-700">
                    Delivery Contact
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {address.fullName || "Add customer details"}
                  </h2>
                  <p className="mt-2 text-slate-600">
                    {address.phone || "Phone number missing"} • {address.email || "Email missing"}
                  </p>
                </div>
                <span className="inline-flex h-fit rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white">
                  {user?.address?.label || "Home"}
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                  Shipping Address
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Delivery information
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {fieldConfig.map((field) => (
                  <label
                    key={field.key}
                    className={`flex flex-col gap-2 ${field.span || ""}`}
                  >
                    <span className="text-sm font-medium text-slate-600">
                      {field.label}
                    </span>
                    <input
                      name={field.key}
                      placeholder={field.placeholder}
                      value={address[field.key]}
                      onChange={handleChange}
                      type={field.key === "email" ? "email" : "text"}
                      required={field.key !== "addressLine2"}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                  Shipping Method
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Select delivery speed
                </h2>
              </div>

              <div className="grid gap-4">
                {shippingMethods.map((method) => {
                  const isSelected = shippingMethod === method.id;
                  const deliveryDate = new Date();
                  deliveryDate.setDate(deliveryDate.getDate() + method.days);

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setShippingMethod(method.id)}
                      className={`rounded-[24px] border p-5 text-left transition ${
                        isSelected
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold">{method.name}</p>
                          <p className={isSelected ? "text-slate-300" : "text-slate-500"}>
                            {method.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(method.charge)}</p>
                          <p className={isSelected ? "text-slate-300" : "text-slate-500"}>
                            Delivery by {formatDeliveryDate(deliveryDate)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                    Payment
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Payment method</h2>
                  <p className="mt-2 text-slate-300">
                    This is still a simulated checkout flow. The selected payment method is stored with the order.
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200">
                  Secure order
                </span>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {paymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-amber-400 bg-amber-400 text-slate-950"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                        {method.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.1)] backdrop-blur lg:sticky lg:top-24">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Order Review
          </p>

          <div className="mt-6 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product._id}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <img
                  src={
                    item.product.images?.[0] ||
                    "https://placehold.co/120x120/e2e8f0/334155?text=Product"
                  }
                  alt={item.product.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.product.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(item.product._id, Number(event.target.value))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                    >
                      {Array.from({ length: Math.max(8, item.quantity) }, (_, index) => index + 1).map(
                        (value) => (
                          <option key={value} value={value}>
                            Qty {value}
                          </option>
                        )
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-xs font-medium text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(Number(item.product.price || 0) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Coupon
            </p>
            <div className="mt-4 flex gap-3">
              <input
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="SAVE10 / FLAT200 / FREESHIP"
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
            {appliedCoupon ? (
              <p className="mt-3 text-sm font-medium text-emerald-600">
                Applied coupon: {appliedCoupon}
              </p>
            ) : null}
          </div>

          <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Items ({totalItems})</span>
                <span>{formatCurrency(mrpTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Product discount</span>
                <span className="font-semibold text-emerald-600">
                  -{formatCurrency(productDiscount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Coupon discount</span>
                <span className="font-semibold text-emerald-600">
                  -{formatCurrency(couponDiscount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping ({selectedShippingMethod.name})</span>
                <span>{formatCurrency(shippingCharge)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GST</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated delivery</span>
                <span>{formatDeliveryDate(estimatedDeliveryDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment method</span>
                <span className="capitalize">{paymentMethod}</span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between text-xl font-semibold text-slate-950">
                <span>Total payable</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Savings on this order: {formatCurrency(productDiscount + couponDiscount)}
              </p>
            </div>
          </div>

          {message ? (
            <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {message}
            </p>
          ) : null}

          {hasMissingFields ? (
            <p className="mt-5 text-sm text-slate-500">
              Complete all required delivery fields before placing the order.
            </p>
          ) : null}

          <button
            onClick={placeOrder}
            disabled={placingOrder || hasMissingFields}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {placingOrder ? "Placing order..." : "Place Order"}
          </button>
        </aside>
      </div>
    </div>
  );
}
