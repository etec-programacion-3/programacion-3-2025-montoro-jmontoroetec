// frontend/frontend/src/pages/Register.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { RegisterPayload } from "../api/auth";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterPayload>({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
  });

  const [err, setError] = useState<string | null>(null);

  function setField<K extends keyof RegisterPayload>(k: K, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register(form);              
      navigate("/", { replace: true });  
    } catch (error: any) {
      console.error(error);
      setError(error?.message ?? "No se pudo registrar");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Registro</h2>
      {err && (
        <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>
      )}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre ?? ""}
          onChange={(e) => setField("nombre", e.target.value)}
        />
        <input
          type="text"
          placeholder="Apellido"
          value={form.apellido ?? ""}
          onChange={(e) => setField("apellido", e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </div>
  );
}
