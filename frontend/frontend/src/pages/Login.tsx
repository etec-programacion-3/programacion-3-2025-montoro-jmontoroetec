import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const redirectTo = location.state?.from?.pathname ?? "/";

  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError("Credenciales inválidas");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 380 }}>
      <h2>Ingresar</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label><br/>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label><br/>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />
        </div>
        {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
        <button disabled={loading} type="submit">Entrar</button>
      </form>

      <div style={{ marginTop: 12 }}>
        ¿No tenés cuenta? <Link to="/register">Crear cuenta</Link>
      </div>
    </div>
  );
}
