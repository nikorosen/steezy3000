const Discord = require('discord.js');

module.exports = {
    name: 'vote',
    desc: 'this is a vote command',

    execute(client, message, args){

        // test channel
        const CHANNEL_ID = '775904842135765033';
        
        // send submitted track to vote channel
        client.channels.cache.get(CHANNEL_ID)
            .send('<@!' + message.author.id + '> voted for ' + args);
        
        console.log('Beat submitted');
    }
}