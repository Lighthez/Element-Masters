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
    }
}