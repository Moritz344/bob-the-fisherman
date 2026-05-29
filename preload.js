const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getMinecraftVersions: () => ipcRenderer.invoke("get-minecraft-versions"),
  startBot: (host,port,version,auth,username) => ipcRenderer.invoke("start-bot", host,port,version,auth,username),
  getBotSettings: () => ipcRenderer.invoke("get-bot-settings"),
  saveBotSettings: (data) => ipcRenderer.invoke("save-settings",data),
  stopBot: () => ipcRenderer.invoke("stop-bot"),
  gameLogs: (callback) => ipcRenderer.on("game-logs", (_event, data) => callback(data)),
  botError: (callback) => ipcRenderer.on("bot-error", (_event, msg) => callback(msg)),
  loot: (callback) => ipcRenderer.on("loot-log", (_event, msg) => callback(msg)),
  initLoot: () => ipcRenderer.invoke("init-loot"),
  showError: (title,msg) => ipcRenderer.invoke("show-error",title,msg),
});
