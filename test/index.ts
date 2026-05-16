const mineflayer = require('mineflayer')


const bot = mineflayer.createBot({
  host: 'localhost',
  port: 34603 ,
  auth: "offline",
  username: "Bob_The_Fisher",
  version: "1.18.2"
});

bot.once('spawn', () => {
  console.log("Bot spawned");
})

bot.on("end",() => {
  console.log("Bot stopped");
})


bot.on('chat', (username: any, message: any) => {
  if (username === bot.username) return
  if (message == "start") {
    startFishing();
  } else if (message == "stop") {
    stopFishing();
  } else if (message == "eat") {
    setTimeout( () => {
    eat();
    },500);
  }
})

bot.on("physicTick", lookAtNearesPlayer);

function lookAtNearesPlayer() {
  const playerFilter = (entity: any) => entity.type == "player";
  const playerEntity = bot.nearestEntity(playerFilter);

  if (!playerEntity) {
    return;
  }

  const pos = playerEntity.position.offset(0,playerEntity.height,0);
  bot.lookAt(pos);

}

async function stopFishing() {
bot.removeListener("playerCollect",onCollect);
  if (isFishing) {
    bot.chat("stop fishing");
    bot.activateItem();
    isFishing = false;
  }

}

let isFishing = false;

async function startFishing() {
  const items = bot.inventory.slots.filter( (x: any) => x != null);
  let hasRod = items.some( (x: any) => x.name == "fishing_rod");
  if (!hasRod) {
    bot.chat("I don't have an fishing rod in my inventory");
    return;
  }

  console.log(bot.food);
  if (bot.food < 20) {
    await eat();
  }


  try {
    await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
    console.log("fishing rod:",bot.registry.itemsByName.fishing_rod.id)
  } catch (err: any) {
    return bot.chat(err.message)
  }

  isFishing = true;
  bot.on("playerCollect",onCollect);

  try{
    await bot.fish();
    bot.chat("fish now!");
  } catch (err: any) {
    bot.chat("Error while starting fishing:" + err.message);
  }
  isFishing = false;
}


function onCollect(player: any,entity: any) {
  if (player !== bot.entity) {
    return;
  }
  bot.removeListener("playerCollect", onCollect);
  bot.chat("collected something");
  setTimeout( () => {
    startFishing();
  },500);
}

function lookAtWater() {}

async function eat () {
  stopFishing()

  const slots = bot.inventory.slots;
  const items = slots.filter( (x: any) => x != null && bot.registry.foodsByName[x.name]);
  console.log(items.map((x: any) => x.name));

  if (items.length == 0) {
    bot.chat("No food in my inventory.");
    return;
  }

  try {
    bot.chat("eating" + items[0].name);
    await bot.equip(items[0], 'hand')
  } catch (err: any) {
    return bot.chat(err.message)
  }

  try {
    await bot.consume()
  } catch (err: any) {
    return bot.chat(err.message)
  }
}


bot.on('error', (err: any) => console.log('Error:', err));
bot.on('kicked', (reason: any) => console.log('Kicked:', reason));
