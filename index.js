const Discord = require('discord.js');
const fs = require('fs');

let game = {};
game = require("./game/game.js");
game.content = loadContent();

const util = {
    parseCommand: require('./util/parseCommand.js'),
    embeds: require('./util/embeds.js'),
}

const database = require('./database.js');
//const config = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));
const config = require("./config/config.json"); 
const token = fs.readFileSync("./config/token.txt", "utf8");

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`READY: Connected to discord as: ${client.user.tag}`);
});

client.on('message', async msg => {
  if (msg.author.bot != true) {
    if(database.isConnected()){
        let battles = game.getBattles();
        let battleMode = false;
        for (const id in battles) {
            if(msg.channel.id == id) {
                battleMode = true;
                if(msg.content.slice(0,config.battlePrefix.length) == config.battlePrefix) {
                    battleChannelHandler(msg,id);
                }
                break;
            }
        }

        if(msg.content.slice(0,config.prefix.length) == config.prefix || !battleMode) {
            messageHandler(msg);
        }
        console.log(battles);
    } else {
        utils.embeds.errorMessage(msg, "Cannot connect to database, please try again later.");
    }
  }
});

process.on('exit', function(code) {
    console.log("bye-onara!", code);
});

client.login(token);

async function battleChannelHandler(msg,id) {
    let command = util.parseCommand(msg.content, config.battlePrefix);
    let op = await database.accounts.isOp(msg.author.id);

    if(game.commands[command[0]] != undefined) {
        if((game.commands[command[0]].op && op) || (game.commands[command[0]].op != true)) {
            game.commands[command[0]].execute(msg,id);
        } else {
            util.embeds.accessMessage(msg);
        }
    }
}

async function messageHandler(msg) {
    let command = util.parseCommand(msg.content, config.prefix);
    let commandPath = `./commands/${command[0]}.js`;

    fs.access(commandPath, async (err) => {
        if(!err) {
            let op = await database.accounts.isOp(msg.author.id);
            let commandObject = require(commandPath);

            let arguments = command.splice(1);
            //console.log(arguments, rawArguments);
            let context = {arguments, msg, util, config, database, game, op};

            if(arguments[0] == "" || (Object.keys(commandObject).length == 1 && Object.keys(commandObject)[0] == "default")){
                executeCommand(msg,commandObject,"default",context,op);
            } else {
                for (let i = 0; i < Object.keys(commandObject).length; i++) {
                    if(commandObject[arguments[0]] != undefined) {
                        executeCommand(msg,commandObject,arguments[0],context,op);
                        break;
                    }
                }
            }
        } 
    });
}

function loadContent() {
    let game = {
        elements: readDirContents(fs.readdirSync("./game/elements"),"./game/elements/"),
        items: {
            consumables: readDirContents(fs.readdirSync("./game/items/consumable"),"./game/items/consumable/"),
            equipment: readDirContents(fs.readdirSync("./game/items/equipment"), "./game/items/equipment/")
        },
    }
    console.log("READY: Loaded content")
    return game;
}

function readDirContents(dirContents,dirPath) {
    let dir = {};
    for (let i = 0; i < dirContents.length; i++) {
        let file = fs.readFileSync(dirPath+dirContents[i], "utf-8");
        let name = dirContents[i].replace(".json","");
        file = JSON.parse(file);
        dir[name] = file;
    }
    return dir;
}

function executeCommand(msg,commandObject,argument,context,op) {
    if((commandObject[argument].op && op) || (commandObject[argument].op == false)) {
        try{commandObject[argument].execute(context);} catch (err) {util.embeds.errorMessage(msg, err);}
    } else {
        util.embeds.accessMessage(msg);
    }
}
