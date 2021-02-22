let quick = require("quick.db")
let { MessageEmbed } = require("discord.js");
module.exports = async (client) => {
    let db = client.db;
    let lang;
    let data;
    let prefix;

    client.on("message", async message => {
        let msg = message;
        let bot = client;
        if (!msg.guild) return;
        if (msg.author.bot) return;
        const data = new Date;
        const godzina = data.getHours();
        const minuta = data.getMinutes();
        if (!msg.guild.prefix) {
            const guild = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(msg.guild.id);

            if (!guild) {
                msg.guild.prefix = config.prefix;
                db.prepare("INSERT INTO guilds (guildId, prefix) VALUES(?,?)").run(msg.guild.id, config.prefix);
            } else {
                msg.guild.prefix = guild.prefix;
            }
        }

        const os = require('os');
        let seconds = process.uptime();
        let uptimeD = Math.floor(seconds / (3600 * 24));
        let uptimeH = Math.floor(seconds % (3600 * 24) / 3600);
        let uptimeM = Math.floor(seconds % 3600 / 60);
        let uptimeS = Math.floor(seconds % 60);
        let x = 0;
        if (msg.content === `<@!${bot.user.id}>` || msg.content === `<@${bot.user.id}>`) {
            const mentionEmbed = new MessageEmbed()
                .setAuthor(`Cześć ${msg.author.username}`, msg.author.displayAvatarURL({dynamic: true}))
                .addField(`> *<:ustawienia1234:795259980101582879> Prefix*`, `Prefix tego serwera to: **\`${msg.guild.prefix}\`**`)
                .addField(`> *<:dashboard1:798647295620677632> Dashboard*`, `Nasz dashboard jest już dostępny! Znajdziesz go tutaj: [Klik](https://hasfy.pl/dashboard/)`)
                .setFooter(`Wykonano dla: ${msg.author.tag}`, msg.author.displayAvatarURL({dynamic: true}))
                .setThumbnail(bot.user.displayAvatarURL())
                .setColor("BLUE")
            return msg.channel.send(mentionEmbed);
        }

        let msgPrefix = msg.guild.prefix;

        if (!msg.content.startsWith(msgPrefix)) msgPrefix = `<@${bot.user.id}>`;
        if (!msg.content.startsWith(msgPrefix)) msgPrefix = `<@!${bot.user.id}>`;
        if (!msg.content.startsWith(msgPrefix)) return;

        const args = msg.content.slice(msgPrefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        if (cmd.length === 0) return;

        let command = bot.commands.get(cmd);
        if (!command) command = bot.commands.get(bot.aliases.get(cmd));

        if (!command) return;

        let bl = quick.get(`blacklist_${msg.author.id}`)
        if (bl) {
            const gbanik = new MessageEmbed()
                .setAuthor("Blokada na używanie komend", bot.user.displayAvatarURL())
                .setThumbnail(msg.author.displayAvatarURL())
                .setDescription(`\`🖍\` **Powód:**\n\`\`\`${bl.reason}\`\`\`\n\n\`🔒\` **Administrator:**\n\`\`\`${bl.dev}\`\`\`\n\n\`🗓\` **Data Nadania:**\n\`\`\`${bl.date}\`\`\``)
                .setFooter(`${msg.author.tag} (${msg.author.id}) | Dziś o ${godzina}:${minuta}`)
                .setColor("RED")
            return msg.channel.send(gbanik)
        }

        if (command.perm && !msg.member.hasPermission(command.perm)) {
            if (bot.config.owners.includes(msg.author.id)) ;
            else {
                const errorEmbed = new MessageEmbed()
                    .setAuthor("Błąd!", bot.user.displayAvatarURL())
                    .setColor(bot.config.errorColor)
                    .setDescription(`> *Your permissions are not enough to use this command!*\n\n> \`You need:\` \n\`\`\`yaml\n× ${require("../perms.json")[command.perm]}\n\`\`\``)
                    .setFooter(`Wykonano dla: ${msg.author.tag}`, msg.author.displayAvatarURL({dynamic: true}))
                return msg.channel.send(errorEmbed);
            }
        }

        if (!db.prepare("SELECT * FROM lang WHERE ID = ?").get(msg.guild.id)) db.prepare("INSERT INTO lang (ID, lang) VALUES (?, ?)").run(msg.guild.id, "pl")
        let langdb = db.prepare("SELECT * FROM lang WHERE ID = ?").get(msg.guild.id)
        if (langdb.lang !== "pl" && langdb.lang !== "en") langdb.lang = "en";
        let lang = require(`../lang/${langdb.lang}`)

        const res = await command.run(bot, msg, args, lang).catch(e => {
            console.error(e.stack);
        });
        // tak działanie czaje tego XDDD AAAAAAAAAAAAA JUZ WIEEEEM
        if (typeof res === "object") {
            if (res.type === "error") {
                const errorEmbed = new MessageEmbed()
                    .setAuthor("Error!", bot.user.displayAvatarURL())
                    .setColor(bot.config.errorColor)
                    .setDescription(`${res.content}`)
                    .setFooter(`${msg.author.tag}`, msg.author.displayAvatarURL({dynamic: true}))
                return msg.channel.send(errorEmbed);
            } else if (res.type === "message") {
                return msg.channel.send(res.content);
            } else if (res.type === "success") {
                const successEmbed = new MessageEmbed()
                    .setAuthor("Succes", bot.user.displayAvatarURL())
                    .setColor(bot.config.mainColor)
                    .setDescription(`${res.content}`)
                    .setFooter(`${msg.author.tag}`, msg.author.displayAvatarURL({dynamic: true}))
                return msg.channel.send(successEmbed);
            }
        }

    });


}
