import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, nombre, apellido } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email y password requeridos" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email ya registrado" });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, password_hash, nombre, apellido },
      select: { id: true, email: true, nombre: true, apellido: true, fecha_creacion: true }
    });

    return res.status(201).json({ message: "Usuario creado", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error registrando usuario" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email y password requeridos" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({ token, expiresIn: JWT_EXPIRES_IN });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en login" });
  }
});

export default router;
