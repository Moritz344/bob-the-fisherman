const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalFollow } = require('mineflayer-pathfinder').goals;

let bot;
let mcData;
let logFn = console.log;
let logLootFn = console.log;

let botReady = false;
let isFishing = false;

function setLogFn(fn) {
  logFn = fn;
}

function setLootLogFn(fn) {
  logLootFn = fn;
}

function setBot(botInstance, mcDataInstance) {
  bot = botInstance;
  mcData = mcDataInstance;
}

function getBot() {
  return bot;
}

function getIsFishing() {
  return isFishing;
}

function setBotReady(v) {
  botReady = v;
}

function getBotReady() {
  return botReady;
}

function error(code,botInfo) {
   if (!code) {
     return "ERROR CODE NOT FOUND." + code;
   }

   if (code == 'ECONNREFUSED') {
     return "ERROR: Port " + botInfo.port + " on "  + botInfo.host + " not found";
   } else if (code == 'ENOTFOUND') {
     return "ERROR: Server " + botInfo.host + " not found";
   } else if (code == 'ETIMEDOUT') {
     return "ERROR: Server unreachable";
   } else if (code == 'ECONNRESET') {
     return "ERROR: Connection was killed";
   } else if (code == 'EHOSTUNREACH') {
     return "ERROR: No route to host";
   } else if (code == 'EAI_AGAIN') {
     return 'ERROR: DNS temporary failure';
   } else if (code == 'EPIPE') {
     return 'ERROR: Wrote to a closed connection';
   } else if (code == 'ERR_SOCKET_BAD_PORT') {
     return "ERROR: Bad port " + botInfo.port ;
   } else {
     return "ERROR: unexpected error: " + code;
   }

}

function followPlayer(playerName) {
  if (!bot) {
    logFn("Bot not found",bot);
    return;
  }
  if (!playerName) {
    logFn("No player specified");
    return;
  }
  if (isFishing) {
    stopFishing();
  }
  bot.loadPlugin(pathfinder);
  const playerEntity = bot.nearestEntity(e => e.type == "player" && e.username == playerName);
  if (!playerEntity) {
    logFn("I can't find this player to follow");
    return;
  }
  logFn("Lead the way " + playerName + "!");
  bot.pathfinder.setMovements(new Movements(bot, mcData));
  bot.pathfinder.setGoal(new GoalFollow(playerEntity, 1), true);
}

function stopFollowingPlayer() {
  logFn("Stop following player");
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
}

function stopFishing() {
  bot.removeListener("playerCollect", onCollect);
  if (isFishing) {
    bot.activateItem();
    isFishing = false;
  }
}

function getLogTime() {
    const date = new Date();
    return date.getHours().toString().padStart(2,"0") + ":" + date.getMinutes().toString().padStart(2,"0") + ":" + date.getSeconds().toString().padStart(2,"0") ;
}


async function startFishing() {
  if (!botReady) {
    logFn("Bot is not ready please wait a second");
    return;
  }
  if (isFishing) {
    stopFishing();
    return;
  }
  const hasRod = checkForFishingRodInInventory();
  if (!hasRod) {
    logFn("Bot has no fishing rod in his inventory");
    return;
  }
  const foundWater = await checkForWaterNearby();
  if (!foundWater) {
    logFn("No water nearby");
    return;
  }
  if (bot.food < 20) {
    logFn("I need to eat! Hunger: " + bot.food);
    await eat();
  }
  isFishing = true;
  bot.on("playerCollect", onCollect);
  try {
    await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand');
    await bot.fish();
  } catch (err) {
    console.log(err);
  }
  isFishing = false;
}

function checkForFishingRodInInventory() {
  if (!bot) {
    return false;
  }

  const items = bot.inventory.slots.filter(x => x != null);
  return items.some(x => x.name == "fishing_rod");
}

async function checkForWaterNearby() {
  try {
    const maxDistance = 10;
    const waterBlock = await bot.findBlock({
      point: bot.entity.position,
      matching: (block) => block.name === 'water',
      maxDistance: maxDistance
    });
    if (!waterBlock) {
      logFn("No water found in distance of " + maxDistance + " blocks");
      return false;
    }
    await bot.lookAt(waterBlock.position.offset(0.5, 2, 0.5), true);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function onCollect(player, entity) {
  if (player !== bot.entity) return;
  if (entity.type == "orb" || entity.name == 'experience_orb') return;

  const slots = bot.inventory.slots.filter(x => x != null);
  const itemId = entity.metadata.at(-1).itemId;
  const item = slots.find(x => x.type == itemId);

  if (!item) {
    setTimeout(() => startFishing(), 500);
    return;
  }

  bot.removeListener("playerCollect", onCollect);

  const totalCount = slots.filter(x => x.displayName == item.displayName).reduce((sum, x) => sum + x.count, 0);

  const lootLog = {
    time: getLogTime(),
    name: item.name,
    displayName: item.displayName,
    count: totalCount,
    img: null
  }
  logLootFn(lootLog);

  setTimeout(() => startFishing(), 500);
}

async function eat() {
  stopFishing();
  const slots = bot.inventory.slots;
  const items = slots.filter(x => x != null && bot.registry.foodsByName[x.name]);

  if (items.length == 0) {
    logFn("No food in my inventory.");
    return;
  }

  try {
    await bot.equip(items[0], 'hand');
  } catch (err) {
    return logFn(err.message);
  }

  try {
    await bot.consume();
  } catch (err) {
    logFn(err.message);
  }
}

module.exports = {
  setLogFn,
  setBot,
  getBot,
  getIsFishing,
  setBotReady,
  followPlayer,
  stopFollowingPlayer,
  stopFishing,
  startFishing,
  checkForFishingRodInInventory,
  checkForWaterNearby,
  onCollect,
  eat,
  getLogTime,
  error,
  getBotReady,
  setLootLogFn
};
