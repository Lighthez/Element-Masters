module.exports = {
    default: {
        op:false,
        description:"General information about the bot.",
        execute: function(context) {
            let message = `${context.config.version}`
            if(context.op) {message += "\nYou're an op!"}
            context.msg.channel.send(message);
        }
    }
}