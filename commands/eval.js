module.exports = {
    default: {
        op:false,
        description:"Evaluate javascript server side",
        execute: function(context) {
            console.log(context.rawArguments)
            eval(context.rawArguments);
        }
    }
}