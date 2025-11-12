// frontend/src/pages/Login.tsx
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "No se pudo iniciar sesión");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Iniciar sesión</h2>
      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button disabled={loading} type="submit">
          {loading ? "Ingresando…" : "Entrar"}
        </button>
      </form>
      <div style={{ marginTop: 12 }}>
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </div>
    </div>
  );
}
