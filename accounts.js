const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

const config = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));
const client = new MongoClient(config.dbUrl, {useUnifiedTopology: true});

let db;

client.connect().then(()=>{
    console.log("READY: connected to db");
    db = client.db(config.dbName);
},(err) => {
    throw err;
});

let accounts = {
    isConnected: function () {
        return client.isConnected();
    },

    isOp: async function(id) {
        const query = await db.collection("operators").findOne({"discordId":id});
        if(query != null) {return true} else {return false}
    },

    accountExists: async function(id) {
        const query = await db.collection("users").findOne({"discordId":id});
        if(query != null) {return true} else {return false}
    },

    createAccount: async function (id,op,character,items) {
        let account = {"discordId":id}

        if(op) {await db.collection("operators").insertOne(account)}

        if(character != undefined) {account.character = character}
        if(items != undefined) {account.inventory = items}
        
        await db.collection("users").insertOne(account);
        
        return true;
    },

    makeOp: async function(id) {
        await db.collection("operators").insertOne({"discordId":id});
        return true;
    },

    transferAccount: async function(oldId, newId) {
        await db.collection("users").updateOne({"discordID":oldId},{"discordID":newId});
        return true;
    },

    levelUp: async function(id, levels, experience) {
        await db.collection("users").updateOne({"discordID":id},{$inc :{
            "character.level": levels, "character.exp": experience}
        });
        return true;
    }
}

module.exports = accounts;









