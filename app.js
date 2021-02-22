const {Client, Collection, Intents} = require("discord.js");
const Database = require("better-sqlite3")
const config = require("./config.json");
const client = new Client({
    disableMentions: 'everyone'
});
client.config = config;
client.db = new Database('./database.db');


["commands", "aliases"].forEach(x => (client[x] = new Collection()));

["./handlers/handler.js"].forEach(x => require(x)(client));
["./handlers/event.js"].forEach(x => require(x)(client));

client.login(config.token);

String.prototype.replaceAll = function (search, rp) {
    let string = this.toString().split(search).join(rp);
    return string.toString()
}

module.exports = {
    client: client
}

