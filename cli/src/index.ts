import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const engine = require("../../bot-engine.cjs");

const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder;
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const program = new Command();
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"));

let bot: any;
const currentBotCommands = [
  {name: "!start",desc: "start fishing"},
  {name: "!show inventory",desc: "list every item with name,count and slot number"},
  {name: "!find water",desc: "find water nearby and look at it"},
  {name: "!stop",desc: "stop fishing"},
  {name: "!stop follow",desc: "stop following player"},
]

const botStartCooldown = 2000;

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
      ...(port ? { port: Number(port) } : {}),
      auth,
      username,
      version:version,
      hideErrors: true
    });


    bot.on('error', (err: any) => {
      const errorMessage = engine.error(err.code,{ port,host});
      prettyLog(red + errorMessage + resetColor);
    });

    const mcData = require('minecraft-data')(bot.version);
    engine.setBot(bot, mcData);
    engine.setLootLogFn( (msg: {time: string,name: string,displayName: string,count: number,img: null }) => {
      prettyLog("Caught " + msg.displayName + "! (" + msg.count + ")");
    });

    bot.loadPlugin(pathfinder);

    bot.once('spawn', async() => {
      prettyLog("Bot spawned on " + host );
      setTimeout( () => {
        engine.setBotReady(true);
      },botStartCooldown);
    })


    bot.on("end",(reason: any) => {
      prettyLog("Bot stopped");
    })


    bot.on('whisper', (username: any, message: any) => {
      if (username === bot.username) return
      if (message == "!start") {
        setTimeout( () => {
          engine.startFishing()
        },1000);
      } else if (message == "!stop") {
        engine.stopFishing();
      } else if (message == "!eat") {
        setTimeout( () => {
        engine.eat();
        },500);
      } else if (message.includes("!follow")) {
        const msg = message.split(" ");
        if (msg.length >= 2) {
          const playerToFollow = msg[1].trim("");
          engine.followPlayer(playerToFollow);
        }
      } else if (message == "!stop follow") {
        engine.stopFollowingPlayer();
      } else if (message == "!find water") {
        engine.checkForWaterNearby();
      } else if (message == "!show inventory") {
        showInventory();
      } else if (message == "!help") {
        showHelp();
      }
    })

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

function prettyLog(msg: string) {
  const logString = gray + engine.getLogTime() + resetColor + " " + msg;
  console.log(logString);
}

engine.setLogFn(prettyLog);
