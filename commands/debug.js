module.exports = {
    dumpWeapon: {
        op:true,
        description:"placeholder text",
        execute: async function(context) {
            if(context.game.content.items.equipment.weapons[context.arguments[1]] != undefined) {
                context.msg.channel.send("```json\n" + JSON.stringify(context.game.content.items.equipment.weapons[context.arguments[1]], null, 4) + "\n```")
            } else {
                context.msg.channel.send("invalid content")
            }
        }
    },
}