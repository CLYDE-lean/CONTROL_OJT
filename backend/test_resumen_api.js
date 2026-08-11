const http = require('http');

http.get('http://localhost:3000/api/ojt/resumen', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log("⚡ HTTP API /api/ojt/resumen respuesta:");
      console.log("  - total_unicos:", parsed.embudo?.total_asesores_unicos);
      console.log("  - matriz asesores count:", parsed.matriz?.asesores?.length);
    } catch (e) {
      console.error("Respuesta no es JSON:", data.substring(0, 300));
    }
    process.exit(0);
  });
}).on('error', (err) => {
  console.error("Error conectando a backend server:", err.message);
  process.exit(1);
});
