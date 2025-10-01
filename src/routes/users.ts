import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userPayload = (req as any).user;
    if (!userPayload) return res.status(401).json({ error: "No autorizado" });

    const dbUser = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, email: true, nombre: true, apellido: true, fecha_creacion: true }
    });

    if (!dbUser) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json(dbUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al obtener usuario" });
  }
});

export default router;
