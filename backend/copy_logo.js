const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\BRYAN\\.gemini\\antigravity-ide\\brain\\8cb69262-4ba5-468f-bc08-4ee4afc4cb06\\media__1786507770531.jpg';
const destDir = path.join(__dirname, '../frontend/src/assets');
const dest = path.join(destDir, 'gea_peru_logo.jpg');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('✅ Logo copiado exitosamente a:', dest);

// También generar una versión base64 data URI en frontend/src/assets/geaLogoDataUri.js para import directo seguro
const base64 = fs.readFileSync(src).toString('base64');
const dataUriContent = `// GEA PERÚ Logo Data URI
export const GEA_LOGO_DATA_URI = "data:image/jpeg;base64,${base64}";
export default GEA_LOGO_DATA_URI;
`;
fs.writeFileSync(path.join(destDir, 'geaLogoDataUri.js'), dataUriContent);
console.log('✅ Data URI generado exitosamente.');
