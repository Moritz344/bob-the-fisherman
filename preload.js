const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getMinecraftVersions: () => ipcRenderer.invoke("get-minecraft-versions"),
  startBot: (host,port,version,auth,username) => ipcRenderer.invoke("start-bot", host,port,version,auth,username),
  stopBot: () => ipcRenderer.invoke("stop-bot"),
  gameLogs: (callback) => ipcRenderer.on("game-logs", (_event, data) => callback(data)),
});
