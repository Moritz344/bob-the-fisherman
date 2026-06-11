const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog
} = require("electron");
const engine = require("./bot-engine.cjs");
const mineflayer = require('mineflayer');

// TODO: send notifcation that bot caught something when window is not focused

let bot;
let win;
let store;

const botStartCooldown = 2000;

function stopBot() {
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
    return response.url;

  } catch (err) {
    console.log("Error getting img for item",err);
  }

}



async function initBot(auth,host, port,username,version) {
    try {

      console.log("auth:",auth);
      console.log("port",port);
      win.webContents.send("game-logs",  engine.getLogTime() + " Creating Bot...");
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
    engine.setLogFn((msg) => {
      win.webContents.send("game-logs", engine.getLogTime() + " " + msg);
    });

    engine.setLootLogFn((msg) => {
      win.webContents.send("loot-log",msg);
    });

    bot.once('spawn', async() => {
      win.webContents.send("game-logs",  engine.getLogTime() + " Bot spawned");
      setTimeout( () => {
        engine.setBotReady(true);
      },botStartCooldown);

    });

    bot.on("error",(err) => {
      console.log(err);
      const errorMessage = engine.error(err.code,{ host,port});
      win.webContents.send("bot-error",errorMessage);
    })
    bot.on("end",() => {
      win.webContents.send("game-log","Bot stopped");
    })


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
    return mineflayer.testedVersions
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

  ipcMain.handle("start-bot",async(_,host,port,version,auth,username) => {
    win.webContents.send("game-logs",engine.getLogTime() + " Starting Bot...");
    await initBot(auth,host,port,username,version);
  });

  ipcMain.handle("init-loot",async(_) => {
    while (!engine.getBotReady()) {
        await new Promise(r => setTimeout(r, 500));
    }
    const slots = bot.inventory.slots.filter( x => x != null);


    return await Promise.all(slots.map(async (x) => {
    let r = await getItemImage(x.name);
    return {
        name: x.name,
        displayName: x.displayName,
        count: x.count,
        img: r ? r : null
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
