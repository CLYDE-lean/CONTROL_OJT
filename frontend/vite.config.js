import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function geaLogoPlugin() {
  return {
    name: 'gea-logo-plugin',
    buildStart() {
      try {
        const src = 'C:\\Users\\BRYAN\\.gemini\\antigravity-ide\\brain\\8cb69262-4ba5-468f-bc08-4ee4afc4cb06\\media__1786507770531.jpg';
        const destDir = path.resolve(__dirname, 'src/assets');
        const destFile = path.resolve(destDir, 'geaLogoAsset.js');
        const imageDest = path.resolve(destDir, 'gea_peru_logo.jpg');

        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        if (fs.existsSync(src)) {
          fs.copyFileSync(src, imageDest);
          const base64 = fs.readFileSync(src).toString('base64');
          const content = `// GEA PERÚ Logo Base64 Data URI\nexport const GEA_LOGO_URL = "data:image/jpeg;base64,${base64}";\nexport default GEA_LOGO_URL;\n`;
          fs.writeFileSync(destFile, content, 'utf8');
        }
      } catch (err) {
        console.warn('⚠️ geaLogoPlugin warning:', err.message);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), geaLogoPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
