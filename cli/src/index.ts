import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const engine = require("../../bot-engine.cjs");
const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder;
import { Command } from 'commander';
import fs from 'fs';
import os from 'os';
import toml from 'toml';
import { resolve } from "path";
import path from 'path';
import type { BotCommand, LogMessage, Profile } from './utils/types.ts';

const program = new Command();
const pkg = JSON.parse(fs.readFileSync(path.join(resolve(import.meta.dirname, "../package.json")), "utf-8"));

let bot: any;
let currentBotCommands: BotCommand[] = [];
const botStartCooldown = 2000;
let botProfiles: Profile[] = [];
let config: any;

const profileExample: Profile[] = [{ name: "main", auth: "microsoft", username: "example_bot_name", version: "1.18.2", host: "localhost", port: 43863 }];

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
    .command("profile")
    .argument("<name>")
    .action((name: string) => {
      initBotWithProfile(name);
    })
    .description("start bot with a profile")


  program
    .command("commands")
    .description("available ingame commands")
    .action( () => {
      showHelp();
    })

  program.parse(process.argv);

}

function main() {
  loadConfigFile();
  initCommands();
  HandleCommands();
  engine.setLogFn(prettyLog);

}
main();

function initCommands() {
  currentBotCommands = engine.getCommands();
}


function printAsciiArt(username: string) {
    if (!username) {
      return;
    }
    const asciiArt = fs.readFileSync(path.join(__dirname,"./utils/ascii.txt"),"utf-8");
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

function initProfiles() {
  try {
    const rawProfilesFile = fs.readFileSync(path.join(__dirname, "profiles.json"), "utf-8");
    botProfiles = JSON.parse(rawProfilesFile);
  } catch (error: any) {
   if (error.code === 'ENOENT') {
    fs.writeFileSync(path.join(__dirname, "profiles.json"),JSON.stringify(profileExample,null,2));
   } else if (error instanceof SyntaxError) {
     console.error("profiles.json has invalid JSON");
   } else {
     throw error;
   }

  }
}

function initBotWithProfile(name: string) {
  initProfiles();
  if (!botProfiles) {
    prettyLog({
      msg: "Couldn't load profile",
      timestamp: engine.getLogTime(),
      color: red
    })
    return;
  }

  const botProfile = botProfiles.find((profile: any) => profile.name == name);
  if (!botProfile) {
    prettyLog({
      msg: "Profile '" + name + "' not found",
      timestamp: engine.getLogTime(),
      color: red
    })
    return;
  }

  initBot(botProfile.auth,botProfile.username,botProfile.port ?? 0,botProfile.version,botProfile.host)

}

function initBot(auth: string,username: string,port: number | string,version: string,host: string) {
    const isSupported = getVersionSupport(version);
    if (!isSupported) {
      prettyLog({
        msg: "The Version " + version + " is not supported",
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
      if (err.message.length > 0) {
        prettyLog({
          msg: err.message,
          timestamp: engine.getLogTime(),
          color: red
        });
      }
    });

    const mcData = require('minecraft-data')(bot.version);
    engine.setBot(bot, mcData);

    bot.loadPlugin(pathfinder);

    bot.once('spawn', () => {
      prettyLog({
        msg: "Bot spawned on " + host,
        timestamp: engine.getLogTime(),
        color: white
      });
      setTimeout( async() => {
        engine.setBotReady(true);
        if (config.general.auto_fish_on_start) {
          await engine.startFishing();
        }
      },botStartCooldown);
    })

    bot.on("death",() => {
      prettyLog({
        msg: "Bot died",
        timestamp: engine.getLogTime(),
        color: red
      })
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
      handleWhisper(message);
    });

}


async function handleWhisper(message: any){
    if (message == "!start") {
       await engine.startFishing()
    } else if (message == "!stop") {
      // TODO: use stopCurrentTask 
      const isFishing = engine.getIsFishing();
      const isFollowingPlayer = engine.getIsFollowingPlayer();
      if (isFishing) {
        engine.stopFishing();
      } else if (isFollowingPlayer) {
        engine.stopFollowingPlayer();
      }
    } else if (message == "!eat") {
        await engine.eat();
    } else if (message.includes("!follow")) {
      const msg = message.split(" ");
      if (msg.length >= 2) {
        const playerToFollow = msg[1].trim("");
        engine.followPlayer(playerToFollow);
      }
    } else if (message == "!find water") {
      await engine.checkForWaterNearby();
    } else if (message == "!show inventory") {
      showInventory();
    } else if (message == "!help") {
      showHelp();
    } else if (message == "!deposit") {
      await engine.depositLoot();
    } else if (message.startsWith("!drop")) {
      const itemToDrop = message.split(" ")[1];
      await engine.dropItem(itemToDrop);

    } else if (message.startsWith("!") && !currentBotCommands.some(cmd => cmd.name === message)) {
      prettyLog({
        msg: "Command '" + message + "' not found",
        timestamp: engine.getLogTime(),
        level: "error",
      })
    }

}

function showHelp() {
  currentBotCommands.forEach( (command: BotCommand) => {
    console.log(command.name + " - " + command.desc);
  });
}

async function loadConfigFile() {
  const defaultConfigPath = os.homedir() + "/.config/bob-the-fisherman-cli/config.toml";
  const file = Bun.file(defaultConfigPath);
  const fileExists = await file.exists();

  if (!fileExists) {
    await Bun.write(defaultConfigPath, Bun.file(resolve(import.meta.dirname, "./config.toml")));
  }

  try {
    const text = await Bun.file(defaultConfigPath).text();
    config = toml.parse(text);

    const botFishingCooldown = config.general.fishing_cooldown;

    if (botFishingCooldown) {
      engine.setBotFishingCooldown(botFishingCooldown);
    }

  } catch (error: any) {
    prettyLog({
      msg: error.message || "Error loading config file",
      timestamp: engine.getLogTime(),
      color: red
    });

  }


}

function showInventory() {
    const items = bot.inventory.slots
      .filter( (x: any) => x != null).map( (x: any) => ({ slot: x.slot,count: x.count,name: x.displayName}));

    if (items.length == 0) {
      prettyLog({
        msg: "No items in my inventory",
        timestamp: engine.getLogTime(),
        color: red
      })
      return;
    }

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

