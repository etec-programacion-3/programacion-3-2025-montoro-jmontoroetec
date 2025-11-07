import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h2>Mi perfil</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
