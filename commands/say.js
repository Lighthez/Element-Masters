module.exports = {
    default: {
        op:false,
        description:"placeholder text",
        execute: function(context) {
            let text = context.arguments.join(" ").replace(/@+/g, "(at)");
            if(text == "h") {
                context.msg.channel.send("stop");
            } else {
                context.msg.channel.send(text)
            }
            
        }
    }
}