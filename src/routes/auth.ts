import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";

// 👇 Import compatible con ESM para jsonwebtoken
import pkg from "jsonwebtoken";
const { sign, verify } = pkg as any;  // usamos desestructuración

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";
const SALT_ROUNDS = 10;

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, nombre, apellido } = req.body;
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await prisma.user.create({
      data: { email, password_hash, nombre, apellido },
    });

    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
    });
  } catch (err) {
    console.error("Error en /register:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    // 👇 generamos token con sign (ya no rompe)
    const token = sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: 3600 } // 1 hora
    );

    return res.json({ token });
  } catch (err) {
    console.error("Error en /login:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PROTECTED ROUTE: /me
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "Token requerido" });

    const token = auth.split(" ")[1];
    const decoded = verify(token, JWT_SECRET) as { userId: number; email: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      fecha_creacion: user.fecha_creacion,
    });
  } catch (err) {
    console.error("Error en /me:", err);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
});

export default router;
