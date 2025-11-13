import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

async function isParticipant(conversationId: number, userId: number) {
  const count = await prisma.conversationParticipant.count({
    where: { conversationId, userId },
  });
  return count > 0;
}


router.post("/", authMiddleware, async (req, res) => {
  try {
    const me = (req as any).user.userId as number;
    const { otherUserId } = req.body as { otherUserId?: number };

    if (!otherUserId) {
      return res.status(400).json({ error: "otherUserId es requerido" });
    }
    if (otherUserId === me) {
      return res.status(400).json({ error: "No podés conversar con vos mismo" });
    }

    const other = await prisma.user.findUnique({ where: { id: otherUserId } });
    if (!other) return res.status(404).json({ error: "Usuario destino no existe" });

    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: me } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        participants: { include: { user: { select: { id: true, nombre: true, apellido: true, email: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (existing) {
      return res.json({ conversation: existing, existing: true });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: me }, { userId: otherUserId }],
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, nombre: true, apellido: true, email: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return res.status(201).json({ conversation, existing: false });
  } catch (err) {
    console.error("Error POST /api/conversations:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});


router.post("/:id/messages", authMiddleware, async (req, res) => {
  try {
    const me = (req as any).user.userId as number;
    const id = Number(req.params.id);
    const { content } = req.body as { content?: string };

    if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });
    if (!content || !content.trim()) return res.status(400).json({ error: "content es requerido" });

    const ok = await isParticipant(id, me);
    if (!ok) return res.status(403).json({ error: "No sos participante de esta conversación" });

    const msg = await prisma.message.create({
      data: { conversationId: id, senderId: me, content: content.trim() },
      include: { sender: { select: { id: true, nombre: true, apellido: true, email: true } } },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json(msg);
  } catch (err) {
    console.error("Error POST /api/conversations/:id/messages:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});


router.get("/:id/messages", authMiddleware, async (req, res) => {
  try {
    const me = (req as any).user.userId as number;
    const id = Number(req.params.id);
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });

    const ok = await isParticipant(id, me);
    if (!ok) return res.status(403).json({ error: "No sos participante de esta conversación" });

    const [items, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: "asc" },
        skip,
        take: pageSize,
        include: { sender: { select: { id: true, nombre: true, apellido: true, email: true } } },
      }),
      prisma.message.count({ where: { conversationId: id } }),
    ]);

    return res.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Error GET /api/conversations/:id/messages:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const me = (req as any).user.userId as number;

    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: me } } },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: { include: { user: { select: { id: true, nombre: true, apellido: true, email: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return res.json(conversations);
  } catch (err) {
    console.error("Error GET /api/conversations:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

export default router;
