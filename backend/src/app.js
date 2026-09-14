const path = require('path');
const fs = require('fs');

// Cargar .env con ruta absoluta ANTES de cualquier otro require
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ .env cargado desde:', envPath);
} else {
  require('dotenv').config();
  console.log('⚠️  .env no encontrado, usando variables de entorno del sistema');
}

const express = require('express');
const cors = require('cors');

const ojtApiRoutes = require('./routes/ojtApi.routes');

const app = express();
let PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas API BI OJT 5 Días
app.use('/api/ojt', ojtApiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Portal BI Control Operativo OJT (5 Días Base + Extensiones)',
    timestamp: new Date().toISOString()
  });
});

const startServer = (portToUse) => {
  const server = app.listen(portToUse, async () => {
    console.log('===========================================================');
    console.log(`🚀 Servidor Backend OJT listo en: http://localhost:${portToUse}`);
    console.log(`📊 Endpoints disponibles:`);
    console.log(`   - GET /api/ojt/dashboard-resumen`);
    console.log(`   - GET /api/ojt/filtros-disponibles`);
    console.log('===========================================================');

    // Auto-test de conexión y campañas disponibles en Supabase (via pg pool)
    try {
      const db = require('./config/database');
      const testRes = await db.query(`
        SELECT TRIM(CAST("CAMPAÑA" AS VARCHAR)) as c, COUNT(*) as total
        FROM public."CONTROL"
        WHERE "CAMPAÑA" IS NOT NULL
        GROUP BY TRIM(CAST("CAMPAÑA" AS VARCHAR))
        ORDER BY total DESC
        LIMIT 5;
      `);
      console.log('✅ Conexión Supabase (pg pool) exitosa. Campañas en BD:');
      testRes.rows.forEach(r => console.log(`   • "${r.c}" — ${r.total} registros`));
    } catch (err) {
      console.error('❌ Error pg pool Supabase:', err.message);
      console.error('   → Verifica el archivo backend/.env y la variable DATABASE_URL_SUPABASE');
    }

    // Auto-test del cliente Supabase JS
    try {
      const { testSupabaseConnection } = require('./config/supabase');
      await testSupabaseConnection();
    } catch (err) {
      console.error('❌ Error cliente Supabase JS:', err.message);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ El puerto ${portToUse} está ocupado. Intentando en el puerto ${portToUse + 1}...`);
      startServer(portToUse + 1);
    } else {
      console.error('❌ Error de servidor:', err.message);
    }
  });
};

if (require.main === module) {
  startServer(PORT);
}

module.exports = app;
