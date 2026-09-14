const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\BRYAN\\.gemini\\antigravity-ide\\brain\\8cb69262-4ba5-468f-bc08-4ee4afc4cb06\\media__1786507770531.jpg';
const destFile = path.join(__dirname, '../frontend/src/assets/geaLogoAsset.js');

try {
  const fileBuffer = fs.readFileSync(src);
  const base64Data = fileBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64Data}`;

  const jsContent = `// GEA PERÚ Corporate Logo - Base64 Data URI
export const GEA_LOGO_URL = "${dataUri}";
export default GEA_LOGO_URL;
`;

  fs.writeFileSync(destFile, jsContent, 'utf8');
  console.log('✅ geaLogoAsset.js generado exitosamente con Base64 Data URI!');
} catch (err) {
  console.error('❌ Error al generar Base64 Data URI:', err.message);
}
