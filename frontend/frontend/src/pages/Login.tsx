// frontend/frontend/src/pages/Login.tsx
import type { FormEvent } from "react";
import { useState } from "react";
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
      // 👇 ahora login recibe UN objeto { email, password }
      await login({ email, password });
      nav("/", { replace: true });
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "No se pudo iniciar sesión");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Iniciar sesión</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
    </div>
  );
}
