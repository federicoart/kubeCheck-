const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 350,
    resizable: false,
    title: "KubeCheck - Installazione",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadURL(`data:text/html;charset=utf-8,
    <html><body style="font-family:sans-serif;text-align:center;background:#121212;color:#fff">
      <h2>🛠️ Installazione in corso...</h2>
      <p>Stiamo configurando KubeCheck per te.</p>
      <pre id="log" style="text-align:left; padding: 1em; height: 200px; overflow-y: auto; background: #000; color: #0f0; border-radius: 8px;"></pre>
      <script>
        const { ipcRenderer } = require('electron');
        ipcRenderer.on('log', (event, msg) => {
          document.getElementById('log').textContent += msg + "\\n";
        });
      </script>
    </body></html>`);

  // Comandi da eseguire
  const shellScript = path.join(__dirname, 'setup_cli_only.sh');
  const install = spawn('bash', [shellScript]);

  install.stdout.on('data', (data) => {
    win.webContents.send('log', data.toString());
  });

  install.stderr.on('data', (data) => {
    win.webContents.send('log', '❌ ' + data.toString());
  });

  install.on('close', (code) => {
    win.webContents.send('log', `✅ Setup terminato (exit code ${code})`);
    setTimeout(() => {
      app.quit(); // chiude solo dopo aver mostrato il log
    }, 3000);
  });
}

app.whenReady().then(createWindow);
