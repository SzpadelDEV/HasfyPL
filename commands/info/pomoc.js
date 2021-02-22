const { MessageEmbed, Collector, MessageCollector, Message } = require("discord.js")
const config = require("../../config.json")

module.exports = {
    name: "pomoc",
    aliases: ["help", "h"],
    run: async (bot, msg, args, lang) => {
        try {
            const help1 = new MessageEmbed()
            .setAuthor(`${lang.commands.help.hi} ${msg.author.username}`, msg.author.displayAvatarURL({dynamic: true}))
            .setDescription(new String(lang.commands.help.desc).replaceAll("{prefix}", msg.guild.prefix))
            .setThumbnail(bot.user.displayAvatarURL())
            .setColor("PURPLE")
            .setFooter(`${msg.author.tag}`, msg.author.displayAvatarURL({dynamic: true}))
            return msg.channel.send(help1)
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
                .addField(`> **\`Komenda w której znaleziono błąd:\`**`, `\`pomoc\``)
                .addField(`> **\`Treść błędu:\`**`, "```yaml\n" + err + "```")
                .setColor("RED")

            bot.channels.cache.get(config.errorLogs).send(errorsend)
        }
    }
};
