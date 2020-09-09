const Discord = require('discord.js');
const fs = require('fs');

const accounts = require('./accounts.js');
const parseArguments = require('./util/parseArguments.js');

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
                    console.log(op);
                    let commandObject = require(commandPath);

                    let arguments = parseArguments(rawArguments);
                    let context = {arguments, rawArguments, msg, accounts, config, op};
                    console.log(arguments)

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
        errorMessage(msg, "Cannot connect to database, please try again later.");
    }
  }
});

client.login(token);

function errorMessage(msg, err) {
    const embed = new Discord.MessageEmbed()
        .setTitle('An internal error occurred!')
        .setColor(0xff0000)
        .setDescription(err)
    msg.channel.send(embed);
}

function accessMessage(msg) {
    const embed = new Discord.MessageEmbed()
        .setTitle('Access denied.')
        .setColor(0xffff00)
        .setDescription('Your access level is insufficient for this operation')
    msg.channel.send(embed);
}

function executeCommand(msg,commandObject,argument,context,op) {
    if(commandObject[argument].op && op) {
        try{commandObject[argument].execute(context);} catch (err) {errorMessage(msg, err);}
    } else if(commandObject[argument].op == false) {
        try{commandObject[argument].execute(context);} catch (err) {errorMessage(msg, err);}
    } else {
        accessMessage(msg);
    }
}
