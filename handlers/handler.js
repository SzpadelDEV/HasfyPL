const fs = require("fs")
const ascii = require("ascii-table")
const table = new ascii("Commands")
table.setHeading("Command", "Status")
module.exports = (bot) => {
    fs.readdirSync("./commands/").forEach(dir => {
        const commands = fs.readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js"))

        for (const file of commands) {
            if (file.startsWith("--")) return;
            const cmd = require(`../commands/${dir}/${file}`)
            if (cmd.name) {
                bot.commands.set(cmd.name, cmd)
                table.addRow(file, "➕")
            } else {
                table.addRow(file, "➖")
                continue;
            }

            if (cmd.aliases && Array.isArray(cmd.aliases)) {
                cmd.aliases.forEach(alias => {
                    bot.aliases.set(alias, cmd.name)
                })
            }
        }
    })
    console.log(table.toString())
}