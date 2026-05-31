const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog
} = require("electron");


// FIXME: load them if just in time to improve perfomance
const mineflayer = require('mineflayer')
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalFollow } = require('mineflayer-pathfinder').goals;

let bot;
let isFishing = false;
let win;
let store;

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

function getLogTime() {
    const date = new Date();
    return date.getHours().toString().padStart(2,"0") + ":" + date.getMinutes().toString().padStart(2,"0") + ":" + date.getSeconds().toString().padStart(2,"0") ;
}


async function initBot(auth,host, port,username,version) {
    try {

      console.log("auth:",auth);
      win.webContents.send("game-logs",  getLogTime() + " Creating Bot...");
      bot = await mineflayer.createBot({
        host,
        port,
        auth,
        username,
        version,
        onMsaCode: async (data) => {
          await dialog.showMessageBox(win, {
            type: 'info',
            authTitle: 'Microsoft Login Required',
            message: data.message
          })
        }
      });



    bot.once('spawn', () => {
      console.log("Bot spawned");
      win.webContents.send("game-logs",  getLogTime() + " Bot spawned");
    })

    //bot.on("kicked",(reason,loggedIn) => {
    //  console.log(reason,loggedIn);
    //  win.webContents.send("bot-error","Bot Kicked!");
    //});

    bot.on("end",(reason) => {
      console.log("Bot ended reason: ", reason);
      if (reason == "socketClosed") {
        win.webContents.send("bot-error","Bot crashed! Please make sure the settings for the bot are correct." + "\n Settings: \nHost:  " + host + "\nPort: " + port + "\n" + "auth: " + auth + "\n" + "name:  " + username + "\n" + "version:  " + version);
      }
      win.webContents.send("game-logs"," Bot stopped");
    })


    bot.on('whisper', async(username, message) => {
      if (username === bot.username) return
      if (message == "!start") {
        startFishing();
      } else if (message == "!stop") {
        stopFishing();
      } else if (message == "!eat") {
        setTimeout( () => {
        eat();
        },500);
      } else if (message.includes("!follow")) {
        const msg = message.split(" ");
        if (msg.length >= 2) {
          const playerToFollow = msg[1].trim("");
          followPlayer(playerToFollow);
        }
      } else if (message == "!stop follow") {
        stopFollowingPlayer();
      } else if (message == "!find water") {
        lookAtWater();
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

function stopFollowingPlayer() {
  win.webContents.send("game-logs"," Stop following player");
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
}

function followPlayer(playerName) {

  const pathfinder = require('mineflayer-pathfinder').pathfinder;
  bot.loadPlugin(pathfinder);

  const mcData = require('minecraft-data')(bot.version);

  if (isFishing) {
    stopFishing();
  }
  const playerEntity = bot.nearestEntity( (e) => e.type == "player" && e.username == playerName);

  if (!playerEntity) {
    console.log("no player");
    win.webContents.send("game-logs"," No player to follow found!");
    return;
  }


  win.webContents.send("game-logs"," Following Player " + playerName);
  bot.pathfinder.setMovements(new Movements(bot, mcData));
  bot.pathfinder.setGoal(new GoalFollow(playerEntity, 1),true);
}


async function createWindow() {
  win = new BrowserWindow({
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

  ipcMain.handle("get-minecraft-versions",(_) => {
    return mineflayer.testedVersions
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

  ipcMain.handle("start-fishing",async(_) => {
    setTimeout( () => {
      console.log("start fishing!");
      startFishing();
    },1000);
  })

  ipcMain.handle("start-bot",(_,host,port,version,auth,username) => {
    win.webContents.send("game-logs",getLogTime() + " Starting Bot...");
    initBot(auth,host,port,username,version);
  });

  ipcMain.handle("init-loot",async(_) => {
    while (!bot.entity) {
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

function stopFishing() {
  win.webContents.send("game-logs", getLogTime() + " Stop Fishing");
  bot.removeListener("playerCollect",onCollect);
  if (isFishing) {
    bot.activateItem();
    isFishing = false;
  }

}




async function startFishing() {
  console.log("start fishing called");
  const items = bot.inventory.slots.filter( (x) => x != null);
  let hasRod = items.some( (x) => x.name == "fishing_rod");
  if (!hasRod) {
    win.webContents.send("game-logs",getLogTime() + " No fishing rod in my inventory!");
    console.log("I don't have an fishing rod in my inventory");
    return;
  }

  const waterIsNearby = lookAtWater();
  if (!waterIsNearby) {
    win.webContents.send("game-logs", getLogTime() + " Not Water nearby!");
    return;
  }


  if (bot.food < 20) {
    win.webContents.send("game-logs",getLogTime() + " Eating");
    await eat();
  }


  try {
    await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
  } catch (err) {
    console.log(err.message)
  }

  isFishing = true;
  bot.on("playerCollect",onCollect);

  await bot.fish();
  isFishing = false;
}


async function onCollect(player,entity) {
  if (player !== bot.entity) {
    return;
  }

  if (entity.type == "orb" || entity.name == 'experience_orb') {
    return;
  }

  bot.removeListener("playerCollect", onCollect);

  const slots = bot.inventory.slots.filter( x => x != null);
  const itemId = entity.metadata.at(-1).itemId;
  const item = slots.find(x => x.type == itemId);

  if (!item) {
    win.webContents.send("game-log", getLogTime() + " I was not able to get the collected item!");
  }

  const lootObj = {
    name: item.name,
    displayName: item.displayName,
    count: item.count,
    img: null
  }
  console.log(lootObj);
  win.webContents.send("loot-log", lootObj);
  setTimeout( () => {
    startFishing();
  },500);
}


async function lookAtWater() {
  const waterBlock = bot.findBlock({
    point: bot.entity.position,
    matching: (block) => block.name === 'water',
    maxDistance: 10
  });
  if (!waterBlock) {
    console.log("There is no water nearby!");
    return false;
  }
  await bot.lookAt(waterBlock.position.offset(0.5,2,0.5));
  return true;
}

async function eat () {
  stopFishing()

  const slots = bot.inventory.slots;
  const items = slots.filter( (x) => x != null && bot.registry.foodsByName[x.name]);
  console.log(items.map((x) => x.name));

  if (items.length == 0) {
    console.log("No food in my inventory.");
    return;
  }

  try {
    await bot.equip(items[0], 'hand')
  } catch (err) {
    return console.log(err.message)
  }

  try {
    await bot.consume()
  } catch (err) {
    console.log(err.message)
  }
}


app.whenReady().then(async () => {
  await initStore();
  await createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
