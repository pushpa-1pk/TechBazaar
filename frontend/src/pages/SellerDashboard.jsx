import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerOrders } from "../api/orders";
import {
  createProduct,
  deleteProduct,
  getMyProducts,
  updateProduct,
} from "../api/products";
import { useAuth } from "../context/AuthContext";

const emptyProduct = {
  name: "",
  description: "",
  category: "mobile",
  brand: "",
  price: "",
  compareAtPrice: "",
  offer: "",
  freeDelivery: false,
  stock: "",
  imageFiles: [],
  imagePreviews: [],
};

const categoryOptions = [
  { label: "Mobiles", value: "mobile" },
  { label: "Laptops", value: "laptop" },
  { label: "Tablets", value: "tablet" },
  { label: "Accessories", value: "accessory" },
  { label: "Monitors", value: "monitor" },
  { label: "Smartwatches", value: "watch" },
  { label: "AirPods", value: "airpod" },
  { label: "Headphones", value: "headphone" },
  { label: "TV", value: "tv" },
  { label: "Speakers", value: "speaker" },
  { label: "Camera", value: "camera" },
  { label: "Printer", value: "printer" },
  { label: "Smart Home & Appliances", value: "smart-home-appliances" },
  { label: "Other", value: "other" },
];

const sectionOptions = [
  { id: "overview", label: "Overview" },
  { id: "inventory", label: "Inventory" },
  { id: "orders", label: "Orders" },
  { id: "profile", label: "Profile" },
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

const readFilesAsDataUrls = async (files) => {
  const fileList = Array.from(files || []).slice(0, 6);

  return Promise.all(
    fileList.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
};

const buildEditProduct = (product) => ({
  id: product._id,
  name: product.name || "",
  description: product.description || "",
  category: product.category || "mobile",
  brand: product.brand || "",
  price: product.price ?? "",
  compareAtPrice: product.compareAtPrice ?? "",
  offer: product.offer || "",
  freeDelivery: Boolean(product.freeDelivery),
  stock: product.stock ?? "",
  imageFiles: [],
  imagePreviews: product.images || [],
});

const createProfileState = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  profileImage: user?.profileImage || "",
  currentPassword: "",
  newPassword: "",
});

export default function SellerDashboard() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [products, setProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [editProduct, setEditProduct] = useState(emptyProduct);
  const [profileForm, setProfileForm] = useState(createProfileState(user));
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    setProfileForm(createProfileState(user));
  }, [user]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setOrdersLoading(true);
        const [myProducts, myOrders] = await Promise.all([
          getMyProducts(),
          getSellerOrders(),
        ]);
        setProducts(myProducts);
        setSellerOrders(myOrders);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Unable to load seller dashboard");
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (user?.role !== "seller") {
    return <h2 className="p-8 text-xl font-semibold">Access Denied</h2>;
  }

  const totalRevenue = sellerOrders.reduce(
    (sum, order) => sum + Number(order.sellerRevenue || 0),
    0
  );
  const totalUnits = sellerOrders.reduce(
    (sum, order) => sum + Number(order.sellerItemCount || 0),
    0
  );
  const lowStockProducts = products.filter((product) => Number(product.stock) <= 5);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== id)
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to delete product");
    }
  };

  const handleFileChange = async (event, mode) => {
    const files = Array.from(event.target.files || []);

    try {
      const imagePreviews = await readFilesAsDataUrls(files);
      if (mode === "add") {
        setNewProduct((currentProduct) => ({
          ...currentProduct,
          imageFiles: files,
          imagePreviews,
        }));
      } else {
        setEditProduct((currentProduct) => ({
          ...currentProduct,
          imageFiles: files,
          imagePreviews,
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Unable to read selected images");
    }
  };

  const handleProductFieldChange = (mode, event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    if (mode === "add") {
      setNewProduct((currentProduct) => ({ ...currentProduct, [name]: nextValue }));
      return;
    }

    setEditProduct((currentProduct) => ({ ...currentProduct, [name]: nextValue }));
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const createdProduct = await createProduct({
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        category: newProduct.category,
        brand: newProduct.brand.trim(),
        price: Number(newProduct.price),
        compareAtPrice: Number(newProduct.compareAtPrice || 0),
        offer: newProduct.offer.trim(),
        freeDelivery: newProduct.freeDelivery,
        stock: Number(newProduct.stock),
        images: newProduct.imagePreviews,
      });

      setProducts((currentProducts) => [createdProduct, ...currentProducts]);
      setNewProduct(emptyProduct);
      setIsAddProductOpen(false);
      setActiveSection("inventory");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (product) => {
    setError("");
    setEditProduct(buildEditProduct(product));
    setIsEditProductOpen(true);
  };

  const handleEditProduct = async (event) => {
    event.preventDefault();
    setUpdating(true);
    setError("");

    try {
      const updated = await updateProduct(editProduct.id, {
        name: editProduct.name.trim(),
        description: editProduct.description.trim(),
        category: editProduct.category,
        brand: editProduct.brand.trim(),
        price: Number(editProduct.price),
        compareAtPrice: Number(editProduct.compareAtPrice || 0),
        offer: editProduct.offer.trim(),
        freeDelivery: editProduct.freeDelivery,
        stock: Number(editProduct.stock),
        images: editProduct.imagePreviews,
      });

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === updated._id ? updated : product
        )
      );
      setIsEditProductOpen(false);
      setEditProduct(emptyProduct);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to update product");
    } finally {
      setUpdating(false);
    }
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((current) => ({
        ...current,
        profileImage: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMessage("");

    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        profileImage: profileForm.profileImage,
        currentPassword: profileForm.currentPassword,
        newPassword: profileForm.newPassword,
      });
      setProfileForm((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
      }));
      setProfileMessage("Seller profile updated successfully.");
    } catch (err) {
      console.error(err);
      setProfileMessage(err.response?.data?.message || "Unable to update seller profile");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
        >
          {"<-"}
        </button>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-84px)] max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-purple-600 px-6 py-8 text-white lg:w-72 lg:border-b-0 lg:border-r lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Seller Space</p>
            <h1 className="mt-3 text-2xl font-semibold">TechBazaar</h1>
            <p className="mt-2 text-sm text-slate-100/80">
              Manage products, orders, and your seller account from one place.
            </p>
          </div>

          <nav className="mt-10 space-y-3">
            {sectionOptions.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`block w-full rounded-xl px-4 py-3 text-left font-medium transition ${
                  activeSection === section.id
                    ? "bg-white text-purple-600"
                    : "border border-purple-400 text-purple-100 hover:border-white hover:text-white"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            className="mt-10 w-full rounded-xl border border-purple-400 px-4 py-3 text-left font-medium text-purple-100 transition hover:border-white hover:text-white"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {error && <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          {activeSection === "overview" ? (
            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-600">
                  Electronics Seller Portal
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Seller Dashboard
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Track inventory, product activity, and incoming orders.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Products</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">
                    {loading ? "--" : products.length}
                  </p>
                </div>
                <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Orders</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">
                    {ordersLoading ? "--" : sellerOrders.length}
                  </p>
                </div>
                <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Revenue</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Units Sold</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{totalUnits}</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
                <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-950">Recent seller orders</h3>
                    <button
                      onClick={() => setActiveSection("orders")}
                      className="rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-600"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {sellerOrders.slice(0, 3).map((order) => (
                      <div key={order._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{order.orderNumber}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {formatDate(order.createdAt)} • {order.sellerItemCount} items
                            </p>
                          </div>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-700">
                          Revenue: {formatCurrency(order.sellerRevenue)}
                        </p>
                      </div>
                    ))}
                    {!ordersLoading && sellerOrders.length === 0 ? (
                      <p className="text-sm text-slate-500">No seller orders yet.</p>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                  <h3 className="text-xl font-semibold text-slate-950">Low stock</h3>
                  <div className="mt-6 space-y-4">
                    {lowStockProducts.length > 0 ? (
                      lowStockProducts.map((product) => (
                        <div key={product._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="font-semibold text-slate-950">{product.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {product.stock} units left
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">All products have healthy stock.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          {activeSection === "inventory" ? (
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-600">Inventory</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Product Catalog</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Add, edit, and remove your listed products.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(true)}
                  className="inline-flex items-center justify-center rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  + Add Product
                </button>
              </div>

              <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Product Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Stock</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 bg-white">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">Loading products...</td>
                        </tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">No products yet. Add your first product.</td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{product.name}</td>
                            <td className="px-6 py-4 text-sm capitalize text-slate-600">{product.category}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">Rs. {product.price}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{product.stock}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(product)}
                                  className="rounded-full border border-purple-200 px-4 py-2 text-sm font-medium text-purple-600 transition hover:bg-purple-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(product._id)}
                                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "orders" ? (
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="border-b border-slate-200 pb-6">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-600">Orders</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Seller Orders</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Orders that include your products.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                {ordersLoading ? (
                  <p className="text-sm text-slate-500">Loading seller orders...</p>
                ) : sellerOrders.length === 0 ? (
                  <p className="text-sm text-slate-500">No seller orders yet.</p>
                ) : (
                  sellerOrders.map((order) => (
                    <article key={order._id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{order.orderNumber}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(order.createdAt)} • {order.shippingAddress.fullName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Revenue: {formatCurrency(order.sellerRevenue)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                            {order.orderStatus}
                          </span>
                          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4">
                        {order.orderItems.map((item) => (
                          <div key={`${order._id}-${item.product?._id || item.product}-${item.name}`} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4">
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
                                Item total: {formatCurrency(Number(item.price) * Number(item.quantity))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {activeSection === "profile" ? (
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="border-b border-slate-200 pb-6">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-600">Seller Profile</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Account Settings</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Update your seller identity and security details.
                </p>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  {profileForm.profileImage ? (
                    <img
                      src={profileForm.profileImage}
                      alt={profileForm.name}
                      className="h-52 w-full rounded-[24px] object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center rounded-[24px] bg-slate-950 text-5xl font-bold text-white">
                      {profileForm.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="mt-4 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Seller name"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
                  />
                  <input
                    value={profileForm.email}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="Email"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
                  />
                  <input
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="Phone"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
                  />
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Role</p>
                    <p className="mt-2 capitalize">{user.role}</p>
                  </div>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                    placeholder="Current password"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
                  />
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                    placeholder="New password"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {profileMessage ? (
                <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {profileMessage}
                </p>
              ) : null}

              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="mt-6 rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
              >
                {profileSaving ? "Saving..." : "Save Seller Profile"}
              </button>
            </div>
          ) : null}
        </main>
      </div>

      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-purple-600/55 px-4 py-6">
          <div className="flex min-h-full items-center justify-center">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-600">New Inventory</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">Add Product</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-900"
                >
                  Close
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleAddProduct}>
                <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={(event) => handleProductFieldChange("add", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" required />
                <textarea name="description" placeholder="Description" value={newProduct.description} onChange={(event) => handleProductFieldChange("add", event)} className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" required />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="number" min="0" name="price" placeholder="Selling Price" value={newProduct.price} onChange={(event) => handleProductFieldChange("add", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" required />
                  <input type="number" min="0" name="compareAtPrice" placeholder="Original Price" value={newProduct.compareAtPrice} onChange={(event) => handleProductFieldChange("add", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="text" name="offer" placeholder="Offer Label (optional, e.g. Bank Offer)" value={newProduct.offer} onChange={(event) => handleProductFieldChange("add", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" />
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="freeDelivery" checked={newProduct.freeDelivery} onChange={(event) => handleProductFieldChange("add", event)} className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    Free Delivery
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <select name="category" value={newProduct.category} onChange={(event) => handleProductFieldChange("add", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500">
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>

                  <input type="text" name="brand" placeholder="Brand" value={newProduct.brand} onChange={(event) => handleProductFieldChange("add", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" />
                </div>

                <input type="number" min="0" name="stock" placeholder="Stock" value={newProduct.stock} onChange={(event) => handleProductFieldChange("add", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" required />

                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => handleFileChange(event, "add")}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white focus:border-purple-500"
                  />

                  {newProduct.imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {newProduct.imagePreviews.map((imagePreview, index) => (
                        <img key={`${index}-${imagePreview.slice(0, 20)}`} src={imagePreview} alt={`Preview ${index + 1}`} className="h-36 w-full rounded-2xl object-cover" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setIsAddProductOpen(false)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60">
                    {submitting ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/55 px-4 py-6">
          <div className="flex min-h-full items-center justify-center">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-600">Update Inventory</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">Edit Product</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditProductOpen(false)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-900"
                >
                  Close
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleEditProduct}>
                <input type="text" name="name" placeholder="Product Name" value={editProduct.name} onChange={(event) => handleProductFieldChange("edit", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" required />
                <textarea name="description" placeholder="Description" value={editProduct.description} onChange={(event) => handleProductFieldChange("edit", event)} className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" required />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="number" min="0" name="price" placeholder="Selling Price" value={editProduct.price} onChange={(event) => handleProductFieldChange("edit", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" required />
                  <input type="number" min="0" name="compareAtPrice" placeholder="Original Price" value={editProduct.compareAtPrice} onChange={(event) => handleProductFieldChange("edit", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="text" name="offer" placeholder="Offer Label (optional, e.g. Bank Offer)" value={editProduct.offer} onChange={(event) => handleProductFieldChange("edit", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" />
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="freeDelivery" checked={editProduct.freeDelivery} onChange={(event) => handleProductFieldChange("edit", event)} className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    Free Delivery
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <select name="category" value={editProduct.category} onChange={(event) => handleProductFieldChange("edit", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500">
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>

                  <input type="text" name="brand" placeholder="Brand" value={editProduct.brand} onChange={(event) => handleProductFieldChange("edit", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" />
                </div>

                <input type="number" min="0" name="stock" placeholder="Stock" value={editProduct.stock} onChange={(event) => handleProductFieldChange("edit", event)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-500" required />

                <div className="space-y-3">
                  <input type="file" accept="image/*" multiple onChange={(event) => handleFileChange(event, "edit")} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white focus:border-purple-500" />

                  {editProduct.imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {editProduct.imagePreviews.map((imagePreview, index) => (
                        <img key={`${index}-${imagePreview.slice(0, 20)}`} src={imagePreview} alt={`Edit preview ${index + 1}`} className="h-36 w-full rounded-2xl object-cover" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setIsEditProductOpen(false)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950">
                    Cancel
                  </button>
                  <button type="submit" disabled={updating} className="rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60">
                    {updating ? "Updating..." : "Update Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
