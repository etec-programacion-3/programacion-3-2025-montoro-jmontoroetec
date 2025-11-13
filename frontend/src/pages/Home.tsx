// frontend/src/pages/Home.tsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../api/client";
import type { Product } from "../types";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // page=1, pageSize=12 por defecto
        const resp = await fetchProducts({ page: 1, pageSize: 12 });
        const items = resp?.items ?? [];

        if (alive) setProducts(items);
      } catch (e) {
        console.error(e);
        if (alive) setError("No se pudieron cargar los productos");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Catálogo</h1>

      {loading && <div>Cargando productos…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div>No hay productos para mostrar.</div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
