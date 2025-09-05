// src/index.ts
import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// RUTA DE PRUEBA
app.get("/", (req, res) => {
  res.send("Servidor funcionando ✅");
});

// RUTA PARA PROBAR CONEXIÓN A DB
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// LEVANTAR EL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
