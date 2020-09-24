const fs = require("fs");

const content = loadContent();
let battles = {};

module.exports = {
    createBattle: function(type,channel,opponents) {
        if(battles[channel] != undefined) {
            throw Error("Battle already exists!");
        }

        battles[channel] = {
            "type":type,
            "opponents":opponents, 
            "turn":0,
            "side":0,
            "player":opponents[0][0]
        };
    },

    getBattles: function(battleType) {
        let filteredBattles = {};
        if(battleType != undefined) {
            for (let val in battles) {
                console.log(battles[val].type, battleType);
                if(battles[val].type == battleType) {
                    filteredBattles[val] = battles[val];
                    console.log(filteredBattles);
                }
            }
            return filteredBattles;
        } else {
            return battles;
        }
    }
}

module.exports.commands = {
    forceEnd: {
        op:true,
        execute: function(msg, id, commands) {
            delete battles[id];
            msg.channel.send("force-ended battle")
        }
    },

    attack: {
        op:false,
        execute: function(msg, id, commands) {
            let opponentSide = getOpponentSide(battles[id].side);
            let result = [];

            if(id == battles[id].gamestate.player) {
                if(battles[id].opponents[opponentSide].length > 1) {
                    //let opponent = chooseOpponent(battles[id].opponents[enemySide(battles[id].gamestate.side)], msg);
                    if(commands[1] != undefined) {
                        commands[1] = commands[1].match(/(?<=<@)\d+/);
                        if(commands[1]) {
                            result = weaponAttack(battles[id].opponents[battles[id].side][battles[id].player], commands[1][0], ); //readable code, very yes
                        } else {
                            msg.channel.send("Please choose a valid target!");
                        }
                    } else {
                        msg.channel.send("Please choose a target!");
                    }
                } else {
                    result = weaponAttack(battles[id].opponents[battles[id].side][battles[id].player], battles[id].opponents[opponentSide][0]); //HELP ME
                }
            }

            if(result != "miss!")
        }
    }
}

module.exports.content = content;

function loadContent() {
    let game = {
        elements: readDirContents(fs.readdirSync("./game/elements"),"./game/elements/"),
        items: {
            equipment: {
                consumables: readDirContents(fs.readdirSync("./game/items/equipment/consumable"),"./game/items/equipment/consumable/"),
                weapons: readDirContents(fs.readdirSync("./game/items/equipment/weapons"),"./game/items/equipment/weapons/"),
                armor: readDirContents(fs.readdirSync("./game/items/equipment/armor"),"./game/items/equipment/armor/")
            }
        },
    }
    console.log(game);
    console.log("READY: Loaded content");
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

function weaponAttack(wep,target,player) {
    let newStats;
    switch (wep.type) {
        case "standard":
            newStats = inflictStats(wep.stats, target, player);
            if(determineHit(newStats)) {
                return newStats;
            } else {
                return false;
            }

        default:
            throw Error("Invalid weapon type!");
    }
}

function inflictStats(stats,target,player) {
    for (const stat in stats) {
        switch (stat) {
            case "APcost":
                player.stats.actionPoints -= stats.APcost;
                break;

            case "damage":
                target.stats.health -= stats.damage;
                break;

            case "accuracy":
                player.stats.hit += stats.accuracy
        
            default:
                throw Error("Invalid stat!");
        }
    }

    return [player, target];
}

function determineHit(stats) {
    stats[0].stats.hit -= stats[1].stats.evade;
    if(Math.random() < stats[0].stats.hit) {
        return true;
    } else {
        return false;
    };
}

function getOpponentSide(currentSide) {
    return Number(!currentSide)
}