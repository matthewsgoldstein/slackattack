// example bot
import botkit from 'botkit';
const Yelp = require('yelp');

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

console.log('starting bot');

controller.hears(['food', 'hungry', 'breakfast', 'lunch', 'dinner'], 'direct_message,direct_mention,mention', (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (!err) {
      convo.say('Hey there!');
      convo.ask('Would you like to order food?', [
        {
          pattern: ['yes', 'yeah', 'sure', 'y', 'ok', 'okay'],
          callback(response, convoTwo) {
            convo.ask('What kind of food would you like to order?', (responseTwo, convoThree) => {
              convo.ask(`You want to order ${response.text}?`, [
                {
                  pattern: ['yes', 'yeah', 'sure', 'y', 'ok', 'okay'],
                  callback(responseThree, convoFour) {
                    convo.ask('What city are you in?', (responseFour, convoFive) => {
                      convo.ask(`You're in ${response.text}?`, [
                        {
                          pattern: ['yes', 'yeah', 'sure', 'y', 'ok', 'okay'],
                          callback(responseFive, convoSix) {
                            convo.say('Alright, getting results now!');


                            convo.next();
                          },
                        },
                        {
                          pattern: ['no', 'nah', 'no thanks'],
                          callback(responseFive, convoSix) {
                            convo.say('Okay!');
                            convo.stop();
                          },
                        },
                      ]);
                    });
                    convo.next();
                  },
                },
                {
                  pattern: ['no', 'nah', 'no thanks'],
                  callback(responseThree, convoFour) {
                    convo.say('Okay!');
                    convo.stop();
                  },
                },
              ]);
            });
            convo.next();
          },
        },
        {
          pattern: ['no', 'nah', 'no thanks'],
          callback(response, convoTwo) {
            convo.say('Okay!');
            convo.stop();
          },
        },
      ]);
    }
  });
});


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

controller.on('user_typing', (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `${res.user.name} is typing!`);
    }
  });
});


// data.businesses.forEach(business => {
//
// });
