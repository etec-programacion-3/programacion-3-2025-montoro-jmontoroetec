import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import prisma from "../prisma.js"; 

const router = Router();

const JWT_SECRET = (process.env.JWT_SECRET ?? "dev_secret") as jwt.Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";
const SALT_ROUNDS = 10;

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, nombre, apellido } = req.body;
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "El email ya está registrado" });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, password_hash, nombre, apellido },
      select: { id: true, email: true, nombre: true, apellido: true, fecha_creacion: true },
    });

    return res.status(201).json({ message: "Usuario registrado ✅", user });
  } catch (err) {
    console.error("Error en /register:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});


router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Faltan credenciales" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const payload = { userId: user.id, email: user.email };
    const options: jwt.SignOptions = { expiresIn: 3600 }; // 👈 tipado claro
    const token = jwt.sign(payload, JWT_SECRET, options);

    return res.json({ message: "Login exitoso ✅", token, expiresIn: JWT_EXPIRES_IN });
  } catch (err) {
    console.error("Error en /login:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});


router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token no proporcionado" });

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato Authorization: Bearer <token>" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    const me = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, nombre: true, apellido: true, fecha_creacion: true },
    });

    if (!me) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(me);
  } catch (err) {
    console.error("Error en /me:", err);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
});

export default router;
