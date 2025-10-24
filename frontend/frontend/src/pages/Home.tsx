// frontend/frontend/src/pages/Home.tsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../api/client";
import type { Product, PagedProducts } from "../types";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    console.log("[Home] baseURL:", import.meta.env.VITE_API_BASE_URL);

    async function load() {
      setLoading(true);
      setError(null);
      try {
        console.log("[Home] llamando fetchProducts...");
        const data = await fetchProducts({ page: 1, pageSize: 12 });
        console.log("[Home] data recibida:", data);
        const items = Array.isArray(data)
          ? data
          : (data as PagedProducts)?.items ?? [];

        if (mounted) setProducts(items);
      } catch (err) {
        console.error("[Home] error en fetch:", err);
        if (mounted) setError("Error al cargar productos");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Cargando productos…</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;
  if (!products.length) return <div style={{ padding: 24 }}>No hay productos para mostrar.</div>;

  return (
    <div style={{
      display: "grid",
      gap: 16,
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      padding: 24,
    }}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
