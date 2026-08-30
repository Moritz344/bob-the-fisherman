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
const ChatMessage = require('prismarine-chat')
const nbt = require('prismarine-nbt')

let bot;
let win;
let aboutWindow;
let store;

const MAX_RECONNECTS = 3;
let reconnects = 0;
let shouldReconnect = true;

const botStartCooldown = 2000;

function stopBot() {
  if (!bot) {
    return;
  }
  shouldReconnect = false;
  bot.quit();
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
      console.log("item name not found");
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
        profilesFolder: '/home/moritz/.config/bob-the-fisherman/auth-cache',
        onMsaCode: async (data) => {
          await dialog.showMessageBox(win, {
            type: 'info',
            authTitle: 'Microsoft Login Required',
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
      setTimeout( () => {
        engine.setBotReady(true);
      },botStartCooldown);

    });

    bot.on("death",() => {
      win.webContents.send("log", {
        msg: "Bot died",
        timestamp: engine.getLogTime(),
        level: "warn"
      });
    })


    bot.on("chat",(username,message) => {
      const chatMessage = username + ": " + message
      win.webContents.send("log",{
        msg: chatMessage,
        timestamp: engine.getLogTime(),
        level: "chat"
      })
    })

    bot.on("kicked",(reason,loggedIn) => {
      try {
        let raw = typeof reason === 'string' ? JSON.parse(reason) : reason
        if (raw?.type) {
          raw = nbt.simplify(raw)
        }
        const Chat = require('prismarine-chat')(bot.version)
        const text = new Chat(raw).toString()

        win.webContents.send("log", {
          msg: "Bot got kicked: " + text,
          timestamp: engine.getLogTime(),
          level: "error"
        });
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
      console.log(err);
      win.webContents.send("log", {
        msg: err.message || "Error starting bot",
        timestamp: engine.getLogTime(),
        level: "error"
      });
      shouldReconnect = false;
      engine.setBotReady(false);
    })
    bot.on("end",(reason,err) => {
      //if (reason == "socketClosed" && shouldReconnect) {
      //  autoReconnect({
      //    auth,
      //    host,
      //    port,
      //    username,
      //    version
      //  });
      //  return;
      //}


      win.webContents.send("log", {
        msg: "Bot stopped",
        timestamp: engine.getLogTime(),
        level: "error"
      });
      engine.setBotReady(false);
    });


    bot.on('whisper', async(username, message) => {
      if (username === bot.username) return
      if (message == "!start") {
        engine.startFishing();
      } else if (message == "!stop") {
        engine.stopFishing();
      } else if (message == "!eat") {
        setTimeout( () => {
          engine.eat();
        },500);
      } else if (message.includes("!follow")) {
        const msg = message.split(" ");
        if (msg && msg.length >= 2) {
          const playerToFollow = msg[1].trim("");
          engine.followPlayer(playerToFollow);
        }
      } else if (message == "!stop follow") {
        engine.stopFollowingPlayer();
      } else if (message == "!find water") {
        engine.checkForWaterNearby();
      } else if (message == "!show inventory") {
        const items = getInventory();
        items.forEach( (x) => {
          console.log(x.name);
        })
      } else if (message == "!deposit") {
        engine.depositLoot();
      }
    })

    } catch(err) {
      console.log("Error starting Bot:");
      console.log(err);
    }

}



function getInventory() {
  return bot.inventory.slots.filter( (x) => x != null);
}

function autoReconnect({ auth,host,port,username,version}) {
  if (reconnects >= MAX_RECONNECTS) {
    return;
  }
  reconnects += 1;
  win.webContents.send("log", {
    msg: "Reconnecting in 3s attempt " + reconnects,
    timestamp: engine.getLogTime(),
    level: "error"
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
    //titleBarStyle: "hidden",
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
  })

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
  })

  ipcMain.handle("save-action-settings",(_,data) => {
    store.set("actions",data);
  })

  ipcMain.handle("show-error",(_,title,msg) => {
    dialog.showErrorBox(title,msg);
  });

  ipcMain.handle("get-bot-settings",(_) => {
    return store.get("settings");
  })

  ipcMain.handle("get-bot-action-settings",(_) => {
    return store.get("actions");
  })

  ipcMain.handle("stop-fishing",async(_) => {
    engine.stopFishing();
  })

  ipcMain.handle("stop-following",async(_) => {
    engine.stopFollowingPlayer();
  })

  ipcMain.handle("minimize", (_) => {
    BrowserWindow.getFocusedWindow()?.minimize()
  });

  ipcMain.handle("start-fishing",async(_) => {
    await engine.startFishing();
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
    win.loadFile(path.join(__dirname, "dist/bob-fisher/browser/index.html"));
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
