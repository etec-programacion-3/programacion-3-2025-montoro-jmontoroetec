import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JwtPayloadCustom {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Authorization header missing" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Authorization format: Bearer <token>" });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
    (req as any).user = decoded;
    return next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
}
