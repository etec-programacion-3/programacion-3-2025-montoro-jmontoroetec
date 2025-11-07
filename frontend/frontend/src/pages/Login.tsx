import type { FormEvent} from "react";
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
      await login({ email, password });
      nav("/"); 
    } catch (e: any) {
      setErr(e.message ?? "No se pudo iniciar sesión");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Iniciar sesión</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button disabled={loading} type="submit">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div style={{ marginTop: 12 }}>
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </div>
    </div>
  );
}
