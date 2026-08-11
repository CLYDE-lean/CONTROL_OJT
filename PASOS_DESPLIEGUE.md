# 🚀 Guía de Despliegue Automatizado a GitHub y Netlify

Esta guía te explica el paso a paso exacto para desplegar el **Portal BI OJT (Frontend en Netlify + Backend Express/Supabase)**.

---

## 🛠️ Archivos Preparados Automáticamente

Ya hemos configurado tu proyecto con todo lo necesario para producción:
- `.gitignore`: Protege tus claves de base de datos (`.env`) y evita subir carpetas pesadas (`node_modules`).
- `netlify.toml`: Configura el proceso de build de Vite/React y la ruta del SPA.
- `subir_a_github.bat`: Script de 1 solo clic para subir tu código a GitHub.

---

## 📌 Paso 1: Subir el Código a GitHub

1. Ingresa a [GitHub New Repository](https://github.com/new).
2. Nombra tu repositorio (ejemplo: `bi-ojt-definitivo`) y presiona **Create repository** (déjalo público o privado, como prefieras).
3. En la carpeta del proyecto (`c:\Users\BRYAN\Desktop\bi ojt definitivo`), haz doble clic en el archivo **`subir_a_github.bat`**.
4. Pega la URL de tu repositorio (ejemplo: `https://github.com/tu-usuario/bi-ojt-definitivo.git`) y presiona Enter.

---

## 📌 Paso 2: Desplegar el Frontend en Netlify

1. Inicia sesión en [Netlify.com](https://app.netlify.com/).
2. Haz clic en **"Add new site"** ➔ **"Import an existing project"**.
3. Selecciona **GitHub** e inicia sesión con tu cuenta.
4. Elige tu repositorio `bi-ojt-definitivo`.
5. Netlify leerá automáticamente el archivo `netlify.toml` con estos datos:
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist` (o `frontend/dist`)
6. Haz clic en **"Deploy bi-ojt-definitivo"**. ¡En menos de 2 minutos tu frontend estará publicado con un enlace HTTPS gratuito!

---

## 📌 Paso 3: Desplegar el Backend Express (Gratis 24/7 en Render o Vercel)

Para que tu dashboard consulte los datos de Supabase en producción:

### Opción Rápida en Render.com (Recomendado):
1. Inicia sesión en [Render.com](https://dashboard.render.com/).
2. Haz clic en **"New +"** ➔ **"Web Service"**.
3. Conecta tu repositorio de GitHub `bi-ojt-definitivo`.
4. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. En **Environment Variables**, añade las variables de tu `.env`:
   - `PGHOST`: `aws-0-sa-east-1.pooler.supabase.com`
   - `PGPORT`: `6543`
   - `PGDATABASE`: `postgres`
   - `PGUSER`: `postgres.eyqghjkyesjmxdfptryq`
   - `PGPASSWORD`: Tu contraseña de Supabase
6. Haz clic en **"Create Web Service"**. Copia la URL que te asigna Render (ejemplo: `https://bi-ojt-backend.onrender.com`).
7. Actualiza tu archivo `netlify.toml` cambiando la URL de redirección `/api/*` por la URL de Render.
