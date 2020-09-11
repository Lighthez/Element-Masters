module.exports = {
     default: {
          op:false,
          description:"hi",
          execute: async function(context) {
               context.msg.channel.send("something something placeholder");
          }
     },

     register: {
          op:false,
          description:"register an account",
          execute: async function(context) {
               if(await context.database.accounts.accountExists(context.msg.author.id) == false) {
                    //account creation dialog goes here
                    await context.database.accounts.createAccount(context.msg.author.id);
                    context.msg.channel.send("Thank you for testing Element Masters!");
               } else {
                    context.msg.channel.send("You already have an account!");
               }

          }
     },

     op: {
          op:true,
          description:"op stuff, you would know.",
          execute: async function(context) {
               switch (context.arguments[1]) {
                    case "delete":
                         await context.database.accounts.deleteAccount(context.arguments[2]);
                         context.msg.channel.send("gone.");
                         break;
               
                    default:
                         break;
               }
          }
     }
}