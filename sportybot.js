module.exports = {

    createMessage: function (builder, session, card) {
        return new builder.Message()
            .address(session.message.address)
            .attachments([card]);
    },
    createCard: function (builder, title, subtitle, text) {
        return new builder.ThumbnailCard()
            .title(title)
            .subtitle(subtitle)
            .text(text);
    },
    createSportyEntity: function (builder, entities) {
        var sporty = {}

        var league = builder.EntityRecognizer.findEntity(entities, 'League');
        sporty.league = league ? league.entity : undefined;
        var dateTime = builder.EntityRecognizer.findEntity(entities, 'builtin.datetime.date');
        sporty.dateTime = dateTime ? dateTime.resolution.date : undefined;

        return sporty;
    },
    fixturesHandler: function (fixtures) {
        var str = '';
        fixtures.forEach(function (fixture) {
            if (fixture !== undefined) {
                str += fixture.homeTeamName + ' - ' + fixture.awayTeamName + '\n\n';
                str += fixture.result.goalsHomeTeam + ' - ' + fixture.result.goalsAwayTeam + '\n\n';
            }
        });

        return str;
    }
}

