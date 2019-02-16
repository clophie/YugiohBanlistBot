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

var optionsA = {
    url: 'http://www.yugioh-card.com/en/limited',
    method: 'GET',
    headers: headers
}

var optionsB = {
    url: 'http://www.yugioh-card.com/oc/limited',
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

function doesLastTweetEqualThisAttempt (tweetAttempt) {
    T.get('statuses/user_timeline', {screen_name: ygobanlistbot}, {count: 1}, function (err, data, response) {
      var parsedResponse = JSON.parse(data);
      return equals(parsedResponse["text"], tweetAttempt);
    })
}

function konamiRequest() {

    // get the current date - ignoring time
    var tempDate = new Date();
    var currentDate = new Date (tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate());
    var effectiveDate;

    request(optionsA, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            banlistHtml = response.body;
        }
    });

    var effectiveFrom = banlistHtml.match('Effective from ([A-Za-z]{2,10}) ([0-9]{2}), ([0-9]{4})');
    console.log("Checking the banlist...");

    if (effectiveFrom != null) {
        effectiveDate = effectiveFrom[0].match('([A-Za-z]{2,10}) ([0-9]{2}), ([0-9]{4})');
        var d1 = Date.parse(effectiveDate[0]);
        var tweet = 'The YuGiOh banlist has been updated! Effective from ' + effectiveDate[0];

        if (d1 >= currentDate && !doesLastTweetEqualThisAttempt(tweet)) {
            T.post('statuses/update', {status: tweet}, function (err, data, response) {
                console.log(data)
            });
            console.log("I should have tweeted that the banlist updated");
            return;
        }
    }

    request(optionsB, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            banlistHtml = response.body;
        }
    })

    effectiveFrom = banlistHtml.match('Effective from ^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$');
    console.log("Checking the banlist...");

    if (effectiveFrom != null) {
        effectiveDate = effectiveFrom[0].match('^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$');
        var splitDate = effectiveDate.split('/');
        var month = splitDate[1] - 1; //Javascript months are 0-11

        var d2 = new Date(splitDate[2], month, splitDate[0]);
        var tweet = 'The YuGiOh banlist has been updated! Effective from ' + effectiveDate[0];

        if (d2 >= currentDate && !doesLastTweetEqualThisAttempt(tweet)) {
            T.post('statuses/update', {status: tweet}, function (err, data, response) {
                console.log(data)
            });
            console.log("I should have tweeted that the banlist updated");
        }
    }
}

setInterval(konamiRequest, 120000); //runs every 2 minutes
