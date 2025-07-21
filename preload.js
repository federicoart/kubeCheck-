const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadJSON: () => ipcRenderer.invoke('load-json'),
  openKubeconfig: (filepath) => ipcRenderer.invoke('open-kubeconfig', filepath),
  saveJSON: (data) => ipcRenderer.invoke('save-json', data),
  saveCSV: (data) => ipcRenderer.invoke('save-csv', data),
  saveHistory: (cmd) => ipcRenderer.invoke('save-history', cmd),
  getHistory: () => ipcRenderer.invoke('get-history')
});
