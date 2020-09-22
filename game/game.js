let battles = {};

module.exports = {
    createBattle: function(type,channel,opponents) {
        if(battles[channel] != undefined) {
            throw Error("Battle already exists!");
        }

        battles[channel] = {"type":type, "opponents":opponents};
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
        execute: function(msg, id) {
            console.log(id);
            delete battles[id];
            msg.channel.send("force-ended battle")
        }
    }
}