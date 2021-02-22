const db = require("better-sqlite3")("./database.db");
const config = require("../config.json")
const Dashboard = require("../dashboard/dashboard")

module.exports = (bot) => {
    bot.on("ready", () => {
        db.prepare(`CREATE TABLE IF NOT EXISTS guilds (guildId, prefix, channel, ad, invite, gban)`).run();
        Dashboard(bot)
        console.log(`Zalogowano na koncie: ${bot.user.tag}`)
        let guilds = 0
        bot.user.setPresence({ activity: { name: `${config.prefix}pomoc | Hasfy.pl 🔎 | Panel już dostępny! https://hasfy.pl/dashboard/` }, status: 'online' });
        bot.guilds.cache.forEach(g => {
            if (!g.prefix) {
                const data = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(g.id);
                if (!data || !data.prefix) {
                    db.prepare("INSERT INTO guilds (guildId, prefix, channel, ad, invite, gban) VALUES (?,?,?,?,?,?)").run(g.id, config.prefix, "", "", "", "false");
                    g.prefix = config.prefix;
                } else {
                    g.prefix = data.prefix;
                }
            }
        })
    })
}