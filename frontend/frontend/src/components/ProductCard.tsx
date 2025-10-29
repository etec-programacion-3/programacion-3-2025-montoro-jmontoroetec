import { Link } from "react-router-dom";
import type { Product } from "../types";

type Props = { product: Product };

const ProductCard = ({ product }: Props) => {
  const precio =
    typeof product.precio === "string"
      ? Number(product.precio)
      : product.precio;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* 🔗 título clickeable que navega al detalle */}
      <h3 style={{ margin: 0 }}>
        <Link
          to={`/products/${product.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {product.nombre}
        </Link>
      </h3>

      <p style={{ margin: 0, color: "#4b5563" }}>{product.descripcion}</p>

      <div style={{ marginTop: "auto" }}>
        <strong>${precio.toLocaleString("es-AR")}</strong>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          Stock: {product.stock}
        </div>
      </div>

      {!!product.categories?.length && (
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          {product.categories!.map((c) => (
            <span
              key={c.id}
              style={{
                background: "#f3f4f6",
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 12,
              }}
            >
              {c.nombre}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
