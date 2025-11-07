import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../api/client";
import type { Product } from "../types";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts({ page: 1, pageSize: 12 });

        const items = Array.isArray(data)
          ? data
          : (data?.items ?? data?.data ?? []); 

        if (mounted) setProducts(items ?? []);
      } catch (err) {
        console.error(err);
        if (mounted) setError("No se pudieron cargar los productos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Cargando productos…</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;
  if (!products.length) return <div style={{ padding: 24 }}>No hay productos para mostrar.</div>;

  return (
    <div style={{
      display: "grid",
      gap: 16,
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      padding: 24,
    }}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
