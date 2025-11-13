import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProductById, startConversation } from "../api/client";
import type { Product } from "../types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [product, setProduct]   = useState<Product | null>(null);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductById(productId);
        if (mounted) setProduct(data);
      } catch (e) {
        console.error(e);
        if (mounted) setError("No se pudo cargar el producto");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [productId]);

  async function handleContactSeller() {
    const sellerId = (product as any)?.sellerId ?? product?.seller?.id;
    if (!sellerId) {
      alert("No se encontró el vendedor del producto");
      return;
    }
    try {
      setContacting(true);
      const resp = await startConversation(Number(sellerId));
      alert(resp?.existing ? "Ya existe una conversación (abrir chat)" : "Conversación creada (abrir chat)");
    } catch (e) {
      console.error(e);
      alert("No se pudo iniciar la conversación");
    } finally {
      setContacting(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (error)   return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;
  if (!product) return <div style={{ padding: 24 }}>Producto no encontrado</div>;

  const precio = typeof product.precio === "string" ? Number(product.precio) : product.precio;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>{product.nombre}</h1>
      <p style={{ color: "#4b5563" }}>{product.descripcion}</p>

      <div style={{ margin: "12px 0" }}>
        <strong style={{ fontSize: 20 }}>${precio.toLocaleString("es-AR")}</strong>
        <div style={{ fontSize: 14, color: "#6b7280" }}>Stock: {product.stock}</div>
      </div>

      {product.categories?.length ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 16px" }}>
          {product.categories.map(c => (
            <span key={c.id} style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: 999, fontSize: 12 }}>
              {c.nombre}
            </span>
          ))}
        </div>
      ) : null}

      <div style={{ margin: "8px 0 24px", fontSize: 14 }}>
        Vendedor: <strong>{product.seller?.nombre} {product.seller?.apellido}</strong> ({product.seller?.email})
      </div>

      <button onClick={handleContactSeller} disabled={contacting}
        style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>
        {contacting ? "Contactando…" : "Contactar al vendedor"}
      </button>
    </div>
  );
}
