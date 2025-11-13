// frontend/src/components/ProductCard.tsx
import { Link } from "react-router-dom";

type Category = { id: number; nombre: string };
type Product = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number | string;
  stock: number;
  categories?: Category[];
};

type Props = { product: Product };

export default function ProductCard({ product }: Props) {
  const precio = typeof product.precio === "string" ? Number(product.precio) : product.precio;
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" }}>
      <h3 style={{ margin: 0 }}>
        <Link to={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          {product.nombre}
        </Link>
      </h3>
      <p style={{ margin: "6px 0 12px", color: "#4b5563" }}>{product.descripcion}</p>
      <div style={{ marginTop: "auto" }}>
        <strong>${precio.toLocaleString("es-AR")}</strong>
        <div style={{ fontSize: 12, color: "#6b7280" }}>Stock: {product.stock}</div>
      </div>
      {!!product.categories?.length && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {product.categories.map((c) => (
            <span key={c.id} style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: 999 }}>
              {c.nombre}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
