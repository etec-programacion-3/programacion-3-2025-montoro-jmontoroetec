import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: ""
  });
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error(err);
      setError("No se pudo registrar");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Crear cuenta</h2>
      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 10 }}>
          <input placeholder="Nombre" value={form.nombre} onChange={(e)=>set("nombre", e.target.value)} />
          <input placeholder="Apellido" value={form.apellido} onChange={(e)=>set("apellido", e.target.value)} />
          <input placeholder="Email" value={form.email} onChange={(e)=>set("email", e.target.value)} />
          <input placeholder="Password" type="password" value={form.password} onChange={(e)=>set("password", e.target.value)} />
        </div>
        {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ marginTop: 10 }}>Registrarme</button>
      </form>
    </div>
  );
}
