var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');
var sportyBot = require('./sportybot.js');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=0c905241-26bd-423a-abe4-ee8023407c06&subscription-key=872d6080d6db4d21a00e532fae97347c&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);
//=========================================================
// Bots Dialogs
//=========================================================

dialog.matches('ShowResults', [
    function (session, args) {
        var sporty = sportyBot.createSportyEntity(builder, args.entities);

        if (sporty.dateTime) {
            var msg = sportyBot.createMessage(builder, session,
                sportyBot.createCard(builder, sporty.league, 'show results', 'Will show results for ' + sporty.league + ' in the period ' + sporty.dateTime));

            bot.send(msg, function (err) {
                session.send(err);
            });
        } else {
            session.send('will show result for %s', sporty.league);
        }
    }
]);

dialog.matches('ShowFixtures', [
    function (session, args) {
        var sporty = sportyBot.createSportyEntity(builder, args.entities);

        if (sporty.dateTime) {
            var msg = sportyBot.createMessage(builder, session,
                sportyBot.createCard(builder, sporty.league, 'show fixtures', 'Will show fixtures for ' + sporty.league + ' in the period ' + sporty.dateTime));

            bot.send(msg, function (err) {
                session.send(err);
            });
        } else {

            http.get({
                host: 'api.football-data.org',
                path: '/v1/competitions/426/fixtures?matchday=9'
            }, function (response) {
                // Continuously update stream with data
                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('end', function () {
                            
                    // Data reception is done, do whatever with it!
                    var parsed = JSON.parse(body);
                    bot.send(sportyBot.createMessage(builder, session,
                        sportyBot.createCard(builder, 'Fixtures', 'Premier League', sportyBot.fixturesHandler(parsed.fixtures))));
                });
            });
            //session.send('will show fixtures for %s', sporty.league);
        }
    }
]);

dialog.matches('ShowStandings', [
    function (session, args) {
        var sporty = sportyBot.createSportyEntity(builder, args.entities);

        if (sporty.dateTime) {
            var msg = sportyBot.createMessage(builder, session,
                sportyBot.createCard(builder, sporty.league, 'show standings', 'Will show standings for ' + sporty.league + ' in the period ' + sporty.dateTime));

            bot.send(msg, function (err) {
                session.send(err);
            });
        } else {
            session.send('will show standings for %s', sporty.league);
        }
    }
]);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand."));

