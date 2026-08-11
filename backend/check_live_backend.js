const http = require('http');

http.get('http://localhost:3000/api/ojt/dashboard-resumen', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response Preview:", data.substring(0, 500));
    try {
      const json = JSON.parse(data);
      console.log("Total asesores unicos en embudo:", json.embudo?.total_asesores_unicos);
      console.log("Total asesores en matriz:", json.matriz?.asesores?.length);
    } catch(e) {
      console.error("JSON parse error");
    }
    process.exit(0);
  });
}).on('error', (err) => {
  console.error("HTTP GET ERROR:", err.message);
  process.exit(1);
});
