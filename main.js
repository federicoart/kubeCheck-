const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let commandHistory = [];

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
      icon: path.join(__dirname, 'assets/icon.png'), // << ICONA PERSONALIZZATA
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
    nodeIntegration: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('load-json', async () => {
  const data = fs.readFileSync(path.join(__dirname, 'kube_namespaces_only.json'), 'utf-8');
  return JSON.parse(data);
});

ipcMain.handle('open-kubeconfig', async (_, filepath) => {
  return shell.openPath(filepath);
});

ipcMain.handle('save-json', async (_, data) => {
  const outPath = path.join(__dirname, 'exported_namespaces.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  return outPath;
});

ipcMain.handle('save-csv', async (_, data) => {
  const outPath = path.join(__dirname, 'exported_namespaces.csv');
  const rows = ["kubeconfig,namespaces"].concat(
    data.map(item => `${item.file},"${item.namespaces.join(';')}"`)
  );
  fs.writeFileSync(outPath, rows.join('\n'));
  return outPath;
});

ipcMain.handle('save-history', async (_, cmd) => {
  if (cmd && !commandHistory.includes(cmd)) {
    commandHistory.unshift(cmd);
    if (commandHistory.length > 20) commandHistory.pop();
  }
  return commandHistory;
});

ipcMain.handle('get-history', async () => {
  return commandHistory;
});
