const config = require("../config.json")
const db = require("better-sqlite3")("./database.db");
const {MessageEmbed} = require("discord.js");
const fs = require("fs")

const isPremium = (id) => {
    const premium = db.prepare("SELECT * FROM premium WHERE guildId = ?").get(id);

    if (!premium) return false;
    if (premium) return true;
}

const supportInfo = (guild, content, client) => {
    const supportEmbed = new MessageEmbed()
        .setAuthor("Support Info", client.user.displayAvatarURL())
        .addField("**`Serwer`**", `\`${guild ? guild.name || "Error" : "Error"} (${guild ? guild.id || "Error" : "Error"})\``)
        .addField("**`Treść`**", `\`${content}\``)
        .setFooter(`Support Info ${client.user.username}`)
    client.channels.cache.get("798671686576111627").send(supportEmbed);
}

module.exports = (bot) => {
    bot.on("ready", () => {
        setInterval(() => {

            let ad = db.prepare("SELECT * FROM ads WHERE number = ?").get(config.number);

            if (!ad) config.number = 1;
            fs.writeFileSync("../config.json", JSON.stringify(config, null, 4));
            ad = db.prepare("SELECT * FROM ads WHERE number = ?").get(config.number);

            if (!ad) return;

            console.log(`Debug AdData: ${JSON.stringify(ad)}`);

            const guild = bot.guilds.cache.get(ad.id);
            console.log(`Debug GuildID: ${guild.id}`);

            const guildData = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(ad.id);

            console.log(`Debug GuildData: ${JSON.stringify(guildData)}`);

            if (!guild || !guildData) return config.number = Number(config.number) + 1, fs.writeFileSync("../config.json", JSON.stringify(config, null, 4)), supportInfo(guild, `Brak bota lub ukryty kanał reklam na serwerze numer reklamy: ${ad.number}`, bot)

            const channel = bot.channels.cache.get(guildData.channel);
            console.log(`Debug ChannelID ${channel.id}`);

            if (!channel) return config.number = config.number + 1, fs.writeFileSync("../config.json", JSON.stringify(config, null, 4)), supportInfo(guild, `Brak bota lub ukryty kanał reklam na serwerze numer reklamy: ${ad.number}`, bot);

            let blocked = false;

            channel.permissionOverwrites.forEach(p => {
                if (!p || !channel.permissionsFor(p.id)) return;
                const perms = channel.permissionsFor(p.id) ? channel.permissionsFor(p.id).serialize() : null;
                if (perms === null || perms["VIEW_CHANNEL"] === false || perms["VIEW_CHANNEL"] === null) blocked = true
            });

            if (blocked === true) return config.number = config.number + 1, fs.writeFileSync("../config.json", JSON.stringify(config, null, 4)), supportInfo(guild, `Brak bota lub ukryty kanał reklam na serwerze numer reklamy: ${ad.number}`, bot);

            db.prepare("UPDATE ads SET wyslana = ? WHERE id = ?").run(Number(ad.wyslana) + 1, guild.id);

            bot.guilds.cache.forEach(g => {
                const gData = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(g.id);
                if (!gData || !gData.channel) return;
                const adChannel = g.channels.cache.get(gData.channel);
                if (!adChannel) return;

                if (isPremium(guild.id) === false) {
                    adChannel.send(`\`📚\` **Numer:** \`${config.number}\` \n\`🌐\` **ID:** \`${guild.id}\`\n<:koks_link:785167255302307870> **Zaproszenie:** ${guildData.invite}
                    
                    ${ad.content}`).catch(e => console.log(e));
                } else {
                    const adEmbed = new MessageEmbed()
                        .setAuthor(`Premium | 📚 Numer: ${config.number}`)
                        .setColor(bot.config.mainColor)
                        .setDescription(ad.content)
                        .addField("<:koks_link:785167255302307870> **Zaproszenie:**", `[**\`${guildData.invite}\`**](${guildData.invite})`)
                    adChannel.send(adEmbed).catch(e => {
                        console.log(e)
                    });
                }

            })

            config.number = config.number + 1;
            fs.writeFileSync("../config.json", JSON.stringify(config, null, 4));
        }, 5 * 60 * 1000);
    });
}
