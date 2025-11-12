// frontend/src/pages/Register.tsx
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type RegisterPayload } from "../api/auth";

export default function Register() {
  const { register: doRegister, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<RegisterPayload>({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
  });

  function setField<K extends keyof RegisterPayload>(k: K, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await doRegister(form);
      // si preferís entrar directo a la app, reemplazá por navigate("/")
      navigate("/login", { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "No se pudo registrar");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Registrarse</h2>
      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
        />
        <input
          placeholder="Nombre"
          value={form.nombre ?? ""}
          onChange={(e) => setField("nombre", e.target.value)}
        />
        <input
          placeholder="Apellido"
          value={form.apellido ?? ""}
          onChange={(e) => setField("apellido", e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registrando…" : "Registrarse"}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </div>
    </div>
  );
}
