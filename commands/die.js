module.exports = {
    default: {
        op:true,
        description:"placeholder text",
        execute: async function(context) {
            await context.msg.channel.send(":(");
            process.exit();
        }
    }
}