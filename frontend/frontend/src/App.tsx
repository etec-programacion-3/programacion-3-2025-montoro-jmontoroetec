import { Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PrivateRoute from "./routes/PrivateRoute";
import { useAuth } from "./context/AuthContext";

function Nav() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <div style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
      <Link to="/">Inicio</Link>
      {isAuthenticated ? (
        <>
          <Link to="/profile">Perfil</Link>
          <button onClick={logout}>Salir</button>
          <span style={{ marginLeft: "auto" }}>{user?.email}</span>
        </>
      ) : (
        <>
          <Link to="/login">Ingresar</Link>
          <Link to="/register">Registrarme</Link>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
