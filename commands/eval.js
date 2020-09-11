module.exports = {
    default: {
        op:true,
        description:"Evaluate javascript server side",
        execute: function(context) {
            let output;
            console.log(context.rawArguments)
            output = eval(context.rawArguments);
            console.log(typeof(output));
            context.msg.channel.send("```javascript\n"+output+"\n```");
        }
    }
}