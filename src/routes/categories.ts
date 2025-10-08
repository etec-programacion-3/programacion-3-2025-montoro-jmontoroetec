import { Router, Request, Response } from "express";
import prisma from "../prisma";

const router = Router();

type CreateCategoryBody = {
  nombre?: string;
};

// POST /api/categories  { nombre }
router.post("/", async (req: Request<unknown, unknown, CreateCategoryBody>, res: Response) => {
  const { nombre } = req.body || {};
  if (!nombre || typeof nombre !== "string") {
    return res.status(400).json({ error: "nombre es obligatorio (string)" });
  }

  try {
    const cat = await prisma.category.create({ data: { nombre } });
    return res.status(201).json(cat);
  } catch (e: any) {
    if (e?.code === "P2002") {
      // unique constraint
      return res.status(409).json({ error: "La categoría ya existe" });
    }
    console.error("POST /categories error:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});

// GET /api/categories
router.get("/", async (_req: Request, res: Response) => {
  try {
    const cats = await prisma.category.findMany({ orderBy: { nombre: "asc" } });
    return res.json(cats);
  } catch (e) {
    console.error("GET /categories error:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});

export default router;
