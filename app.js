var Twitter = require('twitter');
var request = require('request');
var express = require('express');

const PORT = process.env.PORT;

var app = express();

var T = new Twitter({
    consumer_key: '..',
    consumer_secret: '..',
    access_token_key: '..',
    access_token_secret: '..',
});
var lastDate = '';

var headers = {
    'User-Agent': 'YgoBanlistBot/1.0.0',
    'Content-Type': 'application/x-www-form-urlencoded'
}

var options = {
    url: 'http://www.yugioh-card.com/en/limited',
    method: 'GET',
    headers: headers
}

app.get('/', function (req, res) {
    res.send('Hello!');
})

var server = app.listen(PORT, function () {
    var host = server.address().address
    var post = server.address().port

    console.log("Listening")
})

var banlistHtml = '';

function konamiRequest() {

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            banlistHtml = response.body;
        }
    })

    var effectiveFrom = banlistHtml.match('Effective from ([A-Za-z]{2,10}) ([0-9]{2}), ([0-9]{4})');

    if (effectiveFrom != null) {
        effectiveDate = effectiveFrom[0].match('([A-Za-z]{2,10}) ([0-9]{2}), ([0-9]{4})');
        var d1 = Date.parse(effectiveDate[0]);

        if (d1 >= Date.now() && d1 != lastDate) {
            var tweet = 'The YuGiOh banlist has been updated! Effective from ' + effectiveDate[0];
            T.post('statuses/update', {status: tweet}, function (err, data, response) {
                console.log(data)
            })
            console.log("I should have tweeted that the banlist updated");
            lastDate = d1;
        }
    }
}

setInterval(konamiRequest, 120000); //runs every 2 minutes
