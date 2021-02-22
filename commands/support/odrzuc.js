const db = require("better-sqlite3")("./database.db");
const { MessageEmbed } = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "odrzuc",
    aliases: ["discard", "odrzuć"],
    run: async (bot, msg, args) => {
        try {
            if (!msg.member.roles.cache.has(config.verificatorRole)) return {
                type: "error",
                content: "> *Twoje permisje nie wystarczają aby użyć tej komendy!*\n\n> `Potrzebujesz:`\n```yaml\n× Weryfikator Reklam\n```"
            }
            //if (msg.channel.id !== "745687783519158403") return msg.author.send("<#745687783519158403>");

            if (!args[0]) return {
                type: "error",
                content: `> *Podałeś błędne argumenty!*\n\n> \`Poprawne użycie:\`\n\`\`\`yaml\n× ${msg.guild.prefix}discard (ID) (POWÓD)\n\`\`\``
            }

            const check = db.prepare("SELECT * FROM adsCheck WHERE guildId = ?").get(args[0]);

            if (!check) return {
                type: "error",
                content: `> *Podczas odrzucania reklamy napotkano błąd!*\n\n> \`Treść błędu:\`\n\`\`\`yaml\n× Serwer o podanym ID nie ustawił żadnej reklamy!\n\`\`\``
            }

            if (!args[1]) return {
                type: "error",
                content: `> *Podałeś błędne argumenty!*\n\n> \`Poprawne użycie:\`\n\`\`\`yaml\n× ${msg.guild.prefix}discard (ID) (POWÓD)\n\`\`\``
            }



            const user = check.user;
            const guild = bot.guilds.cache.get(args[0]);
            if (!guild) {
                db.prepare("DELETE FROM adsCheck WHERE guildId = ?").run(args[0]);
                return {
                    type: "error",
                    content: `> *Podczas akceptowania reklamy napotkano błąd!*\n\n> \`Treść błędu:\`\n\`\`\`yaml\n× Bot nie znajduje się na podanym przez ciebie serwerze!\n\`\`\``
                };
            }

            const guildData = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(args[0]);


            const statsEmbed = new MessageEmbed()
            .setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
                .setColor("RED")
                .setDescription(`> *Server ad named:*\n \`\`\`${guild.name}\`\`\` \n> *was rejected due to:* \`${args.slice(1).join(" ")}\`\n\n> <:addmember:794166379228954654> \`Invite:"\` [\`**Kliknij**\`](${guildData.invite})`)
bot.channels.cache.get('779146257247240203').send(statsEmbed)




            
            db.prepare("DELETE FROM adsCheck WHERE guildId = ?").run(args[0]);
            let id = db.prepare("SELECT * FROM logs WHERE nic = ?").all("nic")
            let is = 0
            id.forEach(i => {
            is = parseInt(is) + parseInt(1)
            })

            db.prepare("INSERT INTO logs (ID, user, guildId, type, nic) VALUES (?, ?, ?, ?, ?)").run(is, msg.author.id, args[0], "discard", "nic")

            return {
                type: "success",
                content: "Reklama została odrzucona"
            }

        } catch (err) {
            let embedchannel = new MessageEmbed()
            .setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
            .setDescription(`> *W tej komendzie został znaleziony error. Wszelakie informacje zostały przesłane do zespołu developerskiego sieci Hasfy.pl!*\n\n> \`Możliwe opcje nagród:\`\n\`\`\`yaml\n× Ulepszenie Premium\n×Dostęp do Serwera Beta Hasfy.pl\n\`\`\``)
            .setFooter("× W celu przyznania nagrody za odnalezienie błędu, oczekuj na kontakt z administracją Hasfy.pl!")
            .setColor("RED")

            msg.channel.send(embedchannel)

            let errorsend = new MessageEmbed()
                .setTitle(`<a:nie_przykro_mi:766648988253683723> Error`)
                .addField(`> **\`Użytkownik który wykrył błąd:\`**`, `**${msg.author.tag}** (\`${msg.author.id}\`)`)
                .addField(`> **\`Serwer na którym znaleziono błąd:\`**`, `**${msg.guild.name}** (\`${msg.guild.id}\`)`)
                .addField(`> **\`Komenda w której znaleziono błąd:\`**`, `\`odrzuć\``)
                .addField(`> **\`Treść błędu:\`**`, "```yaml\n" + err + "```")
                .setColor("RED")

            bot.channels.cache.get(config.errorLogs).send(errorsend)
        }
    }
};
