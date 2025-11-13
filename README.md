Proyecto Ecommerce + Chat (Frontend + Backend + Docker + PostgreSQL)
Este proyecto consiste en una aplicación full-stack que incluye:

Backend: API REST en Node.js + Express + Prisma

Base de datos: PostgreSQL corriendo en Docker (docker-compose)

Frontend: React + Vite consumiendo exclusivamente la API

Autenticación: JWT

Funcionalidades principales:

Registro / Login de usuarios

Gestión de productos

Sistema de mensajería entre usuarios

Perfil de usuario

Requisitos previos

1- La computadora donde se ejecute este proyecto debe tener instalado:
Docker Desktop → https://www.docker.com/products/docker-desktop/
Node.js 18+ o superior (se recomienda Node 20) → https://nodejs.org

2- Configuración de Entorno
 1. Variables de entorno del Backend (backend/.env)

Crear un archivo .env dentro de la carpeta backend, con este contenido: 
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public"
JWT_SECRET="clave_super_segura"

 2. Levantar la Base de Datos (PostgreSQL con Docker)

Dentro de la raiz, ejecutar:

docker compose up -d

Esto levanta automáticamente:

Servidor PostgreSQL

Base de datos: ecommerce

Usuario: postgres

Password: postgres

Para confirmar que está funcionando:

docker ps

Deberías ver un contenedor postgres:15 en estado Up.
3. Aplicar migraciones Prisma

Dentro de backend/:

npx prisma migrate deploy

Luego ejecutar el seed:

npm run seed

Esto carga:

Usuarios de prueba

Productos

Categorías

4. Ejecutar el Backend

Dentro de backend/:

Instalar dependencias:

npm install


Ejecutar en modo desarrollo:

npm run dev


El backend quedará disponible en:

http://localhost:3000

5. Ejecutar el Frontend

Ir a:

frontend/

Crear el archivo .env:

VITE_API_BASE_URL="http://localhost:3000"


Instalar dependencias:

npm install


Ejecutar:

npm run dev


Abrir en el navegador:

http://localhost:5173

Pruebas del Backend – Archivo requests.http

El backend incluye un archivo:

backend/requests.http


Con ejemplos listos para probar:

Registro

Login

CRUD de productos

Conversaciones

Mensajes

Perfil

Se puede utilizar con la extensión REST Client de VS Code.

3- Cómo funciona el Proyecto
Usuarios

Registrarse e iniciar sesión

Editar perfil

Productos

Listado

CRUD desde la API

Vista en frontend

Mensajería entre usuarios

Crear conversación

Listar conversaciones

Enviar y recibir mensajes (polling automático)