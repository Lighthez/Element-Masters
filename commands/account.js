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
               if(await context.accounts.accountExists(context.msg.author.id) == false) {
                    //account creation dialog goes here
                    context.msg.channel.send("Nomally, we'd have a nice introduction to the game right about here, but we don't have anything close to a finished product here do we?");
                    await context.accounts.createAccount(context.msg.author.id);
                    context.msg.channel.send("Account registered successfully!");
               } else {
                    context.msg.channel.send("You already have an account!");
               }

          }
     },

     opMenu: {
          op:true,
          description:"op stuff, you would know.",
          execute: async function() {
               
          }
     }
}