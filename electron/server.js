import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Substituindo __dirname com import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Ajustando o caminho para a pasta dist dependendo do ambiente
let distPath;
if (process.env.NODE_ENV === 'production') {
  // Em produção, usamos a pasta dentro do pacote do Electron
  distPath = path.join(__dirname, '../dist-electron/win-unpacked/resources/app/dist');
} else {
  // Em desenvolvimento, usamos a pasta dist local
  distPath = path.join(__dirname, '../dist');
}

// Serve arquivos estáticos da pasta dist
app.use(express.static(distPath));

// Rota para servir o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});
