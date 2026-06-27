const { timestamp } = require('rxjs');

const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalFollow } = require('mineflayer-pathfinder').goals;


// TODO: deposit loot in chest

let bot;
let mcData;
let logFn = console.log;

let botReady = false;
let isFollowingPlayer = false;
let isFishing = false;

function setLogFn(fn) {
  logFn = fn;
}

function setBot(botInstance, mcDataInstance) {
  bot = botInstance;
  mcData = mcDataInstance;
}

function getSupportedVersions() {
  const mineflayer = require('mineflayer');
  return mineflayer.testedVersions
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

async function depositLoot() {
  const itemsToDeposit = bot.inventory.slots.filter(x => x != null && x.name != "fishing_rod");
  if (itemsToDeposit.length == 0) {
    logFn({
      msg: "No loot to deposit",
      timestamp: getLogTime(),
      level: "error"
    })
    return;
  }
  if (isFishing) {
    stopFishing();
  }

  if (isFollowingPlayer) {
    stopFollowingPlayer();
  }

  const maxDistance = 10;

  const chest = await bot.findBlock({
    point: bot.entity.position,
    matching: (block) => block.name === 'chest',
    maxDistance: maxDistance
  });
  if (!chest) {
    return;
  }
  await bot.lookAt(chest.position);
  const chestContainer = await bot.openChest(chest);
  for (const item  of itemsToDeposit) {
    const countOfItem = bot.inventory.count(item.type)
    await chestContainer.deposit(item.type, null, countOfItem);
  }

  chestContainer.close();

}


function followPlayer(playerName) {
  if (!bot) {
    logFn({
      msg: "Bot not found",
      timestamp: getLogTime(),
      level: "error"
    });
    return;
  }
  if (!playerName) {
    logFn({
      msg: "No player specified",
      timestamp: getLogTime(),
      level: "warn"
    });
    return;
  }
  if (isFishing) {
    stopFishing();
  }
  bot.loadPlugin(pathfinder);
  const playerEntity = bot.nearestEntity(e => e.type == "player" && e.username == playerName);
  if (!playerEntity) {
    logFn({
      msg: "I can't find this player to follow",
      timestamp: getLogTime(),
      level: "warn"
    });
    return;
  }
  logFn({
    msg: "Lead the way " + playerName + "!",
    timestamp: getLogTime(),
    level: "info"
  });
  isFollowingPlayer = true;
  bot.pathfinder.setMovements(new Movements(bot, mcData));
  bot.pathfinder.setGoal(new GoalFollow(playerEntity, 1), true);
}

function stopFollowingPlayer() {
  if (!bot.pathfinder) {
    return;
  }
  logFn({
    msg: "Stop following player",
    timestamp: getLogTime(),
    level: "info"
  });
  isFollowingPlayer = false;
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
    logFn({
      msg: "Bot is not ready",
      timestamp: getLogTime(),
      level: "error"
    });
    return;
  }
  if (isFishing) {
    stopFishing();
    return;
  }
  const hasRod = checkForFishingRodInInventory();
  if (!hasRod) {
    logFn({
      msg: "Bot has no fishing rod in his inventory",
      timestamp: getLogTime(),
      level: "warn"
    });
    return;
  }
  const foundWater = await checkForWaterNearby();
  if (!foundWater) {
    logFn({
      msg: "No water nearby",
      timestamp: getLogTime(),
      level: "warn"
    });
    return;
  }
  if (bot.food < 20) {
    logFn({
      msg: "I need to eat! Hunger: " + bot.food,
      timestamp: getLogTime(),
      level: "warn"
    });
    await eat();
  }
  isFishing = true;
  bot.removeListener("playerCollect", onCollect);
  bot.on("playerCollect", onCollect);
  try {
    await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand');
    await bot.fish();
  } catch (err) {
    logFn({
      msg: "Stopped fishing",
      timestamp: getLogTime(),
      level: "info"
    });
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
      logFn({
        msg: "No water found in distance of " + maxDistance + " blocks",
        timestamp: getLogTime(),
        level: "warn"
      });
      return false;
    }
    await bot.lookAt(waterBlock.position.offset(0.5, 2, 0.5), true);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}


async function onCollect(player, entity) {
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

  const totalCount = slots.filter(x => x.displayName == item.displayName).reduce((sum, x) => sum + x.count, 0) + 1;

  const lootLog = {
    timestamp: getLogTime(),
    name: item.name,
    displayName: item.displayName,
    count: totalCount,
    img: null,
    msg: "Caught " + item.displayName + " (" + totalCount + ")",
    level: "loot"
  }
  logFn(lootLog);

  setTimeout(() => startFishing(), 500);
}

async function eat() {
  stopFishing();
  const slots = bot.inventory.slots;
  const items = slots.filter(x => x != null && bot.registry.foodsByName[x.name]);

  if (items.length == 0) {
    logFn({
      msg: "No food in my inventory.",
      timestamp: getLogTime(),
      level: "warn"
    });
    return;
  }

  try {
    await bot.equip(items[0], 'hand');
  } catch (err) {
    return logFn({
      msg: err.message,
      timestamp: getLogTime(),
      level: "error"
    });
  }

  try {
    await bot.consume();
  } catch (err) {
    logFn({
      msg: err.message,
      timestamp: getLogTime(),
      level: "error"
    });
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
  getBotReady,
  getSupportedVersions,
  depositLoot
};
