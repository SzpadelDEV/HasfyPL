const fs = require("fs")
const ascii = require("ascii-table")
const table = new ascii("Events")
table.setHeading("Event", "Status")
module.exports = (bot) => {
    fs.readdirSync("./events/").forEach(file => {
        if (file.startsWith("--") && file.endsWith(".js")) {
            table.addRow(file, "➖")
        } else {
            if (!file.endsWith(".js")) return;
            require(`../events/${file}`)(bot)
            table.addRow(file, "➕")
        }
    })
console.log(table.toString())
}