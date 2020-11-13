const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'submit',
    desc: 'this is a submit command',

    execute(client, message, args){

        // test channel
        const CHANNEL_ID = '775904842135765033';
        
        // send submitted track to vote channel
        client.channels.cache.get(CHANNEL_ID).send('<@!' + message.author.id + '> -- ' + args)
        
        console.log('Beat submitted');
    }
}