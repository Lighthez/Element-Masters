const Discord = require('discord.js');
const fs = require('fs');

const game = loadContent();
console.log(game);

const util = {
    parseArguments: require('./util/parseArguments.js'),
    embeds: require('./util/embeds.js'),
}

const accounts = require('./database.js');
const { dir } = require('console');
const config = JSON.parse(fs.readFileSync("./config/config.json", "utf8")); 
const token = fs.readFileSync("./config/token.txt", "utf8");

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`READY: Connected to discord as: ${client.user.tag}`);
});

client.on('message', msg => {
  if (msg.author.bot != true) {
    if(accounts.isConnected()){
        if(msg.content.slice(0,config.prefix.length) == config.prefix) {
            let rawMsg = msg.content.slice(config.prefix.length);
            let command = rawMsg.split(" ")[0]
            let commandPath = `./commands/${command}.js`;

            let rawArguments = rawMsg.split(" ");
            rawArguments.shift();
            rawArguments = rawArguments.join(" ");

            fs.access(commandPath, async (err) => {
                if(!err) {
                    let op = await accounts.isOp(msg.author.id);
                    //console.log(op);
                    let commandObject = require(commandPath);

                    let arguments = util.parseArguments(rawArguments);
                    let context = {arguments, rawArguments, msg, util, config, accounts, game, op};
                    //console.log(arguments)

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
    } else {
        utils.embeds.errorMessage(msg, "Cannot connect to database, please try again later.");
    }
  }
});

process.on('exit', function(code) {
    
});

client.login(token);

function loadContent() {
    let game = {
        elements: readDirContents(fs.readdirSync("./game/elements"),"./game/elements/"),
        items: {
            consumables: readDirContents(fs.readdirSync("./game/items/consumable"),"./game/items/consumable/"),
            equipment: readDirContents(fs.readdirSync("./game/items/equipment"), "./game/items/equipment/")
        },
    }
    return game;
}

function readDirContents(dirContents,dirPath) {
    let dir = {};
    for (let i = 0; i < dirContents.length; i++) {
        fs.readFile(dirPath+dirContents[i], "utf8", (err, data)=>{
            if(err) throw err;
            let name = dirContents[i].replace(".json","");
            data = JSON.parse(data);
            dir[name] = data;
        })
    }
    return dir;
}

function executeCommand(msg,commandObject,argument,context,op) {
    if(commandObject[argument].op && op) {
        try{commandObject[argument].execute(context);} catch (err) {util.embeds.errorMessage(msg, err);}
    } else if(commandObject[argument].op == false) {
        try{commandObject[argument].execute(context);} catch (err) {util.embeds.errorMessage(msg, err);}
    } else {
        util.embeds.accessMessage(msg);
    }
}
