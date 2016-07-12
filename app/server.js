// example bot
import botkit from 'botkit';
import Yelp from 'yelp';

const yelp = new Yelp({
  consumer_key: 'IM0YqSvvXsfxfVk_J84yCQ',
  consumer_secret: 'ZniS0A9AFXpG9Ihag8C4xtI-VLU',
  token: 'vPhX5C55cWGKZtbEo2mBHH81A8HWW2YT',
  token_secret: 'b0LuJSsZ9MvyPo6D2hzgAb2FeSo',
});

// botkit controller
const controller = botkit.slackbot({
  debug: false,
});

/* THE FOLLOWING CODE USES PIECES FROM https://github.com/howdyai/botkit/blob/master/examples/convo_bot.js,
FROM https://github.com/olalonde/node-yelp, AND ALSO USES PIECES DERIVED FROM DISCUSSIONS WITH MANMEET GUJRAL*/
controller.hears(['food', 'hungry', 'breakfast', 'lunch', 'dinner'],
['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  const getYelpResults = (response, convo, businesses) => {
    if (businesses.length > 0) {
      const yelpResults = {
        text: `${businesses[0].name}'s Rating: ${businesses[0].rating}`,
        attachments: [
          {
            title: `${businesses[0].name}`,
            image_url: businesses[0].image_url,
            text: businesses[0].snippet_text,
            color: '#336699',
          },
        ],
      };
      bot.reply(message, yelpResults);
      convo.next();
    } else {
      convo.say('Oops! There are no results!');
    }
  };

  const findFood = (response, convo, foodType) => {
    yelp.search({ term: foodType, location: response.text, sort: 1 })
    .then(data => {
      getYelpResults(response, convo, data.businesses);
      convo.next();
    })
    .catch(err => {
      convo.say('Oops! Looks like I messed up. Try typing \'food\' again!');
      convo.next();
    });
  };

  const askWhere = (response, convo, foodType) => {
    convo.ask('Which city are you in?', (responseNew, convoNew, foodTypeNew) => {
      convo.next();
      findFood(responseNew, convoNew, response.text);
      convo.next();
    });
  };

  const askType = (response, convo) => {
    convo.ask('What kind of food would you like?', (responseNew, convoNew) => {
      convo.next();
      askWhere(responseNew, convoNew);
      convo.next();
    });
  };

  const askIf = (response, convo) => {
    convo.ask('Would you like to order food?', [
      {
        pattern: bot.utterances.yes,
        callback: (responseNew, convoNew) => {
          convo.next();
          askType(responseNew, convoNew);
          convo.next();
        },
      },
      {
        pattern: bot.utterances.no,
        callback: (responseNew, convoNew) => {
          convo.say('Okay!');
          convo.next();
        },
      },
    ]);
  };

  bot.startConversation(message, askIf);
});
/* THE PREVIOUS CODE USES PIECES FROM https://github.com/howdyai/botkit/blob/master/examples/convo_bot.js,
FROM https://github.com/olalonde/node-yelp, AND ALSO USES PIECES DERIVED FROM DISCUSSIONS WITH MANMEET GUJRAL*/


// initialize slackbot
const slackbot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
  // this grabs the slack token we exported earlier
}).startRTM(err => {
  // start the real time message client
  if (err) { throw new Error(err); }
});

// prepare webhook
// for now we won't use this but feel free to look up slack webhooks
controller.setupWebserver(process.env.PORT || 3001, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, slackbot, () => {
    if (err) { throw new Error(err); }
  });
});

// example hello response
controller.hears(['hello', 'hi', 'howdy'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Hello there!');
});

controller.hears(['who am i', 'what is my name'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `You are ${res.user.name}!`);
    } else {
      bot.reply(message, 'I have no clue!');
    }
  });
});

// FOLLOWING CODE FROM ASSIGNMENT README
controller.on('botmot wake up!', (bot, message) => {
  bot.replyPublic(message, 'yeah yeah');
});
// PRECEDING CODE FROM ASSIGNMENT README

// FOLLOWING CODE ADAPTED FROM https://github.com/howdyai/botkit#botreply
controller.hears('send a gif', 'direct_message,direct_mention', (bot, message) => {
  const attachmentReply = {
    username: 'botmot',
    attachments: [
      {
        fallback: 'It\'s a gif, I swear.',
        title: 'Here\'s your gif!',
        text: 'http://gph.is/1rNJcXo',
        color: '#7CD197',
      },
    ],
  };

  bot.reply(message, attachmentReply);
});
// PRECEDING CODE ADAPTED FROM https://github.com/howdyai/botkit#botreply

controller.hears(['^((?!send a gif|botmot wake up!|who am i|what is my name|hi|howdy|hello|food|hungry|breakfast|lunch|dinner|help).)*$'],
['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'I have no clue what you\'re saying! Type \'help\' to check out my functions ;)');
});

controller.hears(['help'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Type \'hi\', \'hello\', or \'howdy\' to make me say hey!');
  bot.reply(message, 'Type \'who am i\' or \'what is my name\' to make me remind you of who you are!');
  bot.reply(message, 'Type \'send a gif\' to make me send you a gif!');
  bot.reply(message, 'Type \'botmot wake up!\' to rouse me from my slumber!');
  bot.reply(message, 'Type \'food\', \'hungry\', \'breakfast\', \'lunch\', or \'dinner\' to search for some food!');
});
