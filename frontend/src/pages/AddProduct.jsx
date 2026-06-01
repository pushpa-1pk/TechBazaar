import { useMemo, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

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

export default function AddProduct() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    offer: "",
    freeDelivery: false,
    category: "mobile",
    brand: "",
    stock: "",
    imageFiles: [],
  });

  const pricingSummary = useMemo(() => {
    const sellingPrice = Number(formData.price || 0);
    const originalPrice = Number(formData.compareAtPrice || 0);
    const hasDiscount = originalPrice > sellingPrice && sellingPrice > 0;
    const savings = hasDiscount ? originalPrice - sellingPrice : 0;
    const discountPercent = hasDiscount ? Math.round((savings / originalPrice) * 100) : 0;

    return { sellingPrice, originalPrice, hasDiscount, savings, discountPercent };
  }, [formData.price, formData.compareAtPrice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    setFormData((current) => ({ ...current, imageFiles: files }));

    try {
      const dataUrls = await readFilesAsDataUrls(files);
      setPreviews(dataUrls);
    } catch (err) {
      console.error(err);
      setError("Unable to read selected images");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/products", {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        compareAtPrice: Number(formData.compareAtPrice || 0),
        offer: formData.offer.trim(),
        freeDelivery: formData.freeDelivery,
        category: formData.category,
        brand: formData.brand,
        stock: Number(formData.stock),
        images: previews,
      });

      navigate("/seller/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to add product");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-4 text-xl font-bold">Add Product</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="flex max-h-[calc(100vh-8rem)] flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-4 shadow-sm">
        <input name="name" placeholder="Product Name" onChange={handleChange} required className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
        <textarea name="description" placeholder="Description" onChange={handleChange} required className="min-h-28 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />

        <div className="grid gap-4 sm:grid-cols-2">
          <input name="price" type="number" placeholder="Selling Price" onChange={handleChange} required className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
          <input name="compareAtPrice" type="number" placeholder="Original Price / MRP" onChange={handleChange} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Price Preview</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <p>Original: <span className="font-semibold">Rs.{pricingSummary.originalPrice.toLocaleString()}</span></p>
            <p>Discount Price: <span className="font-semibold">Rs.{pricingSummary.sellingPrice.toLocaleString()}</span></p>
            <p>Discount: <span className="font-semibold">{pricingSummary.discountPercent}%</span></p>
          </div>
          {pricingSummary.hasDiscount && (
            <p className="mt-2 text-emerald-700">Customer saves Rs.{pricingSummary.savings.toLocaleString()}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input name="offer" placeholder="Offer Label (optional, e.g. Bank Offer)" onChange={handleChange} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" name="freeDelivery" checked={formData.freeDelivery} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
            Free Delivery
          </label>
        </div>

        <select name="category" value={formData.category} onChange={handleChange} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500">
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <input name="brand" placeholder="Brand" onChange={handleChange} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
        <input name="stock" type="number" placeholder="Stock" onChange={handleChange} required className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" />
        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white focus:border-purple-500" />

        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map((preview, index) => (
              <img key={`${index}-${preview.slice(0, 20)}`} src={preview} alt={`Preview ${index + 1}`} className="h-32 w-full rounded-xl object-cover" />
            ))}
          </div>
        )}

        <button className="rounded-xl bg-purple-600 py-3 text-white hover:bg-purple-700">Add Product</button>
      </form>
    </div>
  );
}
