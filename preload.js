const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getMinecraftVersions: () => ipcRenderer.invoke("get-minecraft-versions"),
  startBot: (host,port,version,auth,username) => ipcRenderer.invoke("start-bot", host,port,version,auth,username),
  stopFishing: () => ipcRenderer.invoke("stop-fishing"),
  stopFollowing: () => ipcRenderer.invoke("stop-following"),
  getBotSettings: () => ipcRenderer.invoke("get-bot-settings"),
  getActionSettings: () => ipcRenderer.invoke("get-bot-action-settings"),
  saveBotSettings: (data) => ipcRenderer.invoke("save-settings",data),
  saveBotActionSettings: (data) => ipcRenderer.invoke("save-action-settings",data),
  stopBot: () => ipcRenderer.invoke("stop-bot"),
  gameLogs: (callback) => ipcRenderer.on("game-logs", (_event, data) => callback(data)),
  botError: (callback) => ipcRenderer.on("bot-error", (_event, msg) => callback(msg)),
  loot: (callback) => ipcRenderer.on("loot-log", (_event, msg) => callback(msg)),
  initLoot: () => ipcRenderer.invoke("init-loot"),
  startFishing: () => ipcRenderer.invoke("start-fishing"),
  showError: (title,msg) => ipcRenderer.invoke("show-error",title,msg),
  followPlayer: (name) => ipcRenderer.invoke("follow-player",name),
  findWater: () => ipcRenderer.invoke("find-water"),
});
