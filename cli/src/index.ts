const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalFollow } = require('mineflayer-pathfinder').goals;
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const program = new Command();
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"));

let bot: any;
let mcData: any;
const currentBotCommands = [
  {name: "!start",desc: "start fishing"},
  {name: "!show inventory",desc: "list every item with name,count and slot number"},
  {name: "!find water",desc: "find water nearby and look at it"},
  {name: "!stop",desc: "stop fishing"},
  {name: "!stop follow",desc: "stop following player"},
]

const botStartCooldown = 2000;
let botReady = false;

// colors
const resetColor = '\x1b[0m';
const red = '\x1b[31m';
const gray = '\x1b[90m';

function HandleCommands() {
  program
    .name("bob-fisher-cli")
    .description("minecraft bot for afk fishing")
    .version(pkg.version)

  program
    .command("start")
    .argument('<auth>')
    .argument('<username>')
    .argument('[port]','port default 25565')
    .argument('<version>')
    .argument('<host>')
    .action( (auth,username,port,version,host) => {
      initBot(auth,username,port || '',version,host);
    })
    .description("start bot")


  program
    .command("commands")
    .description("available ingame commands")
    .action( () => {
      showHelp();
    })

  program.parse(process.argv);

}
HandleCommands();

function printAsciiArt(username: string) {
    if (!username) {
      return;
    }
    const asciiArt = fs.readFileSync(path.join(__dirname,"./ascii.txt"),"utf-8");
    const ascii = `
    ${asciiArt}
    Whisper me with /msg ${username}
  `
  console.log(ascii);
}


function initBot(auth: string,username: string,port: number | string,version: string,host: string) {
    printAsciiArt(username);
    bot = mineflayer.createBot({
      host,
      port,
      auth,
      username,
      version:version,
      hideErrors: true
    });

    bot.on('error', (err: any) => {
      if (err.code == 'ECONNREFUSED') {
        prettyLog( red + "ERROR: Port " + port + " on "  + host + " not found" + resetColor);
      } else if (err.code == 'ENOTFOUND') {
        prettyLog(red + "ERROR: Server " + host + " not found" + resetColor);
      } else if (err.code == 'ETIMEDOUT') {
        prettyLog(red + "ERROR: Server unreachable" + resetColor);
      } else if (err.code == 'ECONNRESET') {
        prettyLog(red + "ERROR: Connection was killed" + resetColor)
      } else if (err.code == 'EHOSTUNREACH') {
        prettyLog(red + "ERROR: No route to host" + resetColor);
      } else if (err.code == 'EAI_AGAIN') {
        prettyLog(red + 'ERROR: DNS temporary failure' + resetColor)
      } else if (err.code == 'EPIPE') {
        prettyLog(red + 'ERROR: Wrote to a closed connection' + resetColor)
      } else if (err.code == 'ERR_SOCKET_BAD_PORT') {
        prettyLog(red + "ERROR: Bad port " + port + resetColor);
      } else {
        prettyLog(red + "ERROR: unexpected error: " + err.code + resetColor);
      }
    });

    mcData = require('minecraft-data')(bot.version);

    bot.loadPlugin(pathfinder);

    bot.once('spawn', async() => {
      prettyLog("Bot spawned on " + host );
      setTimeout( () => {
        botReady = true;
      },botStartCooldown);
    })


    bot.on("end",() => {
      prettyLog("Bot stopped");
    })


    bot.on('whisper', (username: any, message: any) => {
      if (username === bot.username) return
      if (message == "!start") {
        setTimeout( () => {
          startFishing()
        },1000);
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
        checkForWaterNearby();
      } else if (message == "!show inventory") {
        showInventory();
      } else if (message == "!help") {
        showHelp();
      }
    })

    //bot.on('kicked', (reason: any) => console.log('Kicked:', reason));

}

function showHelp() {
  currentBotCommands.forEach( (command: {name: string,desc: string}) => {
    console.log(command.name + " - " + command.desc);
  });
  console.log("");
}

function showInventory() {
    const items = bot.inventory.slots.filter( (x: any) => x != null).map( (x: any) => ({ slot: x.slot,count: x.count,name: x.displayName}));
    const Table = require('cli-table3');

    const table = new Table();
    const cols = 5;
    for (let i = 0; i < items.length; i += cols) {
      table.push(items.slice(i, i + cols).map((x: any) => ` ${x.name}\n Count: ${x.count} \n Slot: ${x.slot} `));
    }
    console.log(table.toString());


}


function stopFollowingPlayer() {
  prettyLog("Stop following player");
  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);
}

function followPlayer(playerName: string) {
  if (isFishing) {
    stopFishing();
  }
  const playerEntity = bot.nearestEntity( (e: any) => e.type == "player" && e.username == playerName);

  if (!playerEntity) {
    prettyLog("I can't find this player to follow");
    return;
  }

  prettyLog("Lead the way " + playerName + "!");
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

function getLogTime() {
  const date = new Date();
  return date.getHours().toString().padStart(2,"0") + ":" + date.getMinutes().toString().padStart(2,"0") + ":" + date.getSeconds().toString().padStart(2,"0") ;
}

function prettyLog(msg: string) {
  const logString = gray + getLogTime() + resetColor + " " + msg;
  console.log(logString);
}

async function startFishing() {
  if (!botReady) {
    prettyLog("Bot is not ready please wait a second");
    return;
  }
  if (isFishing) {
    stopFishing();
    return;
  }

  const hasRod = checkForFishingRodInInventory();
  if (!hasRod) {
    prettyLog("No fishing rod in my inventory");
    return;
  }

  const waterBlock = await checkForWaterNearby();
  if (!waterBlock) {
    return;
  }



  if (bot.food < 20) {
    prettyLog("I need to eat! Hunger: " + bot.food);
    await eat();
  }


  isFishing = true;
  bot.on("playerCollect",onCollect);

  try {
    await bot.equip(bot.registry.itemsByName.fishing_rod.id, 'hand')
    await bot.fish();
  } catch (err) {
    //prettyLog("ERROR: Something went wrong while trying to fish!");
  }
  isFishing = false;
}

function checkForFishingRodInInventory(): boolean {
  if (!bot) { return false; }

  const items = bot.inventory.slots.filter( (x: any) => x != null);
  const hasRod = items.some( (x: any) => x.name == "fishing_rod");
  return hasRod;
}


async function checkForWaterNearby(): Promise<boolean>{
  try {
    const maxDistance = 10;
    const waterBlock = await bot.findBlock({
      point: bot.entity.position,
      matching: (block: any) => block.name === 'water',
      maxDistance: maxDistance
    })
    if (!waterBlock) {
      prettyLog("No water found in distance of " + maxDistance + " blocks");
      return false;
    }
    await bot.lookAt(waterBlock.position.offset(0.5, 2, 0.5), true)
    return true;

  } catch (err) {
    console.log(err);
    return false;
  }
}

function onCollect(player: any,entity: any) {
  if (player !== bot.entity) {
    return;
  }

  if (entity.type == "orb" || entity.name == 'experience_orb') {
    return;
  }

  const slots = bot.inventory.slots.filter( (x: any) => x != null);
  const itemId = entity.metadata.at(-1).itemId;
  const item = slots.find((x: any) => x.type == itemId);
  if (!item) {
    prettyLog("Collected item not found!");
    setTimeout( () => {
      startFishing();
    },500);
    return;
  }

  bot.removeListener("playerCollect", onCollect);

  const itemCountArray = slots.filter( (x: any) => x.displayName == item.displayName).map((x: any) => x.count);
  let totalCountOfItems = 0;
  itemCountArray.forEach( (count: number) => {
    totalCountOfItems += count;
  });

  prettyLog("Caught " + item.displayName + " count: " + totalCountOfItems);

  setTimeout( () => {
    startFishing();
  },500);
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


