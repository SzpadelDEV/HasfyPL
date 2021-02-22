const { MessageEmbed } = require("discord.js");
const db = require('quick.db');
const send = require('quick.hook');
const moment = require('moment');
const config = require("../../config.json");
const mtz = require("moment-timezone");

module.exports = {
    name: "blacklist",
    aliases: ['blokada', 'bl', 'gban', 'g-ban', 'globalban', 'global-ban'],
    run: async (client, message, args) => {
        const data = new Date;
        const rok = data.getFullYear();
        const miesiac = data.getUTCMonth();
        const dzien = data.getUTCDay();
        const godzina = data.getHours();
        const minuta = data.getMinutes();
        const sekunda = data.getSeconds();

        if (!config.owners.includes(message.author.id)) {
            const error3 = new MessageEmbed()
                .setAuthor("Wykryto błąd!", client.user.displayAvatarURL())
                .setDescription("> *Twoje permisje nie wystarczają aby użyć tej komendy!*\n\n> `Potrzebujesz:`\n```yaml\n× Właściciel Bota\n```")
                .setFooter("Komenda wywołana przez: " + message.author.tag, message.author.avatarURL())
                .setColor("RED")
                return message.channel.send(error3)
        }
            if (args[0] == 'dodaj') {
                const idbl = args[1]
                let powod = args.slice(2).join(' '); 


                if (!idbl){
                const error1 = new MessageEmbed()
                .setAuthor("Wykryto błąd!", client.user.displayAvatarURL())
                .setDescription(`> *Podczas podmiany reklamy napotkano błąd!*\n\n> \`Treść błędu:\`\n\`\`\`yaml\n× Użytkownik o podanym id nie istnieje\nUżytkownik posiada już globalną blokadę komend\nUżytkownik jest właścicielem bota\`\`\``)
                .setFooter("Komenda wywołana przez: " + message.author.tag, message.author.avatarURL())
                .setColor("RED")
                return message.channel.send(error1)
                }
                if (!powod) {
                    powod = "DNSS / DNSB"
                }

                //        if (premium === 'false'){

                let schema = {
                    date: `${mtz().tz("Poland").format("DD.MM.YYYY HH:mm:ss")}`,
                    dev: message.author.tag,
                    reason: powod
                }
                
                db.set(`blacklist_${idbl}`, schema)

                const succes2 = new MessageEmbed()
                .setDescription(`> *Użytkownik o nazwie*\n\`\`\`<@${idbl}> (${idbl})\`\`\`\n\n> *Uzyskał blokadę komend z powodem:* \`${powod}\``)
                .setColor("RED")
                .setFooter(`Autor: ${message.author.tag} (${message.author.id})` , message.author.displayAvatarURL()) 
                return client.channels.cache.get("779146257247240203").send(succes2)
        
            } // zedytuje na id tylko i potem poprawie xD
            if (args[0] == 'usun') {
                const idbl = args[1]
                //let powod = args.slice(2).join(' ');
                if (!idbl){
                const error2 = new MessageEmbed()
                .setAuthor("Wykryto błąd!", client.user.displayAvatarURL())
                .setDescription(`> *Podczas podmiany reklamy napotkano błąd!*\n\n> \`Treść błędu:\`\n\`\`\`yaml\n× Użytkownik o podanym id nie istnieje\nUżytkownik posiada już globalną blokadę komend\nUżytkownik jest właścicielem bota\`\`\``)
                .setFooter("Komenda wywołana przez: " + message.author.tag, message.author.avatarURL())
                .setColor("RED")
                return message.channel.send(error2)
                }
                //if(!powod){
                //  powod = "DNSS / DNSB"
                //}
                db.delete(`blacklist_${idbl}`)
                let blpeople = await client.users.cache.get(idbl);
                const embed2 = new MessageEmbed()
                .setColor("#34eb46")
                .setTitle("Usuwanie z blacklisty")
                .setDescription(`> *Użytkownik o nicku*\n<@${idbl}> (${idbl}\n\n> *Nie posiada już globalnej blokady komend!*`)
                return message.channel.send(embed2);
            }
            }
        }
