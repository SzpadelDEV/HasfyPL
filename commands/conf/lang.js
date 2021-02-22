const db = require("better-sqlite3")("./database.db");
const { MessageEmbed } = require("discord.js");
const config = require("../../config.json")

module.exports = {
    name: "lang",
    aliases: ["jezyk", "language"],
    perm: "MANAGE_GUILD",
    run: async (bot, msg, args, lang) => {
        try {
        if(!args.length) return {
            type: "error",
            content: lang.commands.lang.argserror.replace("{prefix}", msg.guild.prefix)
        }

        if(args[0] == "pl" || args[0] == "polski" || args[0] == "polish") {
            db.prepare("UPDATE lang SET lang = ? WHERE ID = ?").run("pl", msg.guild.id)

                let embed = new MessageEmbed()
                .setAuthor(lang.commands.lang.succes, bot.user.displayAvatarURL())
                .setDescription(lang.commands.lang.langpl)
                .setColor("#a412de")

                msg.channel.send(embed)
        } else if(args[0] == "en" || args[0] == "english" || args[0] == "angielski") {
            db.prepare("UPDATE lang SET lang = ? WHERE ID = ?").run("en", msg.guild.id)

                let embed = new MessageEmbed()
                .setAuthor(lang.commands.lang.succes, bot.user.displayAvatarURL())
                .setDescription(lang.commands.lang.langen)
                .setColor("#a412de")

                msg.channel.send(embed)
        } else {
            let embed = new MessageEmbed()
            .setAuthor(lang.commands.lang.errortitle, "https://cdn.discordapp.com/emojis/745989621988458527.gif?v=1")
            .setDescription(lang.commands.lang.errordesc)
            .setColor("RED")

            msg.channel.send(embed)
        }
    } catch(err) {
        let embedchannel = new MessageEmbed()
            .setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
            .setDescription(lang.other.errordesc)
            .setFooter(lang.other.errorfooter)
            .setColor("RED")

            msg.channel.send(embedchannel)

            let errorsend = new MessageEmbed()
                .setTitle(`<a:nie_przykro_mi:766648988253683723> Error`)
                .addField(`> **\`Użytkownik który wykrył błąd:\`**`, `**${msg.author.tag}** (\`${msg.author.id}\`)`)
                .addField(`> **\`Serwer na którym znaleziono błąd:\`**`, `**${msg.guild.name}** (\`${msg.guild.id}\`)`)
                .addField(`> **\`Komenda w której znaleziono błąd:\`**`, `\`lang\``)
                .addField(`> **\`Treść błędu:\`**`, "```yaml\n" + err + "```")
                .setColor("RED")

            bot.channels.cache.get(config.errorLogs).send(errorsend)
    }
    }
}