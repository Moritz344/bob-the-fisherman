const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalFollow } = require('mineflayer-pathfinder').goals;

const argv = process.argv;
const username = argv[2];
const port = argv[3];
const version = argv[4];
if (argv.length < 5) {
  console.log("Usage: ./index.ts <username> <port> <version>")
  process.exit(0);
}


const bot = mineflayer.createBot({
  host: 'localhost',
  port,
  auth: "microsoft",
  username,
  version:version
});
const mcData = require('minecraft-data')(bot.version);


bot.loadPlugin(pathfinder);

bot.once('spawn', () => {
  console.log("Bot spawned");

})

bot.on("end",() => {
  console.log("Bot stopped");
})


bot.on('whisper', (username: any, message: any) => {
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
    items.forEach( (x: any) => {
      console.log(x.name);
    })
  }
})

function getInventory() {
  return bot.inventory.slots.filter( (x: any) => x != null);
}

function stopFollowingPlayer() {
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
}

function followPlayer(playerName: string) {
  if (isFishing) {
    stopFishing();
  }
  const playerEntity = bot.nearestEntity( (e: any) => e.type == "player" && e.username == playerName);

  if (!playerEntity) {
    return;
  }

  bot.pathfinder.setMovements(new Movements(bot, mcData));
  bot.pathfinder.setGoal(new GoalFollow(playerEntity, 1),true);


}

function stopFishing() {
  bot.removeListener("playerCollect",onCollect);
  if (isFishing) {
    bot.activateItem();
    isFishing = false;
  }

}

let isFishing = false;

async function startFishing() {
  const items = bot.inventory.slots.filter( (x: any) => x != null);
  let hasRod = items.some( (x: any) => x.name == "fishing_rod");
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
  } catch (err: any) {
    console.log(err.message)
  }

  isFishing = true;
  bot.on("playerCollect",onCollect);

  try {
    await bot.fish();
  } catch (err) {
    console.log(err);
  }
  isFishing = false;
}




function onCollect(player: any,entity: any) {
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
    matching: (block: any) => block.name === 'water',
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
  const items = slots.filter( (x: any) => x != null && bot.registry.foodsByName[x.name]);
  console.log(items.map((x: any) => x.name));

  if (items.length == 0) {
    console.log("No food in my inventory.");
    return;
  }

  try {
    await bot.equip(items[0], 'hand')
  } catch (err: any) {
    return console.log(err.message)
  }

  try {
    await bot.consume()
  } catch (err: any) {
    console.log(err.message)
  }
}


bot.on('error', (err: any) => console.log('Error:', err));
bot.on('kicked', (reason: any) => console.log('Kicked:', reason));
