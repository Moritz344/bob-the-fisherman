const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
} = require("electron");

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.handle("connect",(_) => {

  });

  if (process.env.ELECTRON_DEV) {
    win.loadURL("http://localhost:4200/");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist/bob-fisher/browser/index.html"));
  }
}

app.whenReady().then(async () => {
  await createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
