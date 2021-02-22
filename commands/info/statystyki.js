const { MessageEmbed } = require("discord.js");
const db = require("better-sqlite3")("./database.db");
const config = require("../../config.json")

module.exports = {
    name: "statystyki",
aliases: ["stats", "statistics"],
    run: async (bot, msg, args, lang) => {
        try {
            let prem = ""
            let linkStatus = "";
            let content = ""
            let status = ""
            let channel = ""
            const statsEmbed = new MessageEmbed()
                .setAuthor(`${lang.commands.stats.title} ${msg.guild.name}`, msg.guild.iconURL() || bot.user.displayAvatarURL())
                .setColor(bot.config.mainColor);

            const guild = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(msg.guild.id);

            const premium = db.prepare("SELECT * FROM premium WHERE guildId = ?").get(msg.guild.id);

            const link = db.prepare("SELECT * FROM links WHERE guildId = ?").get(msg.guild.id);

            channel = guild.channel ? `${lang.commands.stats.channeltrue.replace("{channel}", guild.channel)}` : `${lang.commands.stats.channelfalse}`;

            content = guild.ad ? guild.ad : `${lang.commands.stats.adfalse}`;

            const adCheck = db.prepare("SELECT * FROM adsCheck WHERE guildId = ?").get(msg.guild.id);

            const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(msg.guild.id);

            if (ad) {
                status = `${lang.commands.stats.adverified}`;
            } else if (adCheck) {
                status = `${lang.commands.stats.adwaiting}`;
            } else {
                status = `${lang.commands.stats.adnotset}`;
            }

            if (premium) {
                prem = `${lang.commands.stats.haspremium}`;
            } else {
                prem = `${lang.commands.stats.donthavepremium}`
            }
            if (link) {
                linkStatus = `${lang.commands.stats.haslink.replace("{link}", link.link)}`;
            } else {
                linkStatus = `${lang.commands.stats.donthavelink}`;
            }



            //statsEmbed.setDescription("> `×` *Kanał reklam"+ channel +`\n\n> \`×\` *Status konfiguracji reklamy:*\n${status}\n\n> \`×\` *Status konfiguracji Custom URL:*\n` + linkStatus + `\n\n*Status ulepszenia premium:*\n`+ prem +`\n\n\n> \`×\` *Treść reklamy serwera:*\n\`\`\`${content}\`\`\``);
            statsEmbed.setDescription(`> \`×\` *${lang.commands.stats.channel}*\n${channel}\n\n> \`×\` *${lang.commands.stats.status}*\n${status}\n\n \`×\` *${lang.commands.stats.customurlstatus}*\n${linkStatus}\n\n*${lang.commands.stats.premiumstatus}*\n${prem}\n\n> *${lang.commands.stats.ad}*\n\`\`\`${content}\`\`\``)

            statsEmbed.setFooter(`${lang.commands.stats.for} ${msg.author.tag}`, msg.author.displayAvatarURL({ dynamic: true }))
            msg.channel.send(statsEmbed)
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
                .addField(`> **\`Komenda w której znaleziono błąd:\`**`, `\`statystyki\``)
                .addField(`> **\`Treść błędu:\`**`, "```yaml\n" + err + "```")
                .setColor("RED")

            bot.channels.cache.get(config.errorLogs).send(errorsend)
        }
    }
};
