const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification
} = require("electron");
const engine = require("./bot-engine.cjs");
const mineflayer = require('mineflayer');

let bot;
let win;
let store;

const botStartCooldown = 2000;

function stopBot() {
  if (!bot) {
    return;
  }
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
        msg: "Creating Bot...",
        timestamp: engine.getLogTime(),
        level: "info"
      });
      bot = mineflayer.createBot({
        host,
        ...(port ? { port: Number(port) } : {}),
        auth,
        username,
        version,
        onMsaCode: async (data) => {
          await dialog.showMessageBox(win, {
            type: 'info',
            authTitle: 'Microsoft Login Required',
            message: data.message
          })
        },
        hideErrors: true
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
        msg: "Bot spawned",
        timestamp: engine.getLogTime(),
        level: "info"
      });
      setTimeout( () => {
        engine.setBotReady(true);
      },botStartCooldown);

    });

    bot.on("death",() => {
      win.webContents.send("log", {
        msg: "Bot died",
        timestamp: engine.getLogTime(),
        level: "error"
      });
    })


    bot.on("error",(err) => {
      win.webContents.send("log", {
        msg: err.message || "Error starting bot",
        timestamp: engine.getLogTime(),
        level: "error"
      });
    })
    bot.on("end",(reason) => {
      // TODO: limit attempts?
      if (reason == "socketClosed") {
        //win.webContents.send("log", {
        //  msg: "Reconnecting in 5s...",
        //  timestamp: engine.getLogTime(),
        //  level: "info"
        //});
        //setTimeout( () => {
       //  initBot(auth,host,port,username,version);
        //},500);
      }
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


async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    //titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });


  ipcMain.handle("get-minecraft-versions",(_) => {
    return engine.getSupportedVersions();
  });

  ipcMain.handle("drop-loot",(_,name) => {
    engine.dropItem(name);
  })

  ipcMain.handle("show-help",(_) => {
    engine.showHelp();
  })

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
    console.log("stop following player!");
    engine.stopFollowingPlayer();
  })

  ipcMain.handle("start-fishing",async(_) => {
    await engine.startFishing();
  });

  ipcMain.handle("deposit-loot",async(_) => {
    await engine.depositLoot();
  });

  ipcMain.handle("get-bot-commands",async(_) => {
    return await engine.getCommands();
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


app.whenReady().then(async () => {
  await initStore();
  await createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
