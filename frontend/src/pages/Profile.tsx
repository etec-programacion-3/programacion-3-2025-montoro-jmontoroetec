import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 420,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,.05)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Mi perfil</h2>
        {user ? (
          <>
            <div style={{ lineHeight: 1.7 }}>
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              {user.nombre || user.apellido ? (
                <div>
                  <strong>Nombre:</strong> {user.nombre ?? ""} {user.apellido ?? ""}
                </div>
              ) : null}
            </div>

            <button
              onClick={logout}
              style={{
                marginTop: 16,
                background: "#ef4444",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <div>No hay usuario autenticado.</div>
        )}
      </div>
    </div>
  );
}
