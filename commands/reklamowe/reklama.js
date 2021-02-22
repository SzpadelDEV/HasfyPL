const db = require("better-sqlite3")("./database.db");
const { MessageEmbed } = require("discord.js");
const config = require("../../config.json")

module.exports = {
    name: "ad",
    aliases: ["reklama", "rek"],
    perm: "MANAGE_GUILD",
    run: async (bot, msg, args, lang) => {
        try {
if(!msg.member.hasPermission("MANAGE_GUILD"))  return {
	type: "error",
	                content: lang.commands.ad.permserror
}
            const guildData = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(msg.guild.id);
            if (!guildData || !guildData.channel) return {
                type: "error",
                content: lang.commands.ad.nochannel
            }

            const channel = msg.guild.channels.cache.get(guildData.channel);
            if (!channel) {
                return {
                    type: "error",
                    content: lang.commands.ad.channeldeleted
                }
            }

            let blocked = false;

            await channel.permissionOverwrites.forEach(p => {
                const perms = channel.permissionsFor(p.id).serialize();
                if (perms["VIEW_CHANNEL"] === false) blocked = true
            });

            if (blocked === true) {
                return {
                    type: "error",
                    content: lang.commands.ad.novisible
                }
            }

            const adStatus = db.prepare("SELECT * FROM adsCheck WHERE guildId = ?").get(msg.guild.id);
            //// dobra odpal to poprawiłem tak jak u mnie jest /shrug //dobra a te embedy ja klzrobic xD chodx do message.js
            if (adStatus) {
                return {
                    type: "error",
                    content: lang.commands.ad.verification
                }
            }

            if (!args[0]) {
                return {
                    type: "error",
                    content: lang.commands.ad.argserror
                }
            }

            const content = args.join(" ");

            if (content.length < 25) {
                return {
                    type: "error",
                    content: lang.commands.ad.tooshort
                }
            }

            if (msg.mentions.users.first() || msg.mentions.roles.first() || msg.content.includes("@everyone") || msg.content.includes("@here")) {
                return {
                    type: "error",
                    content: lang.commands.ad.ping
                }
            }

            let errBlacklist = false;
            const blackList = ["discord.gg/", "discord.com/invite", "discordapp.com/invite", "nadsc.pl", "marketingbot.tk", "market-bot.pl", "sparfy.net", "sparfy.pl", "sparfy.eu", "dclinks.pl"];

            blackList.forEach(word => {
                if (msg.content.includes(word)) errBlacklist = true;
            });

            if (errBlacklist === true) {
                return {
                    type: "error",
                    content: lang.commands.ad.link
                }
            }

            if (content.length > 1000) {
                return {
                    type: "error",
                    content: lang.commands.ad.toolong
                }
            }
            db.prepare("INSERT INTO adsCheck (guildId, content, user, nic) VALUES(?,?,?,?)").run(msg.guild.id, content, msg.author.id, "nic");
            db.prepare("UPDATE guilds SET ad = ? WHERE guildId = ?").run(content, msg.guild.id);

            const embed = new MessageEmbed()
                .setAuthor("Ustawiono nową reklamę!", bot.user.displayAvatarURL())
                .setColor(bot.config.mainColor)
                .addField("**\`User:\`**", `\`${msg.author.tag} \` [\`(${msg.author.id})\` (<@!${msg.author.id}>)]`)
                .addField("**\`Server:\`**", `\`${msg.guild.name} (${msg.guild.id})\``)
                .addField("**\`Invite:\`**", `[\`${guildData.invite}\`](${guildData.invite})`)
                .addField("**\`AD Content:\`**", `${content}`)
                .setFooter(`System weryfikacji reklam | By: Hamish | ${bot.user.username}`)
            bot.channels.cache.get("779147106208186389").send(embed);

            return {
                type: "success",
                content: lang.commands.ad.adset
            }
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
                .addField(`> **\`Komenda w której znaleziono błąd:\`**`, `\`reklama\``)
                .addField(`> **\`Treść błędu:\`**`, "```yaml\n" + err + "```")
                .setColor("RED")

            bot.channels.cache.get(config.errorLogs).send(errorsend)
        }
    }
};
