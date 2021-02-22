const {off} = require("process");
const db = require("better-sqlite3")("./database.db");
const config = require("../config.json")

module.exports = (bot) => {
    const url = require("url");
    const path = require("path");
    let vhost = require("vhost")

    const axios = require("axios")
    const Discord = require("discord.js");

    const express = require("express");
    const app = express();
    const moment = require("moment");
    require("moment-duration-format");

    const passport = require("passport");
    const session = require("express-session");
    const Strategy = require("passport-discord").Strategy;

    const helmet = require("helmet");

    const md = require("marked");


    const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);
    const templateDir = path.resolve(`${dataDir}${path.sep}templates`);

    app.use("/public", express.static(path.resolve(`${dataDir}${path.sep}public`)));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    function checkAuth(req, res, next) {
        if (req.isAuthenticated()) return next();
        res.redirect("/login");
    }

    const renderTemplate = (res, req, template, data = {}) => {
        const baseData = {
            client: bot,
            path: req.path,
            user: req.user
        };
        res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
    };

    passport.use(new Strategy({
            prompnt: "none",
            access_type: "online",
            clientID: bot.user.id,
            clientSecret: "w7o_yUrKVl9ORvSw3VHDWerOQxKEUPNE",
            callbackURL: "https://hasfy.pl/callback",
            scope: ["identify", "guilds"]
        },
        (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => done(null, profile));
        }));

    app.use(session({
        secret: "taviisgey",
        resave: false,
        saveUninitialized: false,
    }));

    app.engine("html", require("ejs").renderFile);
    app.set("view engine", "html");

    app.use(passport.initialize());
    app.use(passport.session());

    app.locals.domain = "https://hasfy.pl/"; //odpal nodemon


    var bodyParser = require("body-parser");
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));


    app.get("/login", (req, res, next) => {
            next();
        },
        passport.authenticate("discord"));

    app.get("/callback", passport.authenticate("discord", {failureRedirect: "/"}), (req, res) => {
        res.redirect("/dashboard");
    });

    app.get("/logout", function (req, res) {
        req.session.destroy(() => {
            req.logout();
            res.redirect("/");
        });
    });


    app.get("/", (req, res) => {
        return renderTemplate(res, req, "index.ejs");
    });

    app.get("/dashboard", checkAuth, (req, res) => {
        if (!req.user) res.redirect("/login")
        const perms = Discord.Permissions;

        return renderTemplate(res, req, "user.ejs", {perms});
    })

    app.get("/dashboard/:gID", checkAuth, async (req, res) => {
        const guild = bot.guilds.cache.get(req.params.gID);
        await bot.users.fetch(req.user.id);
        if (!guild) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot&guild_id=${req.params.gID}`);
        await guild.members.fetch(req.user.id);
        const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
        if (!isManaged && !req.session.isAdmin) return res.redirect("/dashboard");

        if (!db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)) db.prepare("INSERT INTO guilds (guildId, prefix, channel, ad, invite, gban) VALUES (?, ?, ?)").run(guild.id, config.prefix, "", "", "", "false")
        let guildSettings = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)

        return renderTemplate(res, req, "guild/dashboard.ejs", {guild, guildSettings});
    })

    app.get("/dashboard/:gID/settings", checkAuth, async (req, res) => {
        await bot.users.fetch(req.user.id);
        const guild = bot.guilds.cache.get(req.params.gID);
        if (!guild) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot&guild_id=${req.params.gID}`);
        await guild.members.fetch(req.user.id);
        const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
        if (!isManaged && !req.session.isAdmin) return res.redirect("/dashboard");

        if (!db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)) db.prepare("INSERT INTO guilds (guildId, prefix, channel, ad, invite, gban) VALUES (?, ?, ?)").run(guild.id, config.prefix, "", "", "", "false")
        let guildSettings = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)
        let alert = null
        let color = null

        renderTemplate(res, req, "guild/settings.ejs", {guild, guildSettings, alert, color});

    })

    app.post("/dashboard/:gID/settings", checkAuth, (req, res) => {
        const guild = bot.guilds.cache.get(req.params.gID);
        if (!guild) return res.redirect("/dashboard")
        const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
        if (!isManaged && !req.session.isAdmin) return res.redirect("/dashboard");

        let alert = "Ustawienia zostały zapisane!"
        let color = "green"

        if (!req.body.prefix) {
            color = "red"
            alert = "Podany przez ciebie prefix, nie może być pusty!"
        }

        if (req.body.prefix.length > 3) {
            color = "red"
            alert = "Prefix nie może być dłuższy niż 3 znaki"
        }

        if (req.body.channel === "") {
            alert = "Kanał nie może być pusty"
            color = "red"
        }

        if (req.body.prefix && req.body.prefix.length < 4 && req.body.channel) {
            db.prepare("UPDATE guilds SET prefix = ?, channel = ? WHERE guildId = ?").run(req.body.prefix, req.body.channel, guild.id)

            guild.prefix = req.body.prefix
        }

        let guildSettings = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)

        renderTemplate(res, req, "guild/settings.ejs", {guild, guildSettings, alert, color});
    })

    app.get("/dashboard/:gID/ads", checkAuth, (req, res) => {
        const guild = bot.guilds.cache.get(req.params.gID);
        if (!guild) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot&guild_id=${req.params.gID}`);
        const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
        if (!isManaged && !req.session.isAdmin) return res.redirect("/dashboard");

        if (!db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)) db.prepare("INSERT INTO guilds (guildId, prefix, channel, ad, invite, gban) VALUES (?, ?, ?)").run(guild.id, config.prefix, "", "", "", "false")
        let guildSettings = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)
        let alert = null
        let color = null

        renderTemplate(res, req, "guild/ads.ejs", {guild, guildSettings, alert, color});

    })

    app.post("/dashboard/:gID/ads", checkAuth, (req, res) => {
        const guild = bot.guilds.cache.get(req.params.gID);
        if (!guild) return res.redirect("/dashboard")
        const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
        if (!isManaged && !req.session.isAdmin) return res.redirect("/dashboard");

        let guildSettings = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)

        let alert = "Reklama została wysłana do weryfikacji!"
        let color = "green"

        if (!req.body.serverad) {
            color = "red"
            alert = "Reklama nie może być pusta"
        }

        if (req.body.serverad.length < 26) {
            color = "red"
            alert = "Reklama musi zawierać minimum 25 znaków"
        }

        if (req.body.serverad.length > 1000) {
            color = "red"
            alert = "Rekalama nie może zawierać więcej niż 1000 znaków"
        }

        if (!guildSettings.channel) {
            color = "red"
            alert = "Kanał reklam nie został ustawiony."
        }

        const adStatus = db.prepare("SELECT * FROM adsCheck WHERE guildId = ?").get(guild.id);
        if (adStatus) {
            color = "red"
            alert = "Twój serwer ma już reklame w trakcie weryfikacji"
        }

        let errBlacklist = false;
        const blackList = ["discord.gg/", "discord.com/invite", "discordapp.com/invite", "nadsc.pl", "marketingbot.tk", "market-bot.pl"];

        blackList.forEach(word => {
            if (req.body.serverad.includes(word)) errBlacklist = true;
        });

        if (errBlacklist === true) {
            color = "red"
            alert = "Reklama nie może zawierać linków."
        }

        if (req.body.serverad && req.body.serverad.length > 25 && !adStatus && errBlacklist === false && req.body.serverad.length < 1001 && guildSettings.channel) {
            db.prepare("UPDATE guilds SET ad = ? WHERE guildId = ?").run(req.body.serverad, guild.id)

            db.prepare("INSERT INTO adsCheck (guildId, content, user, nic) VALUES (?,?,?,?)").run(guild.id, req.body.serverad, req.user.id, "nic")

            let user = bot.users.cache.get(req.user.id)

            let weryfikacja = new Discord.MessageEmbed()
                .setAuthor("Ustawiono nową reklamę!", bot.user.displayAvatarURL())
                .setColor(bot.config.mainColor)
                .addField("**\`Osoba:\`**", `\`${user.tag} \` [\`(${user.id})\` (<@!${user.id}>)]`)
                .addField("**\`Serwer:\`**", `\`${guild.name} (${guild.id})\``)
                .addField("**\`Zaproszenie do serwera:\`**", `[\`${guildSettings.invite}\`](${guildSettings.invite})`)
                .addField("**\`Treść reklamy:\`**", `${req.body.serverad}`)
                .setFooter(`System weryfikacji reklam | By: Hamish | ${bot.user.username}`)
            bot.channels.cache.get("779147106208186389").send(weryfikacja);
        }

        renderTemplate(res, req, "guild/ads.ejs", {guild, guildSettings, alert, color});
    })

    app.get("/dashboard/:gID/customlink", checkAuth, (req, res) => {
        const guild = bot.guilds.cache.get(req.params.gID);
        if (!guild) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot&guild_id=${req.params.gID}`);
        const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
        if (!isManaged && !req.session.isAdmin) return res.redirect("/dashboard");

        if (!db.prepare("SELECT * FROM links WHERE guildId = ?").get(guild.id)) db.prepare("INSERT INTO links (guildId, link, desc, background, color, autorecredit) VALUES (?, ?, ?, ?, ?, ?)").run(guild.id, "", "", "", "", "false")
        let guildLink = db.prepare("SELECT * FROM links WHERE guildId = ?").get(guild.id)

        let guildPremium = db.prepare("SELECT * FROM premium WHERE guildId = ?").get(guild.id)
        let alert = null
        let color = null

        renderTemplate(res, req, "guild/customlink.ejs", {guild, guildLink, alert, color, guildPremium});

    })

    app.post("/dashboard/:gID/customlink", checkAuth, (req, res) => {
        const guild = bot.guilds.cache.get(req.params.gID);
        if (!guild) return res.redirect("/dashboard")
        const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
        if (!isManaged && !req.session.isAdmin) return res.redirect("/dashboard");
        let guildLink = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)

        let guildPremium = db.prepare("SELECT * FROM premium WHERE guildId = ?").get(guild.id)

        let alert = "Link został dodany"
        let color = "green"

        if (!req.body.link || !req.body.background || !req.body.description || !req.body.color) {
            alert = "Upewnij się że wszystkie pola zostały wypełnione"
            color = "red"
        }

        let istniejacy = false
        let istniejacycheck = db.prepare("SELECT * FROM links WHERE link = ?").get(req.body.link)
        if (istniejacycheck) {
            if (istniejacycheck.guildId === guild.id) {
                istniejacy = false
            } else {
                alert = "Link o takiej nazwie już istnieje"
                color = "red"
                istniejacy = true
            }
        }

        if (req.body.background && req.body.description && req.body.color && req.body.link && istniejacy === false) {
            db.prepare("UPDATE links SET link = ?, desc = ?, background = ?, color = ?, autorecredit = ? WHERE guildId = ?").run(req.body.link, req.body.description, req.body.background, req.body.color, req.body.autorecredit, guild.id)
        }
        renderTemplate(res, req, "guild/customlink.ejs", {guild, guildLink, alert, color, guildPremium});
    })

    app.get("/l/:linkName", (req, res) => {
        let link = db.prepare("SELECT * FROM links WHERE link = ?").get(req.params.linkName)
        if (!link) return res.redirect("/")
        let guild = bot.guilds.cache.get(link.guildId)
        if (!guild) return res.redirect("/")
        let guildData = db.prepare("SELECT * FROM guilds WHERE guildId = ?").get(guild.id)

        if (link.autorecredit == "on") {
            return res.redirect(guildData.invite)
        }

        renderTemplate(res, req, "link.ejs", {guild, link, guildData});
    })

    app.get("/owner", checkAuth, (req, res) => {
        if (req.user.id !== "451004306477547527") return res.redirect("/")

        renderTemplate(res, req, "owner.ejs");
    })

    app.get("/owner/logs", checkAuth, (req, res) => {
        if (req.user.id !== "451004306477547527") return res.redirect("/")
        let logs = db.prepare("SELECT * FROM logs WHERE nic = ?").all("nic")

        renderTemplate(res, req, "logs.ejs", {logs});
    })


    app.get("/support", (req, res) => {
        res.redirect("https://discord.gg/xsZ84fHfqM")
    })

    app.get("/invite", (req, res) => {
        res.redirect("https://discord.chttps://discord.com/api/oauth2/authorize?client_id=800031307656593418&permissions=8&redirect_uri=https%3A%2F%2Fhasfy.pl%2Fcallback&scope=bot")
    })

    app.use(function (req, res, next) {
        renderTemplate(res, req, "404.ejs");
    })

    app.use(function (err, req, res, next) {

        console.log(err)
        let user = bot.users.cache.get(req.user.id)

        let embed = new Discord.MessageEmbed()
            .setTitle(`Wystąpił błąd w panelu!`)
            .addField(`> **\`Użytkownik który wykrył błąd:\`**`, `**${user.tag}** (\`${req.user.id}\`)`)
            .addField(`> **\`Błąd:\`**`, "```yaml\n" + err + "```")
            .setColor("RED")

        bot.channels.cache.get(config.errorLogs).send(embed)
        renderTemplate(res, req, "500.ejs");
    })

    bot.site = app.listen(80);
}
