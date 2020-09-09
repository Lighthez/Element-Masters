const Discord = require('discord.js');

module.exports = {
    errorMessage: function(msg, err) {
        const embed = new Discord.MessageEmbed()
            .setTitle('An internal error occurred!')
            .setColor(0xff0000)
            .setDescription(err)
        msg.channel.send(embed);
    },
    
    accessMessage: function(msg) {
        const embed = new Discord.MessageEmbed()
            .setTitle('Access denied.')
            .setColor(0xffff00)
            .setDescription('Your access level is insufficient for this operation')
        msg.channel.send(embed);
    }
}