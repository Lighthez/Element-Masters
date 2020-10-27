const fs = require("fs");

const content = loadContent();
const c = {
    equipment: content.items.equipment
}

let battles = {};

module.exports = {
    createBattle: function(type,channel,opponents) {
        if(battles[channel] != undefined) {
            throw Error("Battle already exists!");
        }
        
        for (const side in opponents) {
            for (const player in opponents[side]) {
                opponents[side][player][1].equipment.weapon = getStats(opponents[side][player][1].equipment.weapon, c.equipment.weapons);
                //opponents[side][player][1] = applyPassives(opponents[side][player][1].equipment.weapon.stats.passive, opponents[side][player][1]);
                for (const armor in opponents[side][player][1].equipment.armor) {
                    opponents[side][player][1].equipment.armor[armor] = getStats(opponents[side][player][1].equipment.armor[armor], c.equipment.armor);
                    opponents[side][player][1] = applyPassives(opponents[side][player][1].equipment.armor[armor].stats.passive, opponents[side][player][1]);
                    console.log(opponents[side][player][1]);
                }
            }
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
            "player":0,
            "currentPlayer":opponents[0][0],
            //"player":opponents[0][0][0]
        };

        //battles[channel].currentPlayer = battles[channel].opponents[0][0];

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

    dumpStats: {
        op:true,
        execute: function(msg, id, commands) {
            msg.channel.send(JSON.stringify(battles[id].currentPlayer[1].stats, null, 2));
        }
    },

    dumpState: {
        op:true,
        execute: function(msg, id, commands) {
            msg.channel.send(JSON.stringify(battles[id].turn, null, 2));
        }
    },

    attack: {
        op:false,
        execute: function(msg, id, commands) {
            console.log("ATK START");
            if(msg.author.id == battles[id].opponents[battles[id].side][battles[id].player][0]) {
                let result;
                //console.log("CMDS: " + JSON.stringify(commands));
                if(commands[1] != "") {
                    ping = commands[1].match(/(?<=<@!)\d+/);
                    if(ping != null) {
                        if((battles[id].currentPlayer[1].equipment.weapon.stats.active.APcost > battles[id].currentPlayer[1].stats.actionPoints) || (battles[id].currentPlayer[1].equipment.weapon.stats.active.MPcost > battles[id].currentPlayer[1].stats.magic)){
                            msg.channel.send("Not enough AP/MP!");
                        } else {
                            for (const item in battles[id].opponents[oppositeSide(battles[id].side)]) {
                                if(battles[id].opponents[oppositeSide(battles[id].side)][item][0] == ping[0]) {

                                    result = weaponAttack(battles[id].currentPlayer[1].equipment.weapon, battles[id].currentPlayer[1], battles[id].opponents[oppositeSide(battles[id].side)][item][1]);
                                    battles[id].currentPlayer[1] = result[0];
                                    battles[id].opponents[oppositeSide(battles[id].side)][item][1] = result[1];
                                    console.log(result);
                                    resultReport(result,msg);
                                }
                            }
                        }
                    }
                } else {
                    msg.channel.send("invalid target!")
                }
            }
        }
    },

    /*
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
    */

    magic: {
        op:false,
        execute: function(msg,id,commands) {

        }
    },

    turn: {
        op:false,
        execute: function(msg, id, commands){
            console.log(battles[id].currentPlayer);
            turn(id,msg);
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

function getStats(item,path) {
    let rawItem = {};
    let stats = {
        "active":{},
        "passive":{}
    };

    if(Array.isArray(item)) {
        if(typeof item[1] == "object") {

            //beware the dangerous object referencing
            rawItem = {...path[item[0]]};
            
            for (const key in item[1]) {
                if(key == "stats") {
                    
                    if(rawItem.stats.passive != undefined){stats.passive = Object.assign({}, rawItem.stats.passive);}
                    if(rawItem.stats.active != undefined){stats.active = Object.assign({}, rawItem.stats.active);}

                    console.log(stats.passive.damage);

                    //this could probably be reduced wayyy down
                    for (const type in item[1].stats) {
                        for (const stat in item[1].stats[type]) {
                            //it's only additive damnit
                            if(rawItem.stats[type][stat] != undefined) {
                                stats[type][stat] = (rawItem.stats[type][stat] + item[1].stats[type][stat]);
                                //rawItem.stats[type][stat] = (rawItem.stats[type][stat] + item[1].stats[type][stat])
                            }
                        }
                    }

                    rawItem.stats = Object.assign({}, stats)
                    console.log(stats, rawItem);

                } else {
                    rawItem[key] = item[1][key];
                    //console.log(rawItem, path[item[0]]);
                }
            }
            return rawItem
        }
    } else {
        //might cause problems later, beware
        return path[item];
    }
}

function weaponAttack(weapon,self,target,id) {
    let result;
    let appliedStats;
    switch (weapon.type) {
        case "standard":
            appliedStats = applyActives(weapon.stats.active,self,target);
            if(determineHit(self,target)) {
                result = [...appliedStats];
            } else {
                result = [appliedStats[0],target,"miss"];
            }
            return result;
    
        default:
            break;
    }
    return result;
}

function applyPassives(stats,target) {
    for (const stat in stats) {
        switch (stat) {
            case "armor":
                target.stats.armor += stats[stat];
                break;

            case "accuracy":
                target.stats.hit += stats[stat];
                break;

            case "evade":
                target.stats.evade += stats[stat];
                break;

            case "heal":
                target.stats.health += stats[stat];
                break;
        }
    }
    return target;
}

function applyActives(stats,self,target) {
    let damage;

    for (const stat in stats) {
        switch (stat) {
            case "APcost":
                self.stats.actionPoints -= stats[stat];
                break;

            case "MPcost":
                self.stats.magic -= stats[stat];
                break;

            case "accuracy":
                self.stats.hit += stats[stat];
                break;

            case "damage":
                let percentage;
                //target.stats.health -= stats[stat];
                console.log(stats)            
                if(stats.penetration != (0 || undefined)) {
                    percentage = stats.penetration / target.stats.armor;
                    if(percentage > 1) {
                        percentage = 1;
                    }

                    console.log(percentage);

                    damage = stats[stat] * percentage;
                    damage = Math.floor(damage);
                    if(damage <= 1) {
                        damage = 0;
                    }
                } else if(target.stats.armor == 0) {
                    damage = stats[stat];
                } else {
                    damage = 0;
                }
                console.log(damage);

                target.stats.health -= damage
                break;
        }
    }

    return [self,target,damage];
}

function determineHit(self,target) {
    let chance = self.stats.hit - target.stats.evade;
    console.log(chance);
    if((Math.floor(Math.random() * 100) / 100) < chance) {
        return true;
    } else {
        return "miss";
    };
}

function resultReport(result,msg) {
    //msg.channel.send("DAMAGE:" + result[2])
    let message;
    if(result[2] == "miss") {
        message = `\`\`\`ini
[--Element masters ALPHA--]
[<<<<<<<<< MISS! >>>>>>>>>]
Enemy HP: | [${result[1].stats.health}/${result[1].stats.maxHealth}]
Your HP:  | [${result[0].stats.health}/${result[0].stats.maxHealth}]
AP: [${result[0].stats.actionPoints}/${result[0].stats.maxActionPoints}] MP [${result[0].stats.magic}/${result[0].stats.maxMagic}]
---------------------------\`\`\``
    } else if (result[2] == 0) {
        message = `\`\`\`ini
[--Element masters ALPHA--]
[<<<<<<< No damage! >>>>>>]
Enemy HP: | [${result[1].stats.health}/${result[1].stats.maxHealth}]
Your HP:  | [${result[0].stats.health}/${result[0].stats.maxHealth}]
AP: [${result[0].stats.actionPoints}/${result[0].stats.maxActionPoints}] | MP [${result[0].stats.magic}/${result[0].stats.maxMagic}]
---------------------------\`\`\``
    } else {
        message = `\`\`\`ini
[--Element masters ALPHA--]
Damage!: [${result[2]}]
Enemy HP: [${result[1].stats.health}/${result[1].stats.maxHealth}]
Your HP: [${result[0].stats.health}/${result[0].stats.maxHealth}]
AP: [${result[0].stats.actionPoints}/${result[0].stats.maxActionPoints}] MP [${result[0].stats.magic}/${result[0].stats.maxMagic}]
---------------------------\`\`\``
    }

    msg.channel.send(message);
}

function turn(id, msg) {
    let currentSide = battles[id].side;
    let currentPlayerId = battles[id].player;
    //let currentPlayer = battles[id].opponents[currentSide][currentPlayerId][1];
    
    //apply armor actives
    for (const armor in battles[id].currentPlayer[1].equipment.armor) {
        //console.log(battles[id].currentPlayer[1].equipment.armor);
        battles[id].currentPlayer[1] = applyPassives(battles[id].currentPlayer[1].equipment.armor[armor].stats.active, battles[id].currentPlayer[1]);
    }

    //remove dead player character objects
    for (const side in battles[id].opponents) {
        for (const player in battles[id].opponents[side]) {
            if(battles[id].opponents[side][player][1].stats.health <= 0) {
                delete battles[id].opponents[side][player][1];
            }
        }
    }

    //select next player
    if(battles[id].opponents[currentSide][currentPlayerId+1][1] != undefined) {
        battles[id].player++;
    } else if(battles[id].opponents[currentSide][currentPlayerId+1][1] == undefined){
        let found = false;
        
        for (let i = 0; i < battles[id].opponents[oppositeSide(currentSide)].length; i++) {
            if(battles[id].opponents[oppositeSide(currentSide)][i][1] != undefined) {
                found = true;
                battles[id].side = Number(!currentSide);
                battles[id].player = i;
            }
        }
        
        if(found == false) {
            victory(currentSide, id, msg);
        } 
    }

    //cycle currentPlayer
    battles[id].currentPlayer = battles[id].opponents[battles[id].side][battles[id].player];

    //currentplayer breaks here??

    //regenerate AP and MP
    if((battles[id].currentPlayer[1].stats.actionRegen + battles[id].currentPlayer[1].stats.actionPoints) > battles[id].currentPlayer[1].stats.maxActionPoints) {
        battles[id].currentPlayer[1].stats.actionPoints = battles[id].currentPlayer[1].stats.maxActionPoints;
    } else {
        battles[id].currentPlayer[1].stats.actionPoints += battles[id].currentPlayer[1].stats.actionRegen;
    }

    msg.channel.send("<@" + battles[id].currentPlayer[0] + ">'s turn!");
}

function victory(side, id, msg) {
    msg.channel.send("This is a placeholder for when victory is achieved. Congrats to the winning side, i guess.");
}

function oppositeSide(side) {
    return Number(!side);
}