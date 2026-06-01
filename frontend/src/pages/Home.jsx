import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import WhyChooseUs from "../components/WhyChooseUs";
import Footer from "../components/Footer";
import { getAllProducts } from "../api/products";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const recentProducts = useMemo(() => products.slice(0, 12), [products]);
  const trendingProducts = useMemo(
    () => [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6),
    [products]
  );

  return (
    <div className="bg-[#f6f7fb]">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-600">
              Latest Collection
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              New And Trending Products
            </h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[24px] bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading latest products...
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="rounded-[24px] bg-white p-10 text-center text-slate-500 shadow-sm">
            No products listed yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {recentProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-600">
              Popular Picks
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Top Trending Products
            </h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
            Browse catalog
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[24px] bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading trending products...
          </div>
        ) : trendingProducts.length === 0 ? (
          <div className="rounded-[24px] bg-white p-10 text-center text-slate-500 shadow-sm">
            Trending products will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trendingProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <WhyChooseUs />
      <Footer />
    </div>
  );
}
