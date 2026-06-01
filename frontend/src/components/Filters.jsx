import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const categoryItems = [
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

export default function Filters({ setFilters, productCount, initialCategory = "" }) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedRating, setSelectedRating] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const categoryCountLabel = useMemo(() => {
    if (!productCount) {
      return "0 Products";
    }

    return `${productCount}+ Products`;
  }, [productCount]);

  const updatePriceFilters = (nextPriceRange) => {
    setPriceRange(nextPriceRange);
    setFilters((prev) => ({
      ...prev,
      minPrice: nextPriceRange.min,
      maxPrice: nextPriceRange.max,
    }));
  };

  return (
    <aside className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:h-fit">
      <h2 className="text-[20px] font-bold uppercase tracking-tight text-slate-950">Filters</h2>
      <p className="mt-8 text-[15px] text-slate-500">{categoryCountLabel}</p>

      <div className="mt-3 overflow-hidden rounded-[18px] border border-slate-200">
        <button
          type="button"
          onClick={() => setIsCategoryOpen((open) => !open)}
          className="flex w-full items-center justify-between bg-slate-50 px-6 py-4 text-left text-[16px] font-medium text-slate-800"
        >
          <span>Category</span>
          {isCategoryOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>

        {isCategoryOpen && (
          <div className="max-h-[420px] space-y-3 overflow-y-auto px-6 py-5">
            {categoryItems.map((item) => (
              <label key={item.value} className="flex items-center gap-3 text-[15px] text-slate-800">
                <input
                  type="checkbox"
                  checked={selectedCategory === item.value}
                  onChange={() => {
                    const nextValue = selectedCategory === item.value ? "" : item.value;
                    setSelectedCategory(nextValue);
                    setFilters((prev) => ({ ...prev, category: nextValue }));
                  }}
                  className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-[18px] border border-slate-200">
        <button
          type="button"
          onClick={() => setIsPriceOpen((open) => !open)}
          className="flex w-full items-center justify-between px-6 py-4 text-left text-[16px] font-medium text-slate-800"
        >
          <span>Price</span>
          {isPriceOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>

        {isPriceOpen && (
          <div className="grid grid-cols-2 gap-3 px-6 pb-5">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(event) =>
                updatePriceFilters({ ...priceRange, min: event.target.value })
              }
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-purple-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(event) =>
                updatePriceFilters({ ...priceRange, max: event.target.value })
              }
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-[18px] border border-slate-200">
        <button
          type="button"
          onClick={() => setIsRatingOpen((open) => !open)}
          className="flex w-full items-center justify-between px-6 py-4 text-left text-[16px] font-medium text-slate-800"
        >
          <span>Rating</span>
          {isRatingOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>

        {isRatingOpen && (
          <div className="space-y-3 px-6 pb-5">
            {[4, 3, 2].map((rating) => (
              <label key={rating} className="flex items-center gap-3 text-[15px] text-slate-800">
                <input
                  type="checkbox"
                  checked={selectedRating === rating}
                  onChange={() => {
                    const nextRating = selectedRating === rating ? 0 : rating;
                    setSelectedRating(nextRating);
                    setFilters((prev) => ({ ...prev, minRating: nextRating || "" }));
                  }}
                  className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>{rating}+ Stars</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
