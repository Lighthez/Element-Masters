module.exports = {
    default: {
        op:false,
        description:"placeholder text",
        execute: function(context) {
            let text = context.rawArguments.replace(/@everyone/g, "(at)everyone");
            text = context.rawArguments.replace(/@here/g, "(at)here");
            context.msg.channel.send("**BANNED**: "+ text)
        }
    }
}