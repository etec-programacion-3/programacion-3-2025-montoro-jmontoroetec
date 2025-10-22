import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../api/client";
import { Product, PagedProducts } from "../types";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProducts({ page: 1, pageSize: 12 });
        const items = Array.isArray(data)
          ? data
          : (data as PagedProducts).items;
        if (mounted) setProducts(items ?? []);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Error al cargar productos");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Cargando productos…</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, padding: 24 }}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
