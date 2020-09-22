module.exports = {
    default: {
        op:false,
        description:"placeholder text",
        execute: function(context) {
            let text = context.arguments.join(" ").replace(/@everyone/g, "(at)everyone");
            text = text.replace(/@here/g, "(at)here");
            context.msg.channel.send("**BANNED**: "+ text);
        }
    }
}