import { Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <>
      {/* Nav mínimo para moverte mientras probás */}
      <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/" style={{ marginRight: 12 }}>Inicio</Link>
        <Link to="/messages" style={{ marginRight: 12 }}>Mensajes</Link>
        <Link to="/profile" style={{ marginRight: 12 }}>Perfil</Link>
        <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
        <Link to="/register">Registro</Link>
      </nav>

      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protegidas */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* Redir / 404 */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
      </Routes>
    </>
  );
}
