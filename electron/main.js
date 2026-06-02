const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let serverModule = null;
let mainWindow = null;

async function startBackend() {
  if (isDev) return; // dev mode runs server via concurrently
  try {
    // Resolve server.js from packaged location
    const serverPath = path.join(__dirname, '..', 'server', 'server.js');
    process.env.ENV_PATH =
      process.env.ENV_PATH ||
      path.join(process.resourcesPath || path.join(__dirname, '..'), '.env');
    serverModule = require(serverPath);
    await serverModule.start();
  } catch (err) {
    console.error('[electron] failed to start backend:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Adija Invoice',
    backgroundColor: '#f1f5f9',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadURL('http://localhost:4000');
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  await startBackend();
  createWindow();
  Menu.setApplicationMenu(null);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
