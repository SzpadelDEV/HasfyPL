module.exports = {
    name: "devstats",
    run: async (bot, msg, args) => {
        if (!bot.config.owners.includes(msg.author.id)) return {
            type: "error",
            content: "> **Nie możesz wywołać tej czynności ponieważ nie jesteś zapisany w configu jako owner bota!**"
        }

        return {
            type: "success",
            content: `> **Liczba serwerów na których znajduje sie bot:** \`${bot.guilds.cache.size}\`\n> **Liczba łącznych użytkowników korzystających z bota:** \`${bot.users.cache.size}`
        }
    }
}