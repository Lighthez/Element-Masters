const fs = require("fs");

module.exports = {
    default: {
        op:false,
        description:"wait what?",
        execute: function(context) {
            context.msg.channel.send("```\n>>> cmds >>>\n" + fs.readdirSync("./commands").join("\n") + "```");

        }
    }
}