import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrders } from "../api/orders";
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
    `Status: ${order.orderStatus}`,
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

export default function MyOrders() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setOrders(await getMyOrders());
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const totalOrderCount = useMemo(() => orders.length, [orders]);
  const normalizeStatus = (status) => (status === "processing" ? "confirmed" : status);

  const reorderItems = (order) => {
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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf0_0%,#f8fafc_45%,#eef2ff_100%)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[30px] border border-white/70 bg-white/95 p-8 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">My Orders</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Order history</h1>
              <p className="mt-2 text-slate-500">
                {totalOrderCount} {totalOrderCount === 1 ? "order" : "orders"} in your account
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Back to profile
            </Link>
          </div>

          {loading ? <p className="mt-8 text-slate-500">Loading orders...</p> : null}
          {error ? <p className="mt-8 text-red-600">{error}</p> : null}

          {!loading && !error && orders.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No orders found.
            </div>
          ) : null}

          {!loading && !error && orders.length > 0 ? (
            <div className="mt-8 space-y-5">
              {orders.map((order) => (
                <article
                  key={order._id}
                  className="rounded-[26px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                        {order.orderNumber}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Ordered on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                          normalizeStatus(order.orderStatus)
                        )}`}
                      >
                        {normalizeStatus(order.orderStatus)}
                      </span>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    {order.orderItems.map((item) => (
                      <div
                        key={`${order._id}-${item.product?._id || item.product}-${item.name}`}
                        className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4"
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
                          <p className="text-base font-semibold text-slate-950">{item.name}</p>
                          <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Price: {formatCurrency(item.price)}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Delivery date: {formatDate(order.estimatedDeliveryDate)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-950">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to={`/order/${order._id}`}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      View details
                    </Link>
                    <button
                      onClick={() => downloadInvoice(order)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      Download invoice
                    </button>
                    <button
                      onClick={() => reorderItems(order)}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Reorder
                    </button>
                    <button
                      disabled={normalizeStatus(order.orderStatus) !== "delivered"}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Return / Refund
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
