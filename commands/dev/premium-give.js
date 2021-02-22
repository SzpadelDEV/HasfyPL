const sqlite = require("sqlite3").verbose()
const db = new sqlite.Database("./database.db")
const { MessageEmbed } = require("discord.js")
const config = require("../../config.json")
module.exports = {
    name: "prem-nadaj",
    run: async (bot, msg, args) => {
        if (!config.owners.includes(msg.author.id)) return;
        if (!args[0]) {
            const error1 = new MessageEmbed()
            .setAuthor("Nadawanie premium", client.user.displayAvatarURL())
            .setDescription("> **Nie możesz nadać ulepszenia premium pustemu serwerowi. Musisz podać jego id!**")
            .setFooter("Wywołano na polecenie:")
            return msg.channel.send(error1)
        }
        db.get(`SELECT * FROM premium WHERE guildId = "${args[0]}"`, (err, data) => {
            if (data !== undefined) {
                return msg.channel.send("> **Nie możesz nadać drugiego premium dla tego samego serwera!**")
            } else {
                db.run(`INSERT INTO premium (guildId, premium) VALUES (?,?)`, args[0], true)
            }
            msg.channel.send("> **Gotowe! Podany przez ciebie serwer uzyskał właśnie ulepszenie premium!**")
        })
    }
}