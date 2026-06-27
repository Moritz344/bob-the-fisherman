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

interface LogMessage {
  color?: string,
  level?: string,
  msg: string,
  timestamp: string
}

let bot: any;
const currentBotCommands = [
  {name: "!start",desc: "start fishing"},
  {name: "!deposit",desc: "deposit loot"},
  {name: "!show inventory",desc: "list every item with name,count and slot number"},
  {name: "!find water",desc: "find water nearby and look at it"},
  {name: "!stop",desc: "stop fishing"},
  {name: "!stop follow",desc: "stop following player"},
]

const botStartCooldown = 2000;

// colors
const resetColor = '\x1b[0m';
const red = '\x1b[31m';
const orange = '\x1b[38;5;214m';
const gray = '\x1b[90m';
const white = '\x1b[37m';


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

function getVersionSupport(version: string) {
    const supportedVersions = engine.getSupportedVersions();
    if (!supportedVersions.includes(version)) {
      return false;
    }
    return true;

}

function initBot(auth: string,username: string,port: number | string,version: string,host: string) {

    const isSupported = getVersionSupport(version);
    if (!isSupported) {
      prettyLog({
        msg: "The Version " + version + " is not supported :/",
        timestamp: engine.getLogTime(),
        color: red
      })
      return;
    }

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
      prettyLog({
        msg: err.message,
        timestamp: engine.getLogTime(),
        color: red
      });
    });

    const mcData = require('minecraft-data')(bot.version);
    engine.setBot(bot, mcData);

    bot.loadPlugin(pathfinder);

    bot.once('spawn', async() => {
      prettyLog({
        msg: "Bot spawned on " + host,
        timestamp: engine.getLogTime(),
        color: white
      });
      setTimeout( () => {
        engine.setBotReady(true);
      },botStartCooldown);
    })


    bot.on("end",() => {
      prettyLog({
        msg: "Bot stopped",
        timestamp: engine.getLogTime(),
        color: red
      });
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
      } else if (message == "!deposit") {
        engine.depositLoot();
      } else if (message.startsWith("!") && !currentBotCommands.includes(message)) {
        prettyLog({
          msg: "No such command found",
          timestamp: engine.getLogTime(),
          level: "error",
        })
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

function prettyLog(logMsg: LogMessage) {
  const colorMap: Record<string,string> = { loot: white,info: white, warn: orange, error: red };
  const color = logMsg.color || colorMap[logMsg.level || 'info'] || gray;
  const logString = gray + logMsg.timestamp + resetColor + " " + color + logMsg.msg + resetColor;
  console.log(logString);
}

engine.setLogFn(prettyLog);
