const Discord = require('discord.js');
const fs = require('fs');
const config = require('../config')

module.exports = {
    name: 'submit',
    desc: 'this is a submit command',

    execute(client, message, battleScheduler, args) {

        console.log(message.author.id + ' attempted submit');
        console.log('Submit is ' + battleScheduler.isSubmitOpen);

        if (!battleScheduler.isSubmitOpen)
            message.channel.send('Sorry, submissions are currently closed');

        else if (battleScheduler.userList.hasOwnProperty(args))
            message.channel.send('Sorry, you have already submitted');

        else {
            var userId = '<@!' + message.author.id + '>';
            battleScheduler.userList[userId] = 0;

            // send submitted track to vote channel
            client.channels.cache.get(config.submit_channel_id).send('<@!' + message.author.id + '> -- ' + args)

            console.log('Beat submitted');
        }
    }
}