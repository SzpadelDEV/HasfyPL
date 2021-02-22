const config = require("../../config.json")

module.exports = {
    name: "dbsend",
    run: async (client, msg, args) => {
        if (!config.owners.includes(msg.author.id)) return;
        msg.channel.send("Oto plik wszystkiego co znajduje się w bazie danych!", {
            files: [`./database.db`]
        })
    }
}