const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./database.db");
const { MessageEmbed } = require("discord.js");
const blacklist = ["\"", "'", "`"];
const config = require("../../config.json")

module.exports = {
    name: "prefix",
    permission: "MANAGE_GUILD",
    run: async (bot, msg, args, lang) => {
        try {
if(!msg.member.hasPermission("MANAGE_GUILD"))  return {
	type: "error",
	                content: lang.commands.prefix.permserror
}
            if (!args[0]) {
                const errArgs = new MessageEmbed()
                    .setAuthor(lang.commands.prefix.argserrortitle, "https://cdn.discordapp.com/emojis/745989621988458527.gif?v=1")
                    .setColor("RED")
                    .setDescription(lang.commands.prefix.argserror.replace("{prefix}", msg.guild.prefix))
                return msg.channel.send(errArgs)
            }
            const prefix = args.join(" ");
            let blocked = false;
            blacklist.forEach(b => {
                if (prefix.includes(b)) return blocked = true;
            })
            if (blocked === true) {
                const errLength = new MessageEmbed()
                    .setAuthor(lang.commands.prefix.errortitle, "https://cdn.discordapp.com/emojis/745989621988458527.gif?v=1")
                    .setColor("RED")
                    .setDescription(lang.commands.prefix.blocked)
                return msg.channel.send(errLength);
            }
            if (prefix.length > 3) {
                const errLength = new MessageEmbed()
                    .setAuthor(lang.commands.prefix.errortitle, "https://cdn.discordapp.com/emojis/745989621988458527.gif?v=1")
                    .setColor("RED")
                    .setDescription(lang.commands.prefix.toolong)
                return msg.channel.send(errLength);
            }
            msg.guild.prefix = prefix;
            db.run(`UPDATE guilds SET prefix = "${prefix}" WHERE guildId = "${msg.guild.id}"`)
            const sucessEmbed = new MessageEmbed()
                .setAuthor(lang.commands.prefix.succes, bot.user.displayAvatarURL())
                .setColor("#a412de")
                .setDescription(lang.commands.prefix.newprefix.replace("{prefix}", msg.guild.prefix))
            msg.channel.send(sucessEmbed)
        } catch (err) {
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
                .addField(`> **\`Komenda w której znaleziono błąd:\`**`, `\`prefix\``)
                .addField(`> **\`Treść błędu:\`**`, "```yaml\n" + err + "```")
                .setColor("RED")

            bot.channels.cache.get(config.errorLogs).send(errorsend)
        }
    }
};
