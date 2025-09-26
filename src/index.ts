// src/index.ts
import express from "express";
import dotenv from "dotenv";
import prisma from "./prisma";

// rutas nuevas
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";

dotenv.config();

const app = express();

app.use(express.json());

// ruta base
app.get("/", (req, res) => {
  res.send("Servidor funcionando ✅");
});

// tu endpoint actual que muestra todos los usuarios (puede quedarse)
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// montamos los routers
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
