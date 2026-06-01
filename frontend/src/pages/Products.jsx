import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { getAllProducts } from "../api/products";

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryFromQuery = searchParams.get("category") || "";
  const searchFromQuery = searchParams.get("search") || "";
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(() => ({
    ...(searchFromQuery ? { search: searchFromQuery } : {}),
    ...(categoryFromQuery ? { category: categoryFromQuery } : {}),
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: categoryFromQuery,
      search: searchFromQuery,
    }));
  }, [categoryFromQuery, searchFromQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts(filters);
        setProducts(data);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-[1900px] px-3 py-8 sm:px-4 lg:px-6">
        <div className="grid gap-7 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Filters setFilters={setFilters} productCount={products.length} initialCategory={categoryFromQuery} />

          <section>
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-[17px] font-medium text-slate-700">
                Sort by: <span className="font-bold text-slate-950">Relevance</span>
              </h1>
              <p className="text-sm text-slate-500">
                {searchFromQuery
                  ? `Search results for "${searchFromQuery}"`
                  : "Curated electronics for everyday use"}
              </p>
            </div>

            {loading ? (
              <div className="rounded-[20px] border border-slate-200 bg-white p-10 text-center text-slate-500">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-[20px] border border-slate-200 bg-white p-10 text-center text-slate-500">
                No products available.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
