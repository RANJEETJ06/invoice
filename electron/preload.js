// Reserved for future IPC bridges. Renderer uses HTTP to localhost:4000.
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('adija', { isElectron: true });
