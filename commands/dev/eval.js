const Discord = module.require("discord.js");
const config = require("../../config.json");
const db = require("better-sqlite3")("./database.db");
module.exports = {
    name: "eval",
    aliases: ['e'],
    run: async (client, message, args, msg) => {
                if (!config.owners.includes(message.author.id)) {
            return message.channel.send("Nie masz permisji do tej komendy")
        }
        let query = args.join(' ');
        if (!query) query = "client"
        try {
            const { inspect } = require('util');

            const nl = '!!NL!!';
            const nlPattern = new RegExp(nl, 'g');
            let cmd = require('node-cmd');

            let lastResult;
            let hrStart;
            let hrDiff;

            function evald() {

                try {
                    const hrStart = process.hrtime();
                    lastResult = eval(query)

                    hrDiff = process.hrtime(hrStart);
                } catch (err) {
                    const embederror = new Discord.MessageEmbed()
                        .setTitle('Błąd')
                        .setDescription(`Kod:\`\`\`js\n${query}\n\`\`\`\n Zwrócona Wartość: *Czas odpowiedzi: ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.* \`\`\`js\n${err}\n\`\`\``)
                        .setColor('RED')
                        .setAuthor(`${message.author.tag}`, `${message.author.displayAvatarURL()}`);

                    return message.channel.send(embederror);
                }

                hrStart = process.hrtime();

                formatsend(lastResult);
            }

            function formatsend(result) {
                const inspected = inspect(result, { depth: 0 })
                    .replace(nlPattern, '\n')
                    .replace(client.token, 'Kolego co to znaczy "Token"? Bo ja nie wiem')
                const split = inspected.split('\n');
                const last = inspected.length - 1;
                const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0];
                const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
                    split[split.length - 1] :
                    inspected[last];
                const embedgut = new Discord.MessageEmbed()
                    .setTitle('Eval')
                    .setDescription(`Kod:\`\`\`js\n${query} \n\`\`\`\n Zwrócona Wartość: *Czas odpowiedzi: ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*\`\`\`js\n${inspected} \n\`\`\`\n Typ:\`\`\`yaml\n${typeof lastResult}\n\`\`\``)
                    .setColor('GREEN')
                    .setAuthor(`${message.author.tag}`, `${message.author.displayAvatarURL()}`);

                message.channel.send(embedgut);
            }

            function sensitivePattern() {
                if (!this._sensitivePattern) {
                    let pattern = '';
                    if (client.token) pattern += escapeRegex(client.token);
                    Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi') });
                }
                return this._sensitivePattern;
            }

            evald()
        } catch (err) {
            const embederror = new Discord.MessageEmbed()
                .setTitle('Błąd')
                .setDescription(`📥\`\`\`js\n${query}\n\`\`\`\n 📤\`\`\`yaml\n${err}\n\`\`\``)
                .setColor('RED')
                .setAuthor(`${message.author.tag}`, `${message.author.displayAvatarURL()}`);
            return message.channel.send(embederror);
        }
    }
}
