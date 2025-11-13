import { Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ProductDetail from "./pages/ProductDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      {/* Barra de navegación simple */}
      <nav
        style={{
          display: "flex",
          gap: 16,
          padding: 12,
          borderBottom: "1px solid #ddd",
        }}
      >
        <Link to="/">Inicio</Link>
        <Link to="/messages">Mensajes</Link>
        <Link to="/profile">Perfil</Link>

        <span style={{ flex: 1 }} />

        {isAuthenticated ? (
          <button onClick={logout}>Salir</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}
      </nav>

      {/* Rutas */}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route path="/products/:id" element={<ProductDetail />} />

        {/* 404 simple */}
        <Route
          path="*"
          element={<div style={{ padding: 24 }}>404 - Página no encontrada</div>}
        />
      </Routes>
    </>
  );
}
