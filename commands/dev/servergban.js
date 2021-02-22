const { MessageEmbed } = require("discord.js");
const db = require('quick.db');
const send = require('quick.hook');
const config = require("../../config.json");

module.exports = {
    name: "serverblacklist",
    aliases: ['servergban', 'serverbl', 'server', 'serwer', 'serwergban'],
    run: async (bot, msg, args) => {
        if (!config.owners.includes(msg.author.id)) {
            const error3 = new MessageEmbed()
                .setAuthor("Wykryto błąd!", bot.user.displayAvatarURL())
                .setDescription("> *Twoje permisje nie wystarczają aby użyć tej komendy!*\n\n> `Potrzebujesz:`\n```yaml\n× Właściciel Bota\n```")
                .setFooter("Komenda wywołana przez: " + msg.author.tag, msg.author.avatarURL())
                .setColor("RED")
                return msg.channel.send(error3)
        }
        if(args[0] == "dodaj") {
            let id = args[1]
            let reason = args.slice(2).join(" ")

            let servergban = db.get(`server_blacklist_${id}`)

            if(!id || servergban || id === "779137443773153302") {
                let embed = new MessageEmbed()
                .setAuthor("Wykryto błąd!", bot.user.displayAvatarURL())
                .setDescription(`> *Podczas nadawania blokady serwerowi napotkano błąd!*\n\n> \`Treść błędu:\`\n\`\`\`yaml\n× Serwer o podanym id nie istnieje\n× Serwer posiada już globalną blokadę komend\n× Serwer jest supportem bota\`\`\``)
                .setFooter("Komenda wywołana przez: " + msg.author.tag, msg.author.avatarURL())
                .setColor("RED")

                return msg.channel.send(embed)
            }
            if(!reason) reason = "Nie podano"

            db.set(`server_blacklist_${id}`, reason)

            let embed = new MessageEmbed()
            .setDescription(`> *Serwer o id*\n\`\`\`${id}\`\`\`\n\n> *Uzyskał blokadę komend z powodem:* \`${reason}\``)
            .setColor("RED")
            .setFooter(`Autor: ${msg.author.tag} (${msg.author.id})` , msg.author.displayAvatarURL()) 

            msg.channel.send(embed)

            if(bot.guilds.cache.get(id)) {
                bot.guilds.cache.get(id).leave()
            }
        } else if(args[0] == "usun") {
            let id = args[1]

            let servergban = db.get(`server_blacklist_${id}`)

            if(!id || !servergban || id === "779137443773153302") {
                let embed = new MessageEmbed()
                .setAuthor("Wykryto błąd!", bot.user.displayAvatarURL())
                .setDescription(`> *Podczas nadawania blokady serwerowi napotkano błąd!*\n\n> \`Treść błędu:\`\n\`\`\`yaml\n× Serwer o podanym id nie istnieje\n× Serwer nie posiada globalnej blokady\n× Serwer jest supportem bota\`\`\``)
                .setFooter("Komenda wywołana przez: " + msg.author.tag, msg.author.avatarURL())
                .setColor("RED")

                return msg.channel.send(embed)
            }

            db.delete(`server_blacklist_${id}`)

            let embed = new MessageEmbed()
            .setDescription(`> *Serwer o id*\n\`\`\`${id}\`\`\`\n\n> *Nie posiada już blokady*`)
            .setColor("RED")
            .setFooter(`Autor: ${msg.author.tag} (${msg.author.id})` , msg.author.displayAvatarURL()) 

            msg.channel.send(embed)
        } else {
            let embed = new MessageEmbed()
            .setAuthor(`Wykryto błąd!`, bot.user.displayAvatarURL())
            .setDescription(`> *Upewnij się że wybrałeś prawidłową opcję!*\n\n*Możliwe opcje:*\n\`\`\`dodaj | usun\`\`\``)
            .setColor("RED")

            msg.channel.send(embed)
        }
    }
}