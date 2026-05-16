const mineflayer = require('mineflayer')
//https://www.youtube.com/watch?v=ltWosy4Z0Kw
//43763

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 42447,
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

}

async function startFishing() {
  console.log("Fishing!");
  try {
    await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
    console.log("fishing rod:",bot.registry.itemsByName.fishing_rod.id)
  } catch (err: any) {
    return bot.chat(err.message)
  }
}



bot.on('error', (err: any) => console.log('Error:', err));
bot.on('kicked', (reason: any) => console.log('Kicked:', reason));
