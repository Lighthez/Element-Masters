module.exports = {
    pvp: {
        op:false,
        description:"fight. fight. fight. fight.",
        execute: function(context) {
            context.msg.channel.send("haha no.")
        }
    },

    default: {
        op:false,
        description:"placeholder text",
        execute: function(context) {
            context.msg.channel.send("do e>battle pvp instead, for now.")
        }
    },

    op: {
        op:true,
        description:"Debug commands.",
        execute: async function(context) {
            switch (context.arguments[1]) {
                case "create":
                    let players = [{},{}];
                    let side = 0;
                    for (let i = 4; i < context.arguments.length; i++) {
                        if(context.arguments[i] == "vs"){
                            side++
                            continue;
                        }
                        let account = await context.database.accounts.getAccount(context.arguments[i]);
                        players[side][context.arguments[i]] = account.character;
                    }

                    console.log(players);
                    if(players.length == 0 || players.length > 6) {
                        context.util.embeds.errorMessage(context.msg, "Invalid playercount!");
                    } else {
                        //context.database.battles.createBattle(context.arguments[2], context.arguments[3], players);
                        context.game.createBattle(context.arguments[2], context.arguments[3], players);
                    }
                    break;
            
                default:
                    break;
            }
        }
    }
}