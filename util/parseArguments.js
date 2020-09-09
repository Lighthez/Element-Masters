module.exports = function(text) {
    const strings = text.match(/"[\S ]*?"/g);

    let args;

    text = text.replace(/§+/g, "$");

    if(strings != null) {
        for (let i = 0; i < strings.length; i++) {
            text = text.replace(strings[i], "§" + i);
        }

        args = text.split(" ");
        for (let i = 0; i < args.length; i++) {
            if(args[i].indexOf("§") != -1) {
                let symbolsLength = args[i].match(/§+/g).length

                for (let x = 0; x < symbolsLength; x++) {
                    let n = args[i][args[i].indexOf("§")+1];
                    args[i] = args[i].replace("§" + n, strings[n]);
                }
            }
        }
    } else {
        args = text.split(" ");
    }

    return args;
}