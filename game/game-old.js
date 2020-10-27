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
        
        /*
        let appliedStatsArray;

        for (const side in opponents) {
            for (const opponent in opponents[side]) {
                console.log(opponent, side);
                for (const armor in opponents[side][opponent][1].equipment.armor) {
                    appliedStatsArray = inflictStats(opponents[side][opponent][1].equipment.armor[armor].stats, opponents[side][opponent][1]);
                    opponents[side][opponent][1] = appliedStatsArray[0];
                }
                appliedStatsArray = inflictStats(opponents[side][opponent][1].equipment.weapon.stats, opponents[side][opponent][1]);
                opponents[side][opponent][1] = appliedStatsArray[0];
            }
        }
        */

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

            if(msg.author.id == player[0]) {
                let playersArray = selectTarget(id,player,commands[1],opponentSide);
                result = weaponAttack(playersArray[0], playersArray[1]);

                console.log(result);

                if(typeof(result) == "object") {
                    battles[id].opponents[battles[id].side][playersArray[0]] == result[0];
                    battles[id].opponents[opponentSide][playersArray[1]] == result[1];
                    if(result[1].stats.health <= 0) {
msg.channel.send(`\`\`\`ini
[Element Masters! ALPHA]
> ${result[2]} Damage!
> DOWN!
[ ${result[0].stats.actionPoints} / ${result[0].stats.maxActionPoints} ] AP [ ${result[0].stats.magic} / ${result[0].stats.maxMagic} ] MP
[ ${result[0].stats.health} / ${result[0].stats.maxHealth} ] HP
\`\`\``);
                        if(checkForWipe(id,msg)) {return;}
                    } else {
                    msg.channel.send(`\`\`\`ini
[Element Masters! ALPHA]
> ${result[2]} Damage!
> ${result[1].stats.health} / ${result[1].stats.maxHealth} Enemy HP
[ ${result[0].stats.actionPoints} / ${result[0].stats.maxActionPoints} ] AP [ ${result[0].stats.magic} / ${result[0].stats.maxMagic} ] MP
[ ${result[0].stats.health} / ${result[0].stats.maxHealth} ] HP
\`\`\``);
                    }
                } else if(result == "miss") {
                    msg.channel.send("```diff\n- Miss! -\n```");
                } else if(result == false) {
                    msg.channel.send("Not enough ap for this attack!");
                }

                if(player[1].stats.actionPoints == 0) {
                    cycleTurn(id,msg);
                }
            }
        }
    },

    magic: {
        op:false,
        execute: function(msg,id,commands) {
            let opponentSide = getOpponentSide(battles[id].side);
            let player = battles[id].opponents[battles[id].side][battles[id].playerId];
            let target;
            let result;

            if(msg.author.id == battles[id].playerId) {
                for (const skill in player.skills) {
                    if(skill.itemName == commands[1]) {
                        result = skillMagic(id,player,player.skills[skill],commands);
                        target = result[1];
                        result = result[0];
                        break;
                    }
                }
                
                if(result == undefined) {
                    msg.channel.send("Please choose a valid skill!");
                }

                attackReport(id,msg,result,player,target)
            }

            console.log(result);
        }
    },

    turn: {
        op:false,
        execute: function(msg, id, commands){
            cycleTurn(id,msg);
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

function selectTarget(id,player,ping,opponentSide) {
    if(battles[id].opponents[opponentSide].length > 1) {
        if(ping != (undefined || "")) {
            ping = ping.match(/(?<=<@!)\d+/);
            if(ping != null) {
                for (const item in battles[id].opponents[opponentSide]) {
                    if(battles[id].opponents[opponentSide][item][0] == ping[0]) {
                        target = battles[id].opponents[opponentSide][item]
                        return [player[1], target[1]];
                    }
                }
                if(target == undefined) {
                    msg.channel.send("Please choose a valid target!");
                }
            } else {
                msg.channel.send("Please choose a valid target!");
            }
        } else {
            msg.channel.send("Please choose a target!");
        }
    } else {
        target = battles[id].opponents[opponentSide][0]
        return [player[1], target[1]]; 
    }
}

function attackReport(id,msg,result,player,target) {
    /*
    if(typeof(result) == "object") {
        battles[id].opponents[battles[id].side][player[0]] == result[0];
        battles[id].opponents[opponentSide][target[0]] == result[1];
        if(result[1].stats.health <= 0) {
msg.channel.send(`\`\`\`ini
[Element Masters! ALPHA]
> ${result[2]} Damage!
> DOWN!
[ ${result[0].stats.actionPoints} / ${result[0].stats.maxActionPoints} ] AP [ ${result[0].stats.magic} / ${result[0].stats.maxMagic} ] MP
[ ${result[0].stats.health} / ${result[0].stats.maxHealth} ] HP
\`\`\``);
            if(checkForWipe(id,msg)) {return;}
        } else {
        msg.channel.send(`\`\`\`ini
[Element Masters! ALPHA]
> ${result[2]} Damage!
> ${result[1].stats.health} / ${result[1].stats.maxHealth} Enemy HP
[ ${result[0].stats.actionPoints} / ${result[0].stats.maxActionPoints} ] AP [ ${result[0].stats.magic} / ${result[0].stats.maxMagic} ] MP
[ ${result[0].stats.health} / ${result[0].stats.maxHealth} ] HP
\`\`\``);
        }
    } else if(result == "miss") {
        msg.channel.send("```diff\n- Miss! -\n```");
    } else if(result == false) {
        msg.channel.send("Not enough ap for this attack!");
    }*/
    /*
    if(typeof(result) == "object")) {

    }

    if(Array.isArray(target))
    */
    if(player[1].stats.actionPoints == 0) {
        cycleTurn(id,msg);
    }
}

function weaponAttack(player, target) {
    if(checkCosts(player, player.equipment.weapon.stats)) {return false;}
    let newStats;

    //todo: crits
    switch (player.equipment.weapon.type) {
        case "standard":
            newStats = inflictStats(player.equipment.weapon.stats, player, target);
            console.log(newStats);
            return determineHit(newStats);

        default:
            throw Error("Invalid weapon type: " + player.equipment.weapon.type);
    }
}

function skillMagic(id,player,skill,commands) {
    if(checkCosts(player, player.skills[skill])) {return false;}
    let target
    let newStats;

    switch (skill.target) {
        case "enemy":
            target = selectTarget(id,player,commands[2],getOpponentSide(battles[id].side));
            newStats = inflictStats(skill.stats,player,target[1]);
            return [determineHit(newStats),target[1]];
    
        default:
            break;
    }

    return false;
}

function checkCosts(player,path) {
    if(path["APcost"] != undefined) {
        if((player.stats.actionPoints - path["APcost"]) < 0) {
            return true;
        } 
    } else if (path["MPcost"] != undefined) {
        if((player.stats.magic - path["MPcost"]) < 0) {
            return true;
        } 
    }
}

function inflictStats(stats,player,target) {
    //these stats get applied to passive stats every turn FIXME nao
    if(stats == undefined) {throw Error("No stats provided!")}
    if(target == undefined) {target = player}

    let damage = 0;

    for (const stat in stats) {
        switch (stat) {
            case "APcost":
                //console.log(player.stats.actionPoints);
                player.stats.actionPoints -= stats.APcost;
                break;

            case "damage":
                damage = (stats.damage + player.stats.physicalAttack) - (target.stats.defence);
                target.stats.health -= damage;
                break;

            case "armor":
                player.stats.defence += stats.armor;
                break;

            case "accuracy":
                player.stats.hit += stats.accuracy;
                break;

            case "evade":
                /*
                if(Math.sign(player.stats.evade + stats.evade) != -1) {
                    player.stats.evade += stats.evade;
                } else if (Math.sign(player.stats.evade + stats.evade) == -1) {
                    player.stat.evade = 0;
                }*/
                player.stats.evade += stats.evade;
                break;
        }
    }
    return [player, target, damage];
}

function determineHit(stats) {
    let hitChance = stats[0].stats.hit - stats[1].stats.evade;
    //console.log("hitchance: " + hitChance)
    if((Math.floor(Math.random() * 100) / 100) < hitChance) {
        return stats;
    } else {
        return "miss";
    };
}

function cycleTurn(id,msg) {
    if(checkForWipe(id)){return;}
  
    if(battles[id].opponents[battles[id].side][battles[id].playerId+1] != undefined) {
        battles[id].playerId += 1;
    } else {
        battles[id].playerId = 0;
        battles[id].side = getOpponentSide(battles[id].side);

        for (const item in battles[id].opponents[battles[id].side]) {
            //console.log(battles[id].opponents[battles[id].side][item][1]);
            battles[id].opponents[battles[id].side][item][1].stats = tickStats(battles[id].opponents[battles[id].side][item][1].stats);
        }
    }
    msg.channel.send("<@" + battles[id].opponents[battles[id].side][battles[id].playerId][0] + ">'s turn!");
}

function tickStats(stats) {
    for (const stat in stats) {
        switch (stat) {
            case "actionRegen":
                if((stats.actionPoints + stats.actionRegen) > stats.maxActionPoints) {
                    stats.actionPoints = stats.maxActionPoints;
                } else {
                    stats.actionPoints += stats.actionRegen;
                }
                break;

            case "magicRegen":
                if((stats.magic + stats.magicRegen) > stats.maxMagic) {
                    stats.magic = stats.maxMagic;
                } else {
                    stats.magic += stats.magicRegen;
                }
                break;
        }
    }

    return stats;
}

function victory(id,msg,side) {
    //wip
    let victors = battles[id].opponents[side];
    victors.forEach(element => {
        let theId = element[0]
        element = `<@${theId}>`
    });
    delete battles[id];
    msg.channel.send(victors.join(" and ") + " Won!");
}

function checkForWipe(id,msg) {
    let downed = 0;
    for (let i = 0; i < battles[id].opponents[getOpponentSide(battles[id].side)].length; i++) {
        //console.log(battles[id].opponents[getOpponentSide(battles[id].side)][i]);
        if(battles[id].opponents[getOpponentSide(battles[id].side)][i][1].stats.health <= 0) {
            downed++;
        }
    }

    if(battles[id].opponents[getOpponentSide(battles[id].side)].length == downed) {
        victory(id,msg,battles[id].side);
        return true;
    } else {
        return false;
    }
}

function getOpponentSide(currentSide) {
    return Number(!currentSide)
}