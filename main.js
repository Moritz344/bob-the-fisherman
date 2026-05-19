const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
} = require("electron");

// FIXME: load them if just in time to improve perfomance
const mineflayer = require('mineflayer')
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalFollow } = require('mineflayer-pathfinder').goals;


let bot;
let isFishing = false;

function stopBot() {
  bot.quit();
}
function initBot(auth,host, port,username,version) {

    bot = mineflayer.createBot({
      host,
      port,
      auth,
      username,
      version
    });




  bot.once('spawn', () => {
    console.log("Bot spawned");

  })

  bot.on("end",() => {
    console.log("Bot stopped");
  })


  bot.on('whisper', (username, message) => {
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

}


function getInventory() {
  return bot.inventory.slots.filter( (x) => x != null);
}

function stopFollowingPlayer() {
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
    return;
  }


  bot.pathfinder.setMovements(new Movements(bot, mcData));
  bot.pathfinder.setGoal(new GoalFollow(playerEntity, 1),true);
}


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

  ipcMain.handle("get-minecraft-versions",(_) => {
    return mineflayer.testedVersions
  });

  ipcMain.handle("stop-bot",(_) => {
    stopBot();
  });

  ipcMain.handle("start-bot",(_,host,port,version,auth,username) => {
    initBot(auth,host,port,username,version);
  });

  if (process.env.ELECTRON_DEV) {
    win.loadURL("http://localhost:4200/");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist/bob-fisher/browser/index.html"));
  }
}

function stopFishing() {
  bot.removeListener("playerCollect",onCollect);
  if (isFishing) {
    bot.activateItem();
    isFishing = false;
  }

}




async function startFishing() {
  const items = bot.inventory.slots.filter( (x) => x != null);
  let hasRod = items.some( (x) => x.name == "fishing_rod");
  if (!hasRod) {
    console.log("I don't have an fishing rod in my inventory");
    return;
  }

  const waterIsNearby = lookAtWater();
  if (!waterIsNearby) {
    return;
  }


  if (bot.food < 20) {
    await eat();
  }


  try {
    await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
  } catch (err) {
    return console.log(err.message)
  }

  isFishing = true;
  bot.on("playerCollect",onCollect);

  try{
    await bot.fish();
  } catch (err) {
    console.log(err);
  }
  isFishing = false;
}


function onCollect(player,entity) {
  if (player !== bot.entity) {
    return;
  }
  bot.removeListener("playerCollect", onCollect);
  console.log("collected something");
  setTimeout( () => {
    startFishing();
  },500);
}

function lookAtWater() {
  const waterBlock = bot.findBlock({
    point: bot.entity.position,
    matching: (block) => block.name === 'water',
    maxDistance: 10
  });
  if (!waterBlock) {
    console.log("There is no water nearby!");
    return false;
  }
  bot.lookAt(waterBlock.position.offset(0.5,2,0.5));
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
  await createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
