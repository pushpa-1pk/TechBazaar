import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/orders";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

const createFormState = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  gender: user?.gender || "",
  dob: user?.dob || "",
  profileImage: user?.profileImage || "",
  currentPassword: "",
  newPassword: "",
  addresses:
    user?.addresses?.length > 0
      ? user.addresses
      : [
          {
            id: `local-${Date.now()}`,
            label: user?.address?.label || "Home",
            type: "Home",
            fullName: user?.name || "",
            phone: user?.phone || "",
            line1: user?.address?.line1 || "",
            line2: user?.address?.line2 || "",
            city: user?.address?.city || "",
            state: user?.address?.state || "",
            postalCode: user?.address?.postalCode || "",
            country: user?.address?.country || "India",
            isDefault: true,
          },
        ],
  paymentMethods: user?.paymentMethods || [],
  preferences: {
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    smsAlerts: user?.preferences?.smsAlerts ?? false,
    orderUpdates: user?.preferences?.orderUpdates ?? true,
    promotionalOffers: user?.preferences?.promotionalOffers ?? true,
  },
});

const sections = [
  { id: "personal", label: "Personal Information" },
  { id: "orders", label: "My Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "addresses", label: "Saved Addresses" },
  { id: "payments", label: "Payment Methods" },
  { id: "preferences", label: "Notifications & Preferences" },
];

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

const getPasswordStrength = (password) => {
  if (!password) {
    return { label: "Not set", color: "text-slate-400" };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", color: "text-red-500" };
  if (score <= 3) return { label: "Medium", color: "text-amber-600" };
  return { label: "Strong", color: "text-emerald-600" };
};

const createEmptyAddress = () => ({
  id: `local-address-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label: "Home",
  type: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
});

const createEmptyPaymentMethod = () => ({
  id: `local-payment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: "card",
  label: "",
  cardLast4: "",
  upiId: "",
  walletProvider: "",
  isDefault: false,
});

const getMaskedPaymentLabel = (method) => {
  if (method.type === "card") {
    return method.cardLast4 ? `•••• ${method.cardLast4}` : "Card";
  }

  if (method.type === "upi") {
    return method.upiId || "UPI ID";
  }

  if (method.type === "wallet") {
    return method.walletProvider || "Wallet";
  }

  return "Cash on Delivery";
};

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [activeSection, setActiveSection] = useState("personal");
  const [draft, setDraft] = useState(createFormState(user));
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    setDraft(createFormState(user));
  }, [user]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrders(await getMyOrders());
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, []);

  const passwordStrength = useMemo(
    () => getPasswordStrength(draft.newPassword),
    [draft.newPassword]
  );

  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);
  const defaultAddress = useMemo(
    () => draft.addresses.find((item) => item.isDefault) || draft.addresses[0],
    [draft.addresses]
  );

  const handleFieldChange = (name, value) => {
    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (key) => {
    setDraft((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [key]: !current.preferences[key],
      },
    }));
  };

  const handleAddressChange = (id, field, value) => {
    setDraft((current) => ({
      ...current,
      addresses: current.addresses.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addAddress = () => {
    setDraft((current) => ({
      ...current,
      addresses: [...current.addresses, createEmptyAddress()],
    }));
  };

  const deleteAddress = (id) => {
    setDraft((current) => {
      const nextAddresses = current.addresses.filter((item) => item.id !== id);
      if (nextAddresses.length > 0 && !nextAddresses.some((item) => item.isDefault)) {
        nextAddresses[0].isDefault = true;
      }
      return {
        ...current,
        addresses: nextAddresses,
      };
    });
  };

  const setDefaultAddress = (id) => {
    setDraft((current) => ({
      ...current,
      addresses: current.addresses.map((item) => ({
        ...item,
        isDefault: item.id === id,
      })),
    }));
  };

  const handlePaymentMethodChange = (id, field, value) => {
    setDraft((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addPaymentMethod = () => {
    setDraft((current) => ({
      ...current,
      paymentMethods: [...current.paymentMethods, createEmptyPaymentMethod()],
    }));
  };

  const deletePaymentMethod = (id) => {
    setDraft((current) => {
      const nextPaymentMethods = current.paymentMethods.filter((item) => item.id !== id);
      if (
        nextPaymentMethods.length > 0 &&
        !nextPaymentMethods.some((item) => item.isDefault)
      ) {
        nextPaymentMethods[0].isDefault = true;
      }
      return {
        ...current,
        paymentMethods: nextPaymentMethods,
      };
    });
  };

  const setDefaultPaymentMethod = (id) => {
    setDraft((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.map((item) => ({
        ...item,
        isDefault: item.id === id,
      })),
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        profileImage: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      await updateProfile({
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        gender: draft.gender,
        dob: draft.dob,
        profileImage: draft.profileImage,
        currentPassword: draft.currentPassword,
        newPassword: draft.newPassword,
        addresses: draft.addresses,
        paymentMethods: draft.paymentMethods,
        preferences: draft.preferences,
        address: defaultAddress
          ? {
              label: defaultAddress.label,
              line1: defaultAddress.line1,
              line2: defaultAddress.line2,
              city: defaultAddress.city,
              state: defaultAddress.state,
              postalCode: defaultAddress.postalCode,
              country: defaultAddress.country,
            }
          : undefined,
      });

      setDraft((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
      }));
      setEditingPersonal(false);
      setMessage("Account details updated successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPersonal = () => {
    setDraft(createFormState(user));
    setEditingPersonal(false);
    setMessage("");
  };

  const shareWishlist = async () => {
    const text = wishlistItems
      .map((item) => `${item.name} - ${formatCurrency(item.price)}`)
      .join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user?.name || "User"} wishlist`,
          text,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setMessage("Wishlist copied to clipboard.");
      }
    } catch {
      setMessage("Unable to share wishlist right now.");
    }
  };

  const moveWishlistItemToCart = (item) => {
    addToCart(item, 1);
    removeFromWishlist(item._id);
  };

  const profileImage = draft.profileImage || user?.profileImage || "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff4dd_0,_#f8fafc_40%,_#e2e8f0_100%)] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[34px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user?.name || "User"}
                  className="h-24 w-24 rounded-[28px] object-cover shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-slate-950 text-4xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">My Account</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">{user?.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span>{user?.email}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{user?.phone || "No phone added"}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                      user?.emailVerified
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {user?.emailVerified ? "Email Verified" : "Email Unverified"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Orders</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{orders.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Wishlist</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{wishlistItems.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Addresses</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{draft.addresses.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-2 text-lg font-semibold text-emerald-600">Active</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeSection === section.id
                      ? "bg-slate-950 text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <button
              onClick={logout}
              className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Logout
            </button>
          </aside>

          <main className="space-y-6">
            {activeSection === "personal" ? (
              <section className="rounded-[30px] border border-white/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Personal Information
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      Manage your account details
                    </h2>
                  </div>

                  {!editingPersonal ? (
                    <button
                      onClick={() => setEditingPersonal(true)}
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Edit mode
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelPersonal}
                        className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={draft.name}
                          className="h-52 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center bg-slate-950 text-5xl font-bold text-white">
                          {draft.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    {editingPersonal ? (
                      <label className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
                        Upload profile photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="mt-2 block w-full text-sm"
                        />
                      </label>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-600">Name</span>
                      <input
                        value={draft.name}
                        disabled={!editingPersonal}
                        onChange={(event) => handleFieldChange("name", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none disabled:text-slate-500"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-600">Email</span>
                      <input
                        value={draft.email}
                        disabled={!editingPersonal}
                        onChange={(event) => handleFieldChange("email", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none disabled:text-slate-500"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-600">Phone</span>
                      <input
                        value={draft.phone}
                        disabled={!editingPersonal}
                        onChange={(event) => handleFieldChange("phone", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none disabled:text-slate-500"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-600">Gender</span>
                      <select
                        value={draft.gender}
                        disabled={!editingPersonal}
                        onChange={(event) => handleFieldChange("gender", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none disabled:text-slate-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-600">Date of birth</span>
                      <input
                        type="date"
                        value={draft.dob}
                        disabled={!editingPersonal}
                        onChange={(event) => handleFieldChange("dob", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none disabled:text-slate-500"
                      />
                    </label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-medium text-slate-600">Email verification</p>
                      <p className="mt-2 text-sm text-slate-700">
                        {user?.emailVerified ? "Verified" : "Verification pending"}
                      </p>
                    </div>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-600">Current password</span>
                      <input
                        type="password"
                        value={draft.currentPassword}
                        disabled={!editingPersonal}
                        onChange={(event) =>
                          handleFieldChange("currentPassword", event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none disabled:text-slate-500"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-600">New password</span>
                      <input
                        type="password"
                        value={draft.newPassword}
                        disabled={!editingPersonal}
                        onChange={(event) =>
                          handleFieldChange("newPassword", event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none disabled:text-slate-500"
                      />
                      <p className={`text-sm font-medium ${passwordStrength.color}`}>
                        Password strength: {passwordStrength.label}
                      </p>
                    </label>
                  </div>
                </div>
              </section>
            ) : null}

            {activeSection === "orders" ? (
              <section className="rounded-[30px] border border-white/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      My Orders
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      Recent purchases and delivery status
                    </h2>
                  </div>
                  <Link
                    to="/my-orders"
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  >
                    View all orders
                  </Link>
                </div>

                {ordersLoading ? <p className="mt-8 text-slate-500">Loading orders...</p> : null}
                {!ordersLoading && recentOrders.length === 0 ? (
                  <p className="mt-8 text-slate-500">No orders yet.</p>
                ) : null}

                <div className="mt-8 space-y-4">
                  {recentOrders.map((order) => (
                    <Link
                      key={order._id}
                      to={`/order/${order._id}`}
                      className="block rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                            {order.orderNumber}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            {order.orderItems.slice(0, 2).map((item) => (
                              <div
                                key={`${order._id}-${item.product}-${item.name}`}
                                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2"
                              >
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                                  <span className="text-xs text-slate-400">Item</span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                                  <p className="text-xs text-slate-500">
                                    Qty {item.quantity} • {formatCurrency(item.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm md:text-right">
                          <p className="text-slate-500">Ordered {formatDate(order.createdAt)}</p>
                          <p className="font-semibold text-slate-950">
                            Delivery {formatDate(order.estimatedDeliveryDate)}
                          </p>
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {activeSection === "wishlist" ? (
              <section className="rounded-[30px] border border-white/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Wishlist</p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      Saved products
                    </h2>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={shareWishlist}
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                    >
                      Share wishlist
                    </button>
                    <Link
                      to="/wishlist"
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Open wishlist
                    </Link>
                  </div>
                </div>

                {wishlistItems.length === 0 ? (
                  <p className="mt-8 text-slate-500">No products saved yet.</p>
                ) : (
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {wishlistItems.slice(0, 4).map((item) => (
                      <article
                        key={item._id}
                        className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex gap-4">
                          <img
                            src={
                              item.images?.[0] ||
                              "https://placehold.co/120x120/e2e8f0/334155?text=Product"
                            }
                            alt={item.name}
                            className="h-20 w-20 rounded-2xl object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
                            <p className="mt-2 text-sm text-slate-500">
                              {formatCurrency(item.price)}
                            </p>
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => moveWishlistItemToCart(item)}
                                className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                              >
                                Move to cart
                              </button>
                              <button
                                onClick={() => removeFromWishlist(item._id)}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
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
              </section>
            ) : null}

            {activeSection === "addresses" ? (
              <section className="rounded-[30px] border border-white/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Saved Addresses
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      Manage delivery addresses
                    </h2>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addAddress}
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                    >
                      Add address
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      Save addresses
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-5">
                  {draft.addresses.map((address) => (
                    <article
                      key={address.id}
                      className="rounded-[26px] border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={address.label}
                          onChange={(event) =>
                            handleAddressChange(address.id, "label", event.target.value)
                          }
                          placeholder="Label"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        />
                        <select
                          value={address.type}
                          onChange={(event) =>
                            handleAddressChange(address.id, "type", event.target.value)
                          }
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                        <input
                          value={address.fullName}
                          onChange={(event) =>
                            handleAddressChange(address.id, "fullName", event.target.value)
                          }
                          placeholder="Full name"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        />
                        <input
                          value={address.phone}
                          onChange={(event) =>
                            handleAddressChange(address.id, "phone", event.target.value)
                          }
                          placeholder="Phone"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        />
                        <input
                          value={address.line1}
                          onChange={(event) =>
                            handleAddressChange(address.id, "line1", event.target.value)
                          }
                          placeholder="Address line 1"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none md:col-span-2"
                        />
                        <input
                          value={address.line2}
                          onChange={(event) =>
                            handleAddressChange(address.id, "line2", event.target.value)
                          }
                          placeholder="Address line 2"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none md:col-span-2"
                        />
                        <input
                          value={address.city}
                          onChange={(event) =>
                            handleAddressChange(address.id, "city", event.target.value)
                          }
                          placeholder="City"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        />
                        <input
                          value={address.state}
                          onChange={(event) =>
                            handleAddressChange(address.id, "state", event.target.value)
                          }
                          placeholder="State"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        />
                        <input
                          value={address.postalCode}
                          onChange={(event) =>
                            handleAddressChange(address.id, "postalCode", event.target.value)
                          }
                          placeholder="Pincode"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        />
                        <input
                          value={address.country}
                          onChange={(event) =>
                            handleAddressChange(address.id, "country", event.target.value)
                          }
                          placeholder="Country"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => setDefaultAddress(address.id)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                            address.isDefault
                              ? "bg-emerald-100 text-emerald-700"
                              : "border border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {address.isDefault ? "Default address" : "Set default"}
                        </button>
                        <button
                          onClick={() => deleteAddress(address.id)}
                          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeSection === "payments" ? (
              <section className="rounded-[30px] border border-white/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Payment Methods
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      Saved cards, UPI, wallets, and COD
                    </h2>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addPaymentMethod}
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                    >
                      Add method
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      Save methods
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  {draft.paymentMethods.length === 0 ? (
                    <p className="text-slate-500">No saved payment methods yet.</p>
                  ) : null}

                  {draft.paymentMethods.map((method) => (
                    <article
                      key={method.id}
                      className="rounded-[26px] border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="grid gap-4">
                        <select
                          value={method.type}
                          onChange={(event) =>
                            handlePaymentMethodChange(method.id, "type", event.target.value)
                          }
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        >
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="wallet">Wallet</option>
                          <option value="cod">COD</option>
                        </select>
                        <input
                          value={method.label}
                          onChange={(event) =>
                            handlePaymentMethodChange(method.id, "label", event.target.value)
                          }
                          placeholder="Label"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                        />
                        {method.type === "card" ? (
                          <input
                            value={method.cardLast4}
                            onChange={(event) =>
                              handlePaymentMethodChange(method.id, "cardLast4", event.target.value)
                            }
                            placeholder="Last 4 digits"
                            maxLength={4}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                          />
                        ) : null}
                        {method.type === "upi" ? (
                          <input
                            value={method.upiId}
                            onChange={(event) =>
                              handlePaymentMethodChange(method.id, "upiId", event.target.value)
                            }
                            placeholder="UPI ID"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                          />
                        ) : null}
                        {method.type === "wallet" ? (
                          <input
                            value={method.walletProvider}
                            onChange={(event) =>
                              handlePaymentMethodChange(
                                method.id,
                                "walletProvider",
                                event.target.value
                              )
                            }
                            placeholder="Wallet provider"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                          />
                        ) : null}
                        <p className="text-sm text-slate-500">
                          Saved as: {getMaskedPaymentLabel(method)}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => setDefaultPaymentMethod(method.id)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                            method.isDefault
                              ? "bg-emerald-100 text-emerald-700"
                              : "border border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {method.isDefault ? "Default payment" : "Set default"}
                        </button>
                        <button
                          onClick={() => deletePaymentMethod(method.id)}
                          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeSection === "preferences" ? (
              <section className="rounded-[30px] border border-white/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Notifications & Preferences
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      Choose what updates you receive
                    </h2>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                  >
                    Save preferences
                  </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {[
                    ["emailNotifications", "Email notifications"],
                    ["smsAlerts", "SMS alerts"],
                    ["orderUpdates", "Order updates"],
                    ["promotionalOffers", "Promotional offers"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handlePreferenceChange(key)}
                      className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-left"
                    >
                      <div>
                        <p className="text-base font-semibold text-slate-950">{label}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {draft.preferences[key] ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-7 w-12 rounded-full p-1 transition ${
                          draft.preferences[key] ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full bg-white transition ${
                            draft.preferences[key] ? "translate-x-5" : ""
                          }`}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {message ? (
              <p className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 text-sm font-medium text-slate-700">
                {message}
              </p>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
