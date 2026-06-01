import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cancelOrder, getOrderById } from "../api/orders";
import { useCart } from "../context/CartContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const trackingSteps = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

const getStatusClasses = (status) => {
  if (status === "processing") status = "confirmed";
  if (status === "delivered") return "bg-emerald-100 text-emerald-700";
  if (status === "shipped") return "bg-sky-100 text-sky-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  if (status === "pending") return "bg-slate-200 text-slate-700";
  return "bg-amber-100 text-amber-700";
};

const downloadInvoice = (order) => {
  const lines = [
    `Invoice: ${order.orderNumber}`,
    `Order Date: ${formatDate(order.createdAt)}`,
    `Delivery Date: ${formatDate(order.estimatedDeliveryDate)}`,
    `Order Status: ${order.orderStatus}`,
    `Payment Status: ${order.paymentStatus}`,
    "",
    ...order.orderItems.map(
      (item) =>
        `${item.name} | Qty ${item.quantity} | ${formatCurrency(item.price * item.quantity)}`
    ),
    "",
    `Subtotal: ${formatCurrency(order.subtotalAmount)}`,
    `Shipping: ${formatCurrency(order.shippingCharge)}`,
    `Tax: ${formatCurrency(order.taxAmount)}`,
    `Discount: ${formatCurrency(order.discountAmount)}`,
    `Total: ${formatCurrency(order.totalAmount)}`,
  ].join("\n");

  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${order.orderNumber}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setOrder(await getOrderById(id));
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load order.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      setError("");
      setOrder(await cancelOrder(id));
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || "Unable to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = () => {
    order.orderItems.forEach((item) => {
      const product =
        typeof item.product === "object" && item.product
          ? {
              _id: item.product._id || item.product,
              name: item.name,
              price: item.price,
              images: item.product.images || [],
            }
          : {
              _id: item.product,
              name: item.name,
              price: item.price,
              images: [],
            };
      addToCart(product, item.quantity);
    });

    navigate("/cart");
  };

  const normalizedStatus = order?.orderStatus === "processing" ? "confirmed" : order?.orderStatus;

  const activeStepIndex =
    normalizedStatus === "cancelled"
      ? -1
      : Math.max(0, trackingSteps.findIndex((step) => step.id === normalizedStatus));

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf0_0%,#f8fafc_45%,#eef2ff_100%)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          to="/my-orders"
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
        >
          Back to orders
        </Link>

        {loading ? <p className="text-slate-500">Loading order...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {order ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_360px]">
            <section className="rounded-[30px] border border-white/70 bg-white/95 p-8 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                    Order Details
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-950">
                    {order.orderNumber}
                  </h1>
                  <p className="mt-2 text-slate-500">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                      normalizedStatus
                    )}`}
                  >
                    {normalizedStatus}
                  </span>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Order tracking
                  </p>
                  <p className="text-sm text-slate-500">
                    Delivery by {formatDate(order.estimatedDeliveryDate)}
                  </p>
                </div>

                {normalizedStatus === "cancelled" ? (
                  <p className="mt-4 text-sm font-medium text-red-600">
                    This order has been cancelled.
                  </p>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    {trackingSteps.map((step, index) => {
                      const isActive = index <= activeStepIndex;

                      return (
                        <div key={step.id} className="space-y-3">
                          <div
                            className={`h-2 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          />
                          <p
                            className={`text-sm font-semibold ${
                              isActive ? "text-slate-950" : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                {order.orderItems.map((item) => (
                  <article
                    key={item._id || `${item.product?._id || item.product}-${item.name}`}
                    className="flex items-start gap-4 rounded-[24px] border border-slate-200 p-4"
                  >
                    <img
                      src={
                        item.product?.images?.[0] ||
                        "https://placehold.co/120x120/e2e8f0/334155?text=Product"
                      }
                      alt={item.name}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-slate-950">{item.name}</h2>
                      <p className="mt-2 text-sm text-slate-500">Quantity {item.quantity}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Unit price {formatCurrency(item.price)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Delivery date {formatDate(order.estimatedDeliveryDate)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Summary</p>
                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shippingCharge)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(order.taxAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                </div>
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <div className="flex items-center justify-between text-lg font-semibold text-slate-950">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Delivery Address
                </p>
                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-slate-950">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.email}</p>
                  <p>{order.shippingAddress.addressLine}</p>
                  {order.shippingAddress.addressLine2 ? (
                    <p>{order.shippingAddress.addressLine2}</p>
                  ) : null}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={() => downloadInvoice(order)}
                  className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Download invoice
                </button>
                <button
                  onClick={handleReorder}
                  className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Reorder
                </button>
                <button
                  disabled={normalizedStatus !== "delivered"}
                  className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Return / Refund
                </button>
                {["pending", "confirmed", "processing"].includes(order.orderStatus) ? (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {cancelling ? "Cancelling..." : "Cancel order"}
                  </button>
                ) : null}
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
