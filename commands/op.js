module.exports = {
    kill: {
        op:true,
        description:"placeholder text",
        execute: async function(context) {
            await context.msg.channel.send("aight, imma head out.");
            process.exit();
        }
    },

    eval: {
        op:true,
        description:"Evaluate javascript server side",
        execute: function(context) {
            let output;
            let text = (context.arguments.splice(1)).join(" ")
            console.log(text);
            output = eval(text);
            console.log(typeof(output));
            context.msg.channel.send("```javascript\n"+output+"\n```");
        }
    }
}