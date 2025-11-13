// prisma/seed.js  (ESM, compatible con "type": "module")
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// helper para borrar sin romper si el modelo no existe
async function safeDelete(model, name) {
  if (!model || !model.deleteMany) {
    console.log(`(skip) No existe modelo ${name} en Prisma`);
    return;
  }
  await model.deleteMany();
  console.log(`(ok) Borrado todo de ${name}`);
}

async function main() {
  console.log("🗑️ Limpiando base de datos…");

  // 👉 BORRADO EN ORDEN, PERO “SEGURO”
  await safeDelete(prisma.message, "message");
  await safeDelete(prisma.conversation, "conversation");
  await safeDelete(prisma.productCategory, "productCategory");
  await safeDelete(prisma.product, "product");
  await safeDelete(prisma.category, "category");
  await safeDelete(prisma.user, "user");

  console.log("📦 Creando datos…");

  // ====== USUARIOS ======
  const user1 = await prisma.user.create({
    data: {
      email: "juan@example.com",
      password_hash: await bcrypt.hash("1234", 10),
      nombre: "Juan",
      apellido: "Prueba",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "maria@example.com",
      password_hash: await bcrypt.hash("1234", 10),
      nombre: "María",
      apellido: "Prueba",
    },
  });

  // ====== CATEGORÍAS ======
  const catElect = await prisma.category.create({
    data: { nombre: "Electrónica" },
  });

  const catHogar = await prisma.category.create({
    data: { nombre: "Hogar" },
  });

  // ====== PRODUCTO 1 ======
  const cafetera = await prisma.product.create({
    data: {
      nombre: "Cafetera Express",
      descripcion: "Acero inoxidable 15 bar",
      precio: 129999,
      stock: 8,
      sellerId: user2.id,
      // 👇 relación many-to-many implícita: conectamos categorías por id
      categories: {
        connect: [
          { id: catElect.id },
          { id: catHogar.id },
        ],
      },
    },
    include: {
      categories: true,
      seller: true,
    },
  });

  // ====== PRODUCTO 2 ======
  const auriculares = await prisma.product.create({
    data: {
      nombre: "Auriculares Bluetooth",
      descripcion: "Cancelación de ruido",
      precio: 59999,
      stock: 12,
      sellerId: user1.id,
      categories: {
        connect: [{ id: catElect.id }],
      },
    },
    include: {
      categories: true,
      seller: true,
    },
  });

  console.log("🎉 Productos creados:", cafetera.nombre, auriculares.nombre);
  console.log("✅ Seed terminado");
}

try {
  await main();
} catch (e) {
  console.error("❌ Error en seed:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
