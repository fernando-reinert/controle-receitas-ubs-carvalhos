import { app, BrowserWindow, Tray, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import open from 'open'; // Para abrir o navegador automaticamente
import { exec } from 'child_process';

// Substituindo __dirname com import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criando o servidor Express
const appExpress = express();
const PORT = 3000;

// Ajustando o caminho para a pasta dist dependendo do ambiente
let distPath;
if (process.env.NODE_ENV === 'production') {
  distPath = path.join(__dirname, '../dist-electron/win-unpacked/resources/app/dist');
} else {
  distPath = path.join(__dirname, '../dist');
}

// Serve arquivos estáticos da pasta dist
appExpress.use(express.static(distPath));

// Rota para servir o index.html
appExpress.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Inicia o servidor Express na porta 3000
appExpress.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);

  // Após o servidor iniciar, abrir o navegador automaticamente
  open(`http://localhost:${PORT}`);
});

// Função para criar a janela do Electron
let tray = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Carregar a URL do servidor local
  win.loadURL(`http://localhost:${PORT}`);

  win.on('closed', () => {
    console.log('A janela foi fechada, mas o servidor continua em execução');
  });
}

// Função para configurar o auto-start no Windows
function setAutoStart() {
  const appPath = path.join(__dirname, '../dist-electron/win-unpacked/resources/app/Controle de Receitas.ex'); // Ajuste o caminho para o seu executável
  const registryKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\YourAppName'; // Caminho do registro
  
  exec(`reg add "${registryKey}" /v "YourAppName" /t REG_SZ /d "${appPath}" /f`, (err, stdout, stderr) => {
    if (err) {
      console.error('Erro ao registrar o aplicativo para iniciar com o Windows:', err);
    } else {
      console.log('Aplicativo registrado para iniciar com o Windows');
    }
  });
}

// Inicia o app Electron
app.whenReady().then(() => {
  createWindow();
  setAutoStart(); // Registra o app para iniciar com o Windows

  // Criar um ícone na bandeja do sistema
  const trayIcon = path.join(__dirname, 'path_to_icon.png'); // Substitua pelo caminho do ícone que deseja usar
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir Aplicativo',
      click: () => {
        createWindow(); // Abre a janela novamente
      },
    },
    {
      label: 'Sair',
      click: () => {
        app.quit(); // Fecha o app
      },
    },
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('App está rodando em segundo plano');
});

// Evita que o Electron feche ao fechar a janela
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Apenas minimiza para a bandeja no Windows/Linux
    if (tray) {
      tray.setToolTip('App rodando em segundo plano');  // Garantir que tray foi inicializado
    }
  }
});
