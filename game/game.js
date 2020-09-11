let battles = [];

module.exports = {
    createBattle: function(channel,type,opponents) {
        battles.push({
            //1v1 2v2 3v3 bot
            type:type,
            //[["lighthex","someoneElse"],["BadGuy123","username1"]]
            teams: opponents,

        });
    }
}