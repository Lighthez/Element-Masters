const fs = require("fs");

const content = loadContent();
const c = {
    armor: content.items.equipment.armor,
    weapons: content.items.equipment.weapons,
    consumables: content.items.equipment.consumables
}

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
            "playerId":0,
            //"player":opponents[0][0][0]
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
            let player = battles[id].opponents[battles[id].side][battles[id].playerId]//battles[id].opponents[battles[id].side][battles[id].player];
            let target;
            let result;

            console.log(player);

            if(msg.author.id == player[0]) {
                if(battles[id].opponents[opponentSide].length > 1) {
                    //let opponent = chooseOpponent(battles[id].opponents[enemySide(battles[id].gamestate.side)], msg);
                    console.log(commands[1]);
                    if(commands[1] != undefined) {
                        commands[1] = commands[1].match(/(?<=<@)\d+/);
                        if(commands[1]) {
                            target = battles[id].opponents[opponentSide][commands[1][0]]
                            result = weaponAttack(player[1], target[1]); //readable code, very yes
                        } else {
                            msg.channel.send("Please choose a valid target!");
                        }
                    } else {
                        msg.channel.send("Please choose a target!");
                    }
                } else {
                    console.log(battles[id].opponents[opponentSide][0]);
                    target = battles[id].opponents[opponentSide][0]
                    result = weaponAttack(player[1], target[1]); //HELP ME
                }
            }

            console.log(result);

            if(result != "miss" && result != undefined) {
                battles[id].opponents[battles[id].side][player[0]] == result[0];
                battles[id].opponents[opponentSide][target[0]] == result[1];
                msg.channel.send("```diff\n+ " + result[2] + " Damage! +\n```");
            } else if(result == "miss") {
                msg.channel.send("```diff\n- Miss! -\n```")
            }

            if(battles[id].opponents[battles[id].side][battles[id].playerId+1] != undefined) {
                battles[id].playerId += 1;
            } else {
                battles[id].playerId = 0;
                battles[id].side = getOpponentSide(battles[id].side);
            }
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

function weaponAttack(player, target) {
    let newStats;
    switch (c.weapons[player.equipment.weapon].type) {
        case "standard":
            //account for armor, def
            newStats = calculateAttackStats(target, player);
            if(determineHit(newStats)) {
                return newStats;
            } else {
                return "miss";
            }

        default:
            throw Error("Invalid weapon type!");
    }
}

function calculateAttackStats(target,player) {
    let fullPlayer;
    let fullTarget;

    for (const armor in player.equipment.armor) {
        fullPlayer = inflictStats(c.armor[armor],target,player);
    }

    for (const armor in target.equipment.armor) {
        fullTarget = inflictStats(c.armor[armor],fullPlayer[1],fullPlayer[0])
    }

    console.log(fullPlayer, fullTarget);
    return inflictStats(c.weapons[fullTarget[0].equipment.weapon].stats, fullTarget[1], fullTarget[0]);
}

function inflictStats(stats,target,player) {
    let damage = 0;
    for (const stat in stats) {
        switch (stat) {
            case "APcost":
                player.stats.actionPoints -= stats.APcost;
                break;

            case "armor":
                player.stats.defence += stats.armor;
                break;

            case "damage":
                damage = (stats.damage + player.stats.physicalAttack) - (target.stats.defense)
                target.stats.health -= damage;
                break;

            case "accuracy":
                player.stats.hit += stats.accuracy
                break;
        
            default:
                throw Error("Invalid stat: " + stat);
        }
    }

    return [player, target, damage];
}

function determineHit(stats) {
    stats[0].stats.hit -= stats[1].stats.evade;
    if((Math.floor(Math.random() * 100) / 100) < stats[0].stats.hit) {
        return true;
    } else {
        return false;
    };
}

function getOpponentSide(currentSide) {
    return Number(!currentSide)
}