var Twitter = require('twitter');
var request = require('request');
var express = require('express');
var moment = require('moment');

const PORT = process.env.PORT;

var app = express();

var T = new Twitter({
    consumer_key: '..',
    consumer_secret: '..',
    access_token_key: '..',
    access_token_secret: '..',
});

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
    url: 'https://www.yugioh-card.com/uk/gameplay/detail.php?id=1155',
    method: 'GET',
    headers: headers
}

app.get('/', function (req, res) {
    res.send('Hello!');
})

var server = app.listen(PORT, function () {
    var host = server.address().address;
    var post = server.address().port;

    console.log("Listening")
})

var banlistHtml = '';
var banlistHtml2 = '';

function doesLastTweetEqualThisAttempt (tweetAttempt) {
    T.get('statuses/user_timeline', {screen_name: 'ygobanlistbot', count: 1}, function (err, tweets, response) {
      if(err){
          console.log(err[0].message)
      }
      else {
          console.log("I'm checking to see if the last tweet equals this attempt.");
          return tweets[0].text === tweetAttempt;
      }
    })
}

function konamiRequest() {

    // get the current date - ignoring time
    var currentDate = moment().startOf('day');
    var effectiveDate;

    request(optionsA, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            banlistHtml = response.body;
        }
    });

    var effectiveFrom = banlistHtml.match('Effective from ([A-Za-z]{2,10}) ([0-9]{2})([A-Za-z]{2}), ([0-9]{4})');
    console.log("Checking the banlist...");

    if (effectiveFrom != null) {
        var dateFromArray = effectiveFrom[0];
        var tweet = 'The YuGiOh banlist has been updated! ' + dateFromArray;
        effectiveDateFromArray = dateFromArray.match('([A-Za-z]{2,10}) ([0-9]{2})([A-Za-z]{2}), ([0-9]{4})');
        var effectiveDate = moment(effectiveDateFromArray, 'MMMM Do, YYYY');

        if (!doesLastTweetEqualThisAttempt(tweet) && effectiveDate.isSameOrAfter(currentDate)) {
            T.post('statuses/update', {status: tweet}, function (err, data, response) {
                console.log(data)
            });
            console.log("I should have tweeted that the banlist updated");
            return;
        }
    }

    request(optionsB, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            banlistHtml2 = response.body;
        }
    })

    effectiveFrom = banlistHtml2.match('Effective from ([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)([2][0]([0-9][0-9]))');
    console.log("Checking the banlist...");

    if (effectiveFrom != null) {
        effectiveDate = effectiveFrom[0].match('([0-2][0-9]|(3)[0-1])(/)(((0)[0-9])|((1)[0-2]))(/)([2][0]([0-9][0-9]))');
        var splitDate = effectiveDate[0].split('/');
        var month = splitDate[1] - 1; //Javascript months are 0-11
        var dateObj = new Date(splitDate[2], month, splitDate[0]);
            var d2 = moment(dateObj);
            var tweet = 'The YuGiOh banlist has been updated! Effective from ' + effectiveDate[0];

            if (d2.isSameOrAfter(currentDate) && !doesLastTweetEqualThisAttempt(tweet)) {
            T.post('statuses/update', {status: tweet}, function (err, data, response) {
                console.log(data);
            });
            console.log("I should have tweeted that the banlist updated");
        }
    }
}

setInterval(konamiRequest, 10000);
