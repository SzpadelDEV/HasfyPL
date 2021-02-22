

module.exports = (bot) => {
    let {db} = bot;
    bot.on("guildDelete", g => {
        db.run(`DELETE FROM guilds WHERE guildId = "${g.id}"`)
        db.run(`DELETE FROM adsCheck WHERE guildId = "${g.id}"`)
        db.run(`DELETE FROM premium WHERE guildId = "${g.id}"`)
            const channel = bot.channels.cache.get("779147472936370177")
            if (channel) {
                const { MessageEmbed } = require("discord.js")
                const embed = new MessageEmbed()
                .setAuthor("Wyrzucono bota!", g.iconURL({dynamic: true}) || bot.user.displayAvatarURL())
                .setColor(bot.config.errorColor)
                .addField("**\`Serwer\`**", `\`${g.name} | ${g.id}\``)
                .addField("**\`Ilość osób:\`**", `\`${g.memberCount}\``)
                channel.send(embed);
            }
    })
}
