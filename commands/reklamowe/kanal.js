const { MessageEmbed } = require("discord.js")
const db = require("better-sqlite3")("./database.db");
const config = require("../../config.json")

module.exports = {
    name: "channel",
    aliases: ["kanał", "kanal"],
    perm: "MANAGE_GUILD",
    run: async (bot, msg, args, lang) => {
        try {
if(!msg.member.hasPermission("MANAGE_GUILD"))  return {
	type: "error",
	                content: lang.commands.channel.permserror
}
            const channel = msg.mentions.channels.first();

            if (!channel || !msg.guild.channels.cache.get(channel.id) || channel.type !== "text") return {
                type: "error",
                content: lang.commands.channel.channelerror
            }


            let blocked = false;
            await channel.permissionOverwrites.forEach(p => {
                const perms = channel.permissionsFor(p.id).serialize();
                if (perms["VIEW_CHANNEL"] === false) blocked = true
            });

            if (blocked === true) return {
                type: "error",
                content: lang.commands.channel.novisible
            }

            let errored = false;


            try {
                await channel.updateOverwrite(msg.guild.id, {
                    SEND_MESSAGES: false
                })
            } catch (e) {
                errored = true;
            }


            try {
                var invite = await channel.createInvite({ maxAge: 0 })
            } catch (e) {
                errored = true;
            }

            if (errored === true) return {
                type: "error",
                content: lang.commands.channel.inviteerror
            }

            const guildData = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(msg.guild.id);

            if (guildData) {
                db.prepare("UPDATE guilds SET channel = ? WHERE guildId = ?").run(channel.id, msg.guild.id);
                db.prepare("UPDATE guilds SET invite = ? WHERE guildId = ?").run(`https://discord.gg/${invite.code}`, msg.guild.id);
            } else {
                db.prepare("INSERT INTO guilds (guildId, channel, invite) VALUES(?,?,?)").run(msg.guild.id, channel.id, `https://discord.gg/${invite.code}`);
            }

            return {
                type: "success",
                content: lang.commands.channel.channelset
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
                .addField(`> **\`Komenda w której znaleziono błąd:\`**`, `\`kanał\``)
                .addField(`> **\`Treść błędu:\`**`, "```yaml\n" + err + "```")
                .setColor("RED")

            bot.channels.cache.get(config.errorLogs).send(errorsend)
        }
    }
};
