const Discord = require('discord.js');
const fs = require('fs');
const config = require('../config')

module.exports = {
    name: 'submit',
    desc: 'this is a submit command',

    execute(client, message, args){
        
        // send submitted track to vote channel
        client.channels.cache.get(config.submit_channel_id).send('<@!' + message.author.id + '> -- ' + args)
        
        console.log('Beat submitted');
    }
}