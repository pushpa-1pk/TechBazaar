import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getAllProducts } from "../api/products";

export default function RelevantProducts({ category, currentProductId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getAllProducts({ category });
        setProducts(data.filter((product) => product._id !== currentProductId));
      } catch (error) {
        console.error(error);
        setProducts([]);
      }
    };

    loadProducts();
  }, [category, currentProductId]);

  if (!products.length) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-center text-2xl font-semibold text-slate-900">Related Products</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

