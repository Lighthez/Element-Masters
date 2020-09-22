module.exports = {
    default: {
        op:false,
        description:"placeholder text",
        execute: function(context) {
            context.msg.delete();
            let text = context.arguments.join(" ").replace(/@+/g, "(at)");
            if(text == "h") {
                context.msg.channel.send("stop");
            } else {
                context.msg.channel.send(text)
            }
            
        }
    }
}