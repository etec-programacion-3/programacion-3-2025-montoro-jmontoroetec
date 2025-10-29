import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      {/* si alguien entra a /home lo mando a / */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      {/* 404 simple */}
      <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
    </Routes>
  );
}
