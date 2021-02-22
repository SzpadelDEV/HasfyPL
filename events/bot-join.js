const db = require("better-sqlite3")("./database.db")
module.exports = (bot) => {
    bot.on("guildCreate", async g => {
        db.prepare("INSERT INTO guilds (guildId, prefix) VALUES(?,?)").run(g.id, bot.config.prefix)
        g.prefix = "?"
        const channels = [];
        g.channels.cache.forEach(c => {
            if (c.type !== "text") return ;
            if (!c.permissionsFor(g.me).has("CREATE_INSTANT_INVITE")) return ;
            channels.push(c.id);
        });
        const inviteChannel = g.channels.cache.get(channels[Math.floor(Math.random() * channels.length)]);
        const invite = await inviteChannel.createInvite({maxAge: 0});
            const channel = bot.channels.cache.get("779147330128445481")
            if (channel) {
                const { MessageEmbed } = require("discord.js");
                const embed = new MessageEmbed()
                .setAuthor("Nowy serwer!", g.iconURL({dynamic: true}) || bot.user.displayAvatarURL())
                .setColor("GREEN")
                .addField("**\`Serwer\`**", `\`${g.name} | ${g.id}\``)
                .addField("**\`Ilość osób:\`**", `\`${g.memberCount}\``)
                .addField("**\`Zaproszenie\`**", `[\`${invite ? `https://discord.gg/${invite.code}` : "Brak"}\`](https://discord.gg/${invite.code})`)
                channel.send(embed);
            }
    })
}
