const path = require("path");
const fs = require("fs");
const {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Notification
} = require("electron");
const engine = require("./bot-engine.cjs");
const mineflayer = require('mineflayer');
const nbt = require('prismarine-nbt');

let bot;
let win;
let aboutWindow;
let store;

let shouldReconnect = true;

const botStartCooldown = 2000;

function getFriendlyErrorMessage(err) {
  const code = err && err.code;
  if (code) {
    const networkMessages = {
      ECONNREFUSED: "Connection refused by the server. The server may be offline or blocking this connection",
      ECONNRESET: "Connection was reset by the server",
      ECONNABORTED: "Connection was aborted by the server",
      ETIMEDOUT: "Connection to the server timed out",
      ENOTFOUND: "Could not resolve the server address (hostname not found)",
      EAI_AGAIN: "Could not resolve the server address, DNS is temporarily unavailable",
      EHOSTUNREACH: "Server host is unreachable",
      ENETUNREACH: "Network is unreachable"
    };
    if (networkMessages[code]) {
      return networkMessages[code];
    }
  }

  const msg = (err && err.message) || "";

  if (msg.startsWith("This server is version")) {
    return "Server version is not supported. Try updating the bot packages";
  }
  if (msg.startsWith("Unsupported protocol version")) {
    return "Client and server protocol versions do not match. Try updating the bot packages";
  }
  if (msg.startsWith("Parse error") || msg.startsWith("Serialization error")) {
    return "Protocol error while communicating with the server: " + msg;
  }
  if (msg.includes("client timed out after")) {
    return "Connection to the server timed out (keepalive timeout)";
  }
  if (msg.includes("Failed to obtain profile data")) {
    return "Microsoft authentication failed. The account may not own Minecraft or the login did not complete";
  }

  return msg || "Unknown error";
}

function stopBot() {
  if (!bot) {
    return;
  }
  shouldReconnect = false;
  bot.quit();
}

async function startFishingTask() {
   if (!engine.getIsAllowedToStartFishing()) {
     const isBotReady = engine.getBotReady();
     if (!isBotReady) {
       win.webContents.send("log",{
          msg: "Bot is not ready!",
          timestamp: engine.getLogTime(),
          level: "warn"
       });
       return;
     }

     const isWaterNearby = await engine.checkForWaterNearby();
     if (!isWaterNearby) {
       return;
     }

     engine.setIsAllowedToStartFishing(true);
     win.webContents.send("log",{
       msg: "Bot Started fishing",
       timestamp: engine.getLogTime(),
       level: "info"
     });
   }

   await engine.startFishing();

}

async function initStore() {
  const StoreModule = await import("electron-store");
  store = new StoreModule.default();
}

async function getItemImage(name) {
  const url = "https://atlas.playcdu.co/search/first/minecraft/" + name;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    return response;

  } catch (err) {
    console.log("Error getting img for item",err);
  }

}

async function sendNotificationWhenItemCaughtOnNotFocused(msg) {
   if (!msg.name) {
     console.log("item name not found for notification");
     return;
   }
   const { nativeImage } = require("electron");
   const responseImg = await getItemImage(msg.name);
   let icon;
   if (responseImg.ok) {
      const buffer = Buffer.from(await responseImg.arrayBuffer());
      icon = nativeImage.createFromBuffer(buffer);
   }
   new Notification({title: "Bob The Fisherman",body: "Caught "  + msg.displayName + "!",icon}).show();
}


async function initBot(auth,host, port,username,version) {
    try {
      win.webContents.send("log", {
        msg: "Creating Bot... " ,
        timestamp: engine.getLogTime(),
        level: "info"
      });
      bot = mineflayer.createBot({
        host,
        ...(port ? { port: Number(port) } : {}),
        auth,
        username,
        version,
        profilesFolder: path.join(app.getPath('userData'), 'auth-cache'),
        onMsaCode: async (data) => {
          await dialog.showMessageBox(win, {
            type: 'info',
            title: 'Microsoft Login Required',
            message: data.message + '\n\nIf the wrong account opens, use a private browser window.'
          })
        },
        hideErrors: true,
        respawn: true,
      });


    const mcData = require('minecraft-data')(bot.version);
    engine.setBot(bot, mcData);
    engine.setLogFn((logMsg) => {
      if (logMsg.level == "loot") {
        if (!win.isFocused()) {
          sendNotificationWhenItemCaughtOnNotFocused(logMsg);
        }
      }
      win.webContents.send("log",logMsg);
    });

    bot.once('spawn', async() => {
      win.webContents.send("log", {
        msg: "Bot spawned on " + host,
        timestamp: engine.getLogTime(),
        level: "info"
      });
      win.webContents.send("bot-skin",{
        texture: engine.getBotHead(),
        username: bot.username
      })
      setTimeout( async() => {
        engine.setBotReady(true);
        const task = engine.getBotTask();
        if (task == "Fishing") {
          setTimeout(async() => {
            await startFishingTask();
          },2000);
        }
      },botStartCooldown);

    });

    bot.on("death",() => {
      win.webContents.send("log", {
        msg: "Bot died",
        timestamp: engine.getLogTime(),
        level: "warn"
      });
    })


    bot.on("chat",(username,message,translate,jsonMsg) => {
      if (translate != "<%s> %s") { return; }
      const chatMessage = username + ": " + message
      win.webContents.send("log",{
        msg: chatMessage,
        timestamp: engine.getLogTime(),
        level: "chat"
      })
    })

    bot.on("kicked",(reason) => {
      try {
        let raw = typeof reason === 'string' ? JSON.parse(reason) : reason
        if (raw?.type) {
          raw = nbt.simplify(raw)
        }
        const Chat = require('prismarine-chat')(bot.version)
        const text = new Chat(raw).toString()

        win.webContents.send("log", {
          msg: text,
          timestamp: engine.getLogTime(),
          level: "warn"
        });
        engine.setIsAllowedToStartFishing(false);
        if (shouldReconnect) {
          autoReconnect({
            auth,
            host,
            port,
            username,
            version
          });

        }
      } catch (e) {
        console.error('Failed to parse kicked reason', e)
        win.webContents.send("log", {
          msg: `Bot got kicked: ${typeof reason === 'string' ? reason : JSON.stringify(reason)}`,
          timestamp: engine.getLogTime(),
          level: "error"
        });
      }
    })

    bot.on("error",(err) => {
      win.webContents.send("log", {
        msg: getFriendlyErrorMessage(err),
        timestamp: engine.getLogTime(),
        level: "error"
      });
      shouldReconnect = false;
      engine.setIsAllowedToStartFishing(false);
      engine.setBotReady(false);
    })
    bot.on("end",() => {
      //win.webContents.send("log", {
      //  msg: "Bot stopped",
      //  timestamp: engine.getLogTime(),
      //  level: "error"
      //});
      engine.setBotReady(false);
    });


    bot.on('whisper', async(username, message) => {
      win.webContents.send("log",{
        msg: username + " whispered: " + message,
        timestamp: engine.getLogTime(),
        level: "info"
      })
    });

    } catch(err) {
      console.log("Error starting Bot:");
      console.log(err);
    }

}


function autoReconnect({ auth,host,port,username,version}) {
  win.webContents.send("log", {
    msg: "Reconnecting in 3 seconds ...",
    timestamp: engine.getLogTime(),
    level: "info"
  });
  setTimeout( () => {
   initBot(auth,host,port,username,version);
  },3000);
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    roundedCorners: "10",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.handle("send-chat-message",(_,message) => {
    bot.chat(message);
  });

  ipcMain.handle("exit",() => {
    app.quit();
  });


  ipcMain.handle("get-minecraft-versions",(_) => {
    return engine.getSupportedVersions();
  });

  ipcMain.handle("open-external", async (_, url) => {
    await shell.openExternal(url);
  });

  ipcMain.handle("close-about-window",async(_,name) => {
      aboutWindow.close();
      aboutWindow = null;
  });

  ipcMain.handle("drop-loot",(_,name) => {
    engine.dropItem(name);
  })

  ipcMain.handle("show-help",(_) => {
    engine.showHelp();
  })


  ipcMain.handle("get-about-data",async () => {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname,"package.json")));

      return {
          name: pkg.name,
          version: pkg.version,
          description: pkg.description,
          author: pkg.author
        }
      } catch (error) {
        console.log("error:", error);
      }
  })

  ipcMain.handle("open-about",async () => {
   if (aboutWindow) {
     return;
   }
   aboutWindow = new BrowserWindow({
      maxWidth: 400,
      maxHeight: 200,
      frame: false,
      parent: win,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    //aboutWindow.openDevTools();
    loadAngularRoute(aboutWindow, "about");
});

  ipcMain.handle("stop-current-task",(_,task) => {
    engine.stopCurrentTask(task);
  });

  ipcMain.handle("set-current-task",(_,task) => {
    engine.setBotTask(task);
  });

  ipcMain.handle("get-current-task",(_) => {
    return engine.getBotTask();
  });

  ipcMain.handle("follow-player",(_,name) => {
    engine.followPlayer(name);
  });


  ipcMain.handle("find-water",async(_) => {
    engine.checkForWaterNearby();
  });

  ipcMain.handle("stop-bot",(_) => {
    stopBot();
  });

  ipcMain.handle("save-settings",(_,data) => {
    store.set("settings",data);
  });

  ipcMain.handle("save-action-settings",(_,data) => {
    store.set("actions",data);
  });

  ipcMain.handle("show-error",(_,title,msg) => {
    dialog.showErrorBox(title,msg);
  });

  ipcMain.handle("get-bot-settings",(_) => {
    return store.get("settings");
  });

  ipcMain.handle("get-bot-action-settings",(_) => {
    return store.get("actions");
  });

  ipcMain.handle("stop-fishing",async(_) => {
    engine.stopFishing();
    engine.setIsAllowedToStartFishing(false);
  });

  ipcMain.handle("stop-following",async(_) => {
    engine.stopFollowingPlayer();
  });

  ipcMain.handle("minimize", (_) => {
    BrowserWindow.getFocusedWindow()?.minimize()
  });

  ipcMain.handle("start-fishing",async(_) => {
    await startFishingTask();
  });

  ipcMain.handle("deposit-loot",async(_) => {
    await engine.depositLoot();
  });

  ipcMain.handle("get-bot-commands",async(_) => {
    return engine.getCommands();
  });

  ipcMain.handle("start-bot",async(_,host,port,version,auth,username) => {
    win.webContents.send("log", {
      msg: "Starting Bot...",
      timestamp: engine.getLogTime(),
      level: "info"
    });
    await initBot(auth,host,port,username,version);
  });

  ipcMain.handle("init-loot",async(_) => {
    while (!engine.getBotReady()) {
        await new Promise(r => setTimeout(r, 500));
    }
    const slots = bot.inventory.slots.filter( x => x != null);

    return await Promise.all(slots.map(async (x) => {
    const responseItemImg = await getItemImage(x.name);
    return {
        name: x.name,
        displayName: x.displayName,
        count: x.count,
        img: responseItemImg.url ? responseItemImg.url : null
    }
  }));

  });

  if (process.env.ELECTRON_DEV) {
    win.loadURL("http://localhost:4200/");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist/bob-the-fisherman/browser/index.html"));
  }
}

function loadAngularRoute(window, route = "") {
  if (process.env.ELECTRON_DEV) {
    window.loadURL(`http://localhost:4200/${route}`);
  } else {
    window.loadFile(path.join(__dirname, 'dist/bob-the-fisherman/browser/index.html'), {
      hash: '/' + route,
    });
  }
}


app.whenReady().then(async () => {
  await initStore();
  await createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
