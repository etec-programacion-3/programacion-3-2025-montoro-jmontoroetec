import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

type CreateProductBody = {
  nombre?: string;
  descripcion?: string;
  precio?: number | string;
  stock?: number;
  categoryIds?: number[];
};

type UpdateProductBody = {
  nombre?: string;
  descripcion?: string;
  precio?: number | string;
  stock?: number;
  categoryIds?: number[];
};

function normalizePrecio(p: unknown): string | undefined {
  if (typeof p === "number") return p.toString();
  if (typeof p === "string" && p.trim() !== "") return p;
  return undefined;
}

router.post(
  "/",
  authMiddleware,
  async (req: Request<unknown, unknown, CreateProductBody>, res: Response) => {
    try {
      const { nombre, descripcion, precio, stock = 0, categoryIds = [] } = req.body || {};

      if (!nombre || typeof nombre !== "string") {
        return res.status(400).json({ error: "nombre es obligatorio (string)" });
      }
      if (!descripcion || typeof descripcion !== "string") {
        return res.status(400).json({ error: "descripcion es obligatoria (string)" });
      }

      const precioNorm = normalizePrecio(precio);
      if (!precioNorm) {
        return res.status(400).json({ error: "precio es obligatorio (number|string)" });
      }

      const sellerId = (req as any).user?.userId as number | undefined;
      if (!sellerId) return res.status(401).json({ error: "No autenticado" });

      const connectCats =
        Array.isArray(categoryIds) && categoryIds.length
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined;

      const product = await prisma.product.create({
        data: {
          nombre,
          descripcion,
          precio: precioNorm, 
          stock: typeof stock === "number" ? stock : 0,
          sellerId,
          categories: connectCats,
        },
        include: {
          categories: true,
          seller: { select: { id: true, email: true, nombre: true, apellido: true } },
        },
      });

      return res.status(201).json(product);
    } catch (e) {
      console.error("POST /products error:", e);
      return res.status(500).json({ error: "Error creando producto" });
    }
  }
);

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
    const pageSize = Math.max(parseInt(String(req.query.pageSize ?? "10"), 10) || 10, 1);
    const skip = (page - 1) * pageSize;

    const categoryIdRaw = req.query.categoryId;
    const categoryId =
      typeof categoryIdRaw === "string" && categoryIdRaw.trim() !== ""
        ? Number(categoryIdRaw)
        : undefined;

    const where = categoryId ? { categories: { some: { id: categoryId } } } : {};

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { creado_en: "desc" },
        include: {
          categories: true,
          seller: { select: { id: true, email: true, nombre: true, apellido: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      data: items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (e) {
    console.error("GET /products error:", e);
    return res.status(500).json({ error: "Error listando productos" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });

    const prod = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        seller: { select: { id: true, email: true, nombre: true, apellido: true } },
      },
    });
    if (!prod) return res.status(404).json({ error: "Producto no encontrado" });
    return res.json(prod);
  } catch (e) {
    console.error("GET /products/:id error:", e);
    return res.status(500).json({ error: "Error obteniendo producto" });
  }
});

router.put(
  "/:id",
  authMiddleware,
  async (req: Request<{ id: string }, unknown, UpdateProductBody>, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });

      const userId = (req as any).user?.userId as number | undefined;
      if (!userId) return res.status(401).json({ error: "No autenticado" });

      const current = await prisma.product.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ error: "Producto no encontrado" });
      if (current.sellerId !== userId) return res.status(403).json({ error: "No autorizado" });

      const { nombre, descripcion, precio, stock, categoryIds } = req.body || {};
      const precioNorm = precio !== undefined ? normalizePrecio(precio) : undefined;

      const data: any = {};
      if (nombre !== undefined) data.nombre = nombre;
      if (descripcion !== undefined) data.descripcion = descripcion;
      if (precioNorm !== undefined) data.precio = precioNorm;
      if (stock !== undefined) data.stock = stock;

      if (Array.isArray(categoryIds)) {
        data.categories = {
          set: [], 
          connect: categoryIds.map((cid) => ({ id: cid })),
        };
      }

      const product = await prisma.product.update({
        where: { id },
        data,
        include: {
          categories: true,
          seller: { select: { id: true, email: true, nombre: true, apellido: true } },
        },
      });

      return res.json(product);
    } catch (e) {
      console.error("PUT /products/:id error:", e);
      return res.status(500).json({ error: "Error actualizando producto" });
    }
  }
);

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });

    const userId = (req as any).user?.userId as number | undefined;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: "Producto no encontrado" });
    if (current.sellerId !== userId) return res.status(403).json({ error: "No autorizado" });

    await prisma.product.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    console.error("DELETE /products/:id error:", e);
    return res.status(500).json({ error: "Error borrando producto" });
  }
});

export default router;
