const Discord = require('discord.js');
const fs = require('fs');

let game = {};
game = require("./game/game.js");

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

        if(msg.content.slice(0,config.prefix.length) == config.prefix && !battleMode) {
            messageHandler(msg);
        }
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
            game.commands[command[0]].execute(msg,id,command);
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

function executeCommand(msg,commandObject,argument,context,op) {
    if((commandObject[argument].op && op) || (commandObject[argument].op == false)) {
        try{commandObject[argument].execute(context);} catch (err) {util.embeds.errorMessage(msg, err);}
    } else {
        util.embeds.accessMessage(msg);
    }
}
